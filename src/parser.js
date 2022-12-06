import fs from 'fs';
import path from 'path';
import { RuleLibrary } from '../rules/rules.js';
import utils from './utils.js'


class Parser {

    #temporaryDirectoryPath
    #destinationDirectoryPath
    #allStreets
    #ruleLib
    #stats
    #lineLengthThreshold
    #debug
    #unparsedLines

    constructor(temporaryDirectoryPath, destinationPathObj, lineLengthThreshold, debugMode) {
        this.#temporaryDirectoryPath = temporaryDirectoryPath;
        this.#destinationDirectoryPath = destinationPathObj.path;
        this.#allStreets = new Map();
        this.#ruleLib = new RuleLibrary();
        this.#stats = [];
        this.#lineLengthThreshold = lineLengthThreshold;
        this.#debug = debugMode;
        this.#unparsedLines = [];
    }

    parse(printStatsToFile) {
        let filenames = this.#getTemporaryFilenames(this.#temporaryDirectoryPath);

        if (this.#debug) {
            console.log('------------------------------------------')
            console.log("Temporary files to process: " + filenames.join(", "))
            console.log('------------------------------------------')
        }

        for (let filename of filenames) {
            let tempFilePath = path.join(this.#temporaryDirectoryPath, filename);
            this.#parseFile(tempFilePath, filename);
        }

        this.#writeToDestinationFile(this.#getAllStreetsAsArray());
        this.#outputStats(printStatsToFile);
        if (this.#debug) {
            utils.writeArrayToFile(this.#destinationDirectoryPath, this.#unparsedLines, "failed-lines.txt");
        }
    }

    #parseFile(tempFilePath, filename) {
        console.log('------------------------------------------')
        console.log("Parsing temporary file: " + filename);
        console.log('------------------------------------------')

        let year = this.#getYearFromFilename(filename);
        let lines = this.#getFileContentasArray(tempFilePath);

        let currentStreet = null;
        let currentPostal = null;
        let currentCity = null;
        let currentMunicipality = null;
        let currentPerson = null;

        let totalLines = lines.length;
        let successfulLines = 0;
        let failedLines = 0;
        let ignoredLines = 0;

        let peopleArray = [];
        
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            let currentLineMatchedOrDisregarded = false;

            // Test if line is of type to be disregarded or if the length of the line is below a certain threshold
            if (line.length < this.#lineLengthThreshold || this.#ruleLib.matchesType(line, year, "disregard")) { //check line length threshold and "blacklisted" terms
                ignoredLines++;
                currentLineMatchedOrDisregarded = true;

                continue;
             }
            
            // Test if line contain street
            let streetMatch = this.#ruleLib.matchesType(line, year, "street");
            if(streetMatch) {
                successfulLines++;
                currentLineMatchedOrDisregarded = true;

                currentStreet = streetMatch.groups.street;
                currentPostal = null;
                currentCity = null;
                currentMunicipality = null;
            }

            // Test if line contains postal code and city (but only if not currently any registered)
            if (!currentPostal && !currentCity) {
                let postalCityMatch = this.#ruleLib.matchesType(line, year, "postalCity");
                if (postalCityMatch) {
                    successfulLines++;
                    currentLineMatchedOrDisregarded = true;

                    currentPostal = postalCityMatch.groups.postal;
                    currentCity = postalCityMatch.groups.city;
                    this.#addStreet(currentStreet);
                    this.#addPostalAndCityToStreet(currentStreet, currentPostal, currentCity);
                }
            }

            if (!currentMunicipality) {
                let municipalityMatch = this.#ruleLib.matchesType(line, year, "municipality");
                if (municipalityMatch) {                    
                    successfulLines++;
                    currentLineMatchedOrDisregarded = true;

                    currentMunicipality = municipalityMatch.groups.municipality;
                    this.#addMunicipalityToStreet(currentStreet, currentMunicipality);
                }
            }

            // Test if line contains a name (if yes, then test for street number)
            let nameMatch = this.#ruleLib.matchesType(line, year, "nameHousenumber");
            if (nameMatch && currentStreet && currentPostal && currentCity) {
                successfulLines++;
                currentLineMatchedOrDisregarded = true;

                let rawName = nameMatch.groups.name;
                let cleanedName = this.#cleanName(rawName);
                currentPerson = {
                    name: cleanedName,
                    phone: null,
                    street: currentStreet,
                    number: null,
                    postal: currentPostal,
                    city: currentCity
                }

                if (nameMatch.groups.number) {
                    let cleanedNumber = this.#cleanStreetNumber(nameMatch.groups.number);
                    currentPerson.number = cleanedNumber;
                }

                // See if there is a phonenumber in the same line; if not, look X lines ahead to check
                let phoneMatch = this.#ruleLib.matchesType(line, year, "phone");
                if (!phoneMatch) {
                    let offset = this.#ruleLib.getOffset(year, "phone");
                    for (let j = i; j <= i + offset; j++) {
                        phoneMatch = this.#ruleLib.matchesType(line, year, "phone");
                        let tempNameMatch = this.#ruleLib.matchesType(line, year, "nameHousenumber");
                        if (phoneMatch && !tempNameMatch) {
                            successfulLines++;
                            currentLineMatchedOrDisregarded = true;

                            break;
                        }
                    }
                }

                if (phoneMatch) {
                    let rawPhone = phoneMatch.groups.phone;
                    let cleanedPhone = this.#cleanPhoneNumber(rawPhone);
                    currentPerson.phone = cleanedPhone;
                }
            }

            if (currentPerson) {
                peopleArray.push(currentPerson);
                currentPerson = null;
            }

            if (this.#debug) {
                if(!currentLineMatchedOrDisregarded) {
                    this.#unparsedLines.push(filename + ": '" + line + "' ------------- " + currentStreet + " " + currentCity + " " + currentPostal);
                }
            }
        }
        

        let successRate = successfulLines / (totalLines-ignoredLines);

        this.#stats.push(...[
            "Filename: " + filename,
            "Total lines = " + totalLines,
            "Succesful lines = " + successfulLines,
            "Ignored lines = " + ignoredLines,
            "Success rate = " + successRate.toFixed(2) + " (succesful lines / (total lines - ignored lines))",
            "\n"
        ]);

        this.#writeToDestinationFile(peopleArray, year);
    }

    #outputStats(toFile = false) {
        if (!toFile) {
            for (let line of this.#stats) {
                console.log(line);
            }
        } else {
            let outputPath = path.join(this.#destinationDirectoryPath, "/stats/stats.txt")
            let filePtr;
            try{
                filePtr = fs.openSync(outputPath, 'w');
                if (this.#debug) {
                    console.log('------------------------------------------')
                    console.log("Succesfully opened file: " + outputPath)
                    console.log('------------------------------------------')
                }
                let outputData = this.#stats.join("\n");
                fs.appendFileSync(outputPath, outputData, "utf-8");
            } catch {
                throw new Error("A problem occurred while writing to statistics file. Try removing flag -r, --rate")
            } finally {
                if (filePtr) {
                    fs.closeSync(filePtr);
                }
            }
            
        }

    }

    #cleanPhoneNumber(str) {
        let res = str.replace(/\D/g, "")
        
        return Number(res);
    }

    #cleanName(str) {
        let newStr = str.trim();
        let name = newStr.replace(/\s+/, " ");
        return name;
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
                console.log("Succesfully created file: " + filename);
                fs.closeSync(filePtr);
            }
        }
    }

    #addStreet(streetname) {
        if (this.#allStreets.has(streetname)) {
            return;
        }

        this.#allStreets.set(streetname, {
            street: streetname,
        });
    }

    #addPostalAndCityToStreet(street, postalCode, city) {
        if (!this.#allStreets.has(street)) {
            return;
        }
        let obj = this.#allStreets.get(street);
        obj.postal = postalCode;
        obj.city = city;
        this.#allStreets.set(street, obj);
    }

    #addMunicipalityToStreet(street, municipality) {
        if (!this.#allStreets.has(street)) {
            return;
        }
        let obj = this.#allStreets.get(street);
        obj.municipality = municipality;
        this.#allStreets.set(street, obj);
    }

    #getAllStreetsAsArray() {
        let res = []
        let iter = this.#allStreets.entries();
        for (let [street, data] of iter) {
            res.push(data);
        }
        res.sort(function(obj1, obj2) {
            return obj2.street.localeCompare(obj1);
        })
        return res;
    }

    #getTemporaryFilenames(dir) {
        let filenames = utils.getFileNamesInDirectory(dir);
        return filenames.filter((filename) => this.#isValidFilename);

    }

    #isValidFilename(filename) {
        return /^[^._].*\.txt$/i.test(filename); // Does not begin with _ or. and ends with .txt
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