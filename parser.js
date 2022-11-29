let fs = require('fs');
const { runMain } = require('module');
const { parse } = require('path');
let path = require('path');
const { runInContext } = require('vm');

let basePath = "/Volumes/Seagate/Krak/extracts";
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

run();

// Reader
function run() {
    for (let filename of filenames) {
        if (filename[0] === ".") { continue; }

        let fullPath = path.join(basePath, filename)
        let data = fs.readFileSync(fullPath, 'utf-8');
            
        parseFile(filename, data);
        
        // Output to file
        let json = JSON.stringify(collection, null, 2);
        let writePath = path.join(basePath, "output.json");
        fs.writeFileSync(writePath, json, 'utf-8');

    }
}

// A function that takes a filename of the current file and the file content as a string
function parseFile(filename, data) {
    // Give me an array of lines to loop over
    let lines = data.split("\n")
    
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
                    name: name,
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
    let cleanedString = "";
    return str;
}

function cleanStreetNumber(str) {
    let res = str.replace(/\D/g, "")
    
    return Number(res);
}