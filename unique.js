import fs from 'node:fs';
import path from 'node:path';
import utils from './src/utils.js'

// Description
// Finds all unique names

if (process.argv.length < 3) {
    console.error("Error: You must provide an absolute path to the directory containing the .ndjson files as argument")
    process.exit();
}

let sourcePath = process.argv[2];
let year = process.argv[3];

let properFiles = [];

try {
    if (path.isAbsolute(sourcePath)) {
        let dirContent = fs.readdirSync(sourcePath);
        if (dirContent.length === 0) {
            console.log("Directory is empty. Exits program.");
            process.exit();
        }
        let ndjsonFiles = utils.filterFilenamesByExtension(dirContent, "ndjson");
        if (year) {
            for (let filename of ndjsonFiles) {
                if (filename.indexOf(year) > -1) {
                    properFiles.push(filename);
                }
            }
        } else {
            properFiles = ndjsonFiles.filter(function(filename) {
                return /\d{4}/.test(filename); 
            }) 
        }
    } else {
        console.error("Path is not absolute. Exiting program.")
        process.exit();
    }
} catch {
    throw new Error("Something went wrong when resolving filenames.")
}

// Load files
// Map to unique instances