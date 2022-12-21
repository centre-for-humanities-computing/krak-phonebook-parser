import fs from 'node:fs';
import path from 'node:path';
import utils from './src/utils.js'
import lr from 'line-reader';

const DESTINATION_PATH = "/unique-names/";

// Description
// Finds all unique names

function run() {
    if (process.argv.length < 3) {
        throw new Error("Error: You must provide an absolute path to the directory containing the .ndjson files as argument");
    }

    let sourcePath = process.argv[2];
    checkPath(sourcePath);

    let year = process.argv[3];
    let files = getValidFiles(sourcePath, year);

    let destinationPath = path.join(sourcePath, DESTINATION_PATH);
    utils.makeDirectory(destinationPath);

    for (let file of files) {
        readFile(destinationPath, file);
    }
}

run();

function readFile(destination, file) {
    console.log("Reading file: " + file.filename);
    let map = new Map();
    let notUniqueNames = [];
    lr.eachLine(file.fullPath, function(line, last) {
        let data = JSON.parse(line);
        let name = data.name;

        if (map.has(name) || notUniqueNames.includes(name)) {
            map.delete(name);
            if (!notUniqueNames.includes(name)) {
                notUniqueNames.push(name);
            }
        } else {
            map.set(name, line);
        }

        if (last) {
            let uniqueNamesAsArray = Array.from(map.values());
            let destinationFilename = `${file.year}-unique.ndjson`;
            utils.writeArrayToFile(destination, uniqueNamesAsArray, destinationFilename);
            return false;
        }
    })
}

function getValidFiles(dir, year) {
    let dirContent = utils.getFileNamesInDirectory(dir);
    let ndjsonFiles = utils.filterFilenamesByExtension(dirContent, "ndjson");
    
    ndjsonFiles = ndjsonFiles.filter(function(filename){
        return utils.stringContainsRegex(filename, /\d{4}/i); // contains year in the filename
    });

    if (dirContent.length === 0 || ndjsonFiles.length === 0) {
        throw new Error("Directory must contain at least one .ndjson file with a year in the filename")
    }

    let validFiles = ndjsonFiles.map(function(filename) {
        return {
            filename: filename,
            fullPath: path.join(dir, filename),
            year: /\d{4}/.exec(filename)
        };
    })

    if (!year) {
        return validFiles;
    } else {
        let regex = new RegExp(`${year}`, "i");

        validFiles = validFiles.filter(function(file) {
            return utils.stringContainsRegex(file.filename, regex);
        });
        
        if(validFiles.length > 0) {
            return validFiles.slice(0, 1);
        } else {
            throw new Error("No matching files found for year: " + year);
        }
    }

}

function checkPath(pathToCheck) {
    let pathObj = path.parse(pathToCheck);

    if (pathObj.ext.length > 0) {
        throw new Error("Path must be a directory, not a file");
    }

    if (!path.isAbsolute(pathToCheck)) {
        throw new Error("Path must be absolute");
    }
}