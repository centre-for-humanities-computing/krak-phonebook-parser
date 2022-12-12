import fs from 'node:fs';
import path from 'node:path';
import utils from './src/utils.js'
import lr from 'line-reader';

// Description
// Finds all unique names

if (process.argv.length < 3) {
    console.error("Error: You must provide an absolute path to the directory containing the .ndjson files as argument")
    process.exit();
}

let sourcePath = process.argv[2];
let destinationPath;
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
        destinationPath = path.join(sourcePath, "unique");
        utils.makeDirectory(destinationPath);
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

for (let filename of properFiles) {
    
    let fullPath = path.join(sourcePath, filename)
    let year = /\d{4}/i.exec(filename);

    let names = new Map();

    lr.eachLine(fullPath, function(line, last) {
        let data = JSON.parse(line);
        let name = data.name;

        if (!names.has(name)) {
            names.set(name, 1);
        } else {
            names.set(name, names.get(name)+1)
        }

        if (last) {
            console.log(names);
            return false;
        }
    });

    let uniqueNames = [];

    for (let [k, v] of names) {
        if (v === 1) {
            uniqueNames.push(k);
        }
    }

    let output = "";

    lr.eachLine(fullPath, function(line, last) {
        let data = JSON.parse(line);
        if (uniqueNames.includes(data.name)) {
            output += line + "\n";
        }

        if (last) {
            console.log(output)

            return false;
        }
    });

    
}

// Load files
// Map to unique instances