import fs from 'fs';
import path from 'path';
import { RuleLibrary } from '../rules/rules.js';
import utils from './utils.js'


class Parser {

    #temporaryDirectoryPath
    #destinationDirectoryPath
    #rules
    #allStreets
    #ruleLib

    constructor(temporaryDirectoryPath, destinationPathObj) {
        this.#temporaryDirectoryPath = temporaryDirectoryPath;
        this.#destinationDirectoryPath = destinationPathObj.path;
        this.#allStreets = new Map();
        this.#ruleLib = new RuleLibrary();

    }

    parse() {
        let filenames = this.#getTemporaryFilenames(this.#temporaryDirectoryPath);

        console.log(filenames);

        for (let filename of filenames) {
            let tempFilePath = path.join(this.#temporaryDirectoryPath, filename);
            this.#parseFile(tempFilePath, filename);
        }

        this.#writeToDestinationFile(this.#getAllStreetsAsArray());
        
    }

    #parseFile(tempFilePath, filename) {
        console.log("Parsing temporary file: " + filename);

        let year = this.#getYearFromFilename(filename);
        let lines = this.#getFileContentasArray(tempFilePath);

        let currentStreet = null;
        let currentPostal = null;
        let currentCity = null;
        let currentPerson = null;

        let totalLines = lines.length;
        let successfulLines = 0;
        let failedLines = 0;
        let ignoredLines = 0;

        let peopleArray = [];
        
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            // Test if line is of type to be disregarded
            if (this.#ruleLib.matchesType(line, year, "disregard")) { 
                ignoredLines++;
                continue;
             }
            
            // Test if line contain street
            let streetMatch = this.#ruleLib.matchesType(line, year, "street");
            if(streetMatch) {
                successfulLines++;

                currentStreet = streetMatch.groups.street;
                currentPostal = null;
                currentCity = null;
                let foundStreetOnPreviousLine = true;
            }

            // Test if line contains postal code and city (but only if not currently any registered)
            if (!currentPostal && !currentCity) {
                let postalCityMatch = this.#ruleLib.matchesType(line, year, "postalCity");
                if (postalCityMatch) {
                    successfulLines++;

                    currentPostal = postalCityMatch.groups.postal;
                    currentCity = postalCityMatch.groups.city;
                    this.#addStreet(currentStreet, currentPostal, currentCity);
                }
            }

            // Test if line contains a name (if yes, then test for street number)
            let nameMatch = this.#ruleLib.matchesType(line, year, "nameHousenumber");
            if (nameMatch) {
                successfulLines++;

                let rawName = nameMatch.groups.name;
                let cleanedName = this.#cleanName(rawName);
                currentPerson = {
                    lastName: cleanedName.lastName,
                    name: cleanedName.name,
                    number: null
                }

                if (nameMatch.groups.number) {
                    let cleanedNumber = this.#cleanStreetNumber(nameMatch.groups.number);
                    currentPerson.number = cleanedNumber;
                }
                console.log(currentPerson);

                // See if there is a phonenumber in the same line; if not, look X lines ahead to check
                let phoneMatch = this.#ruleLib.matchesType(line, year, "phone");
                
            }

            currentPerson = null;
        }

        console.log("Succesful lines = " + successfulLines);
        console.log("Disregarded lines = " + ignoredLines);

        // this.#writeToDestinationFile(outputArray, year);
    }

    #cleanName(str) {
        let newStr = str.trim();
        let names = newStr.split(/\s+/);
        let nameData = {}
        nameData.lastName = names[0];
        nameData.name = names[1];
        return nameData;
    }

    #cleanStreetNumber(str) {
        let res = str.replace(/\D/g, "")
        
        return Number(res);
    }

    #getFileContentasArray(tempFilePath) {
        try {
            let content = fs.readFileSync(tempFilePath, 'utf-8');
            return content.split("\n");
        } catch {
            throw new Error("There was a problem reading the temporary file.")
        }
    }

    #writeToDestinationFile(dataArray, year = null) {
        if (!year) {
            year = "streets";
        }
        let filename = year + ".ndjson";
        console.log("Writing to file: " + filename);
        let destFilePath = path.join(this.#destinationDirectoryPath, filename);
        let filePtr;

        try {
            filePtr = fs.openSync(destFilePath, 'w');
            for (let el of dataArray) {
                let jsonEl = JSON.stringify(el);
                fs.appendFileSync(filePtr, jsonEl + "\n", 'utf-8');
            }
        } catch {
            throw new Error("Something went wrong when saving json output to file.");
        } finally {
            if (filePtr) {
                fs.closeSync(filePtr);
            }
        }
    }

    #addStreet(streetname, postalCode, city) {
        if (this.#allStreets.has(streetname)) {
            return;
        }

        this.#allStreets.set(streetname, {
            street: streetname,
            postal: postalCode,
            city: city
        });
    }

    #getAllStreetsAsArray() {
        let res = []
        let iter = this.#allStreets.entries();
        for (let [street, data] of iter) {
            res.push(data);
        }
        return res;
    }

    #getTemporaryFilenames(dir) {
        let filenames = utils.getFileNamesInDirectory(dir);
        return filenames.filter((filename) => this.#isValidFilename);

    }

    #isValidFilename(filename) {
        return /^[^_.].*\.txt$/i.test(filename); // Does not begin with _ or. and ends with .txt
    }

    #getYearFromFilename(filename) {
        let match = /\d{4}/i.exec(filename);
        if (match) {
            return match[0];
        } else {
            throw new Error("Filename: " + filename + " did not contain a proper year");
        }
    }
}

export { Parser }





















/*


let outputToMultipleFiles = true;

let outputFile = "../data/data.json";

let basePath = "/Volumes/Seagate/Krak/extracts/";
let filenames = fs.readdirSync(basePath);

// Regex patterns for various elements
let regexes = {
    gadenavn: /(^\d| )?(?<gadenavn>[A-ZÆØÅ]+(?:\s|[A-ZÆØÅ]|\W)*[A-ZÆØÅ]+$)/,   // capturing group: gadenavn
    kommune: /^Kommune\W+(?<kommunenavn>[A-Za-zÆØæøå]*$)/,            // capturing group: kommunenavn
    postnr: /^(?<postnr>(?:\d|[^A-ZÆØÅa-zæøå ]){4}) +(?<by>[A-Za-zÆØÅæøå ]+)/,     // capturing groups: postnr og by
    name: /^(?<nummer>(?:. |\d+))*(?<navn>[A-ZÆØÅ][a-zæøå]+(?: [A-ZÆØÅ][a-zæøå]+)*)/, // capturing groups: number + navn
    phone: /(?<!\d)(?<phone>\d[\d ,]*|Hem.nr.)$/,                   // Virker ikke helt; gruppen phone returnerer også enkelte tal
    disregards: /Sogn|Valgkr.+|Politikr.+|Politist.+|Kvarter|Lokalcenter|Kort|\(.+\)/
}

// Dataoutput
let collection = {
    info: "Dette er et datasæt over Kraks gaderegistre fra 2001-2007. Bemærk at årene 2003-2007 er registreret som 2003-2004, 2004-2005, 2005-2006, mv.",
    gadenavne: [],
    data: []
}

// run();

// Reader
function run() {
     for (let filename of filenames) {
        if (filename[0] === ".") { continue; }

        let fullPath = path.join(basePath, filename)
        let data = fs.readFileSync(fullPath, 'utf-8');
            
        parseFile(filename, data);
        
        // Output to file
        printData(data);
        let json = JSON.stringify(collection, null, 2);
        let writePath = path.join(basePath, "output.json");
        fs.writeFileSync(writePath, json, 'utf-8');

    }
}

    function printData(data) {

}

// A function that takes a filename of the current file and the file content as a string
function parseFile(filename, data) {
    // Give me an array of lines to loop over
    let lines = data.split("\n")
    
    let successfulLines = 0;
    let abandonedLines = 0;

    let year = getYearFromFilename(filename);
    let dataObj = {
        year: year,
        people: []
    }
    collection.data.push(dataObj);

    let currentGade = null;
    let currentPostnr = null;
    let currentBy = null;

    // Going over every line
    for (let i = 0; i < 1000; i++) {
        let name;
        let phone;
        let streetNumber = null;

        if (regexes.disregards.test(lines[i])) {
            continue;
        }

        // TODO: Lav et tjek til at se, om der er noget kolofon-agtigt inden gaderne

        if (regexes.gadenavn.test(lines[i])) {
            if (regexes.postnr.test(lines[i+1])) {
                currentGade = regexes.gadenavn.exec(lines[i]).groups.gadenavn;
                let streetInfo = regexes.postnr.exec(lines[i+1]);
                currentPostnr = streetInfo.groups.postnr;
                currentBy = streetInfo.groups.by;
                collection.gadenavne.push(currentGade);

                console.log(currentGade + ": " + currentPostnr + " " + currentBy)
            }
            
        }

        if (currentGade) {
            if (regexes.name.test(lines[i]) && !regexes.disregards.test(lines[i])) { // if a line contains a name
                let res = regexes.name.exec(lines[i]);
                name = cleanName(res.groups.navn);
                if (res.groups.nummer) {
                    streetNumber = cleanStreetNumber(res.groups.nummer);
                }
                if (regexes.phone.test(lines[i])) {
                    let phoneRes = regexes.phone.exec(lines[i]);
                    phone = cleanPhoneNumber(phoneRes.groups.phone);
                } else if (regexes.phone.test(lines[i+1])) {
                    let phoneRes = regexes.phone.exec(lines[i+1]);
                    phone = cleanPhoneNumber(phoneRes.groups.phone);
                } else {
                    phone = null;
                }

                let obj = {
                    lastName: name.lastName,
                    name: name.name,
                    phone: phone,
                    street: currentGade,
                    streetNumber: streetNumber,
                    postal: currentPostnr,
                    city: currentBy
                }
                dataObj.people.push(obj)

            }
        }
    }

    
}

function getYearFromFilename(filename) {
    let yearStr = filename.split("-")[0];
    let year = undefined;
    try {
        year = Number(yearStr);
    } catch {
        throw new Error("Conversion to number failed.")
    }
    return year;
}

function cleanPhoneNumber(str) {
    let res = str.replace(/\D/g, "")
    
    return Number(res);
}

function cleanName(str) {
    let newStr = str.trim();
    let names = newStr.split(/\s+/);
    let nameData = {}
    nameData.lastName = names[0];
    nameData.name = names[1];
    return nameData;
}

function cleanStreetNumber(str) {
    let res = str.replace(/\D/g, "")
    
    return Number(res);
}
*/