import { program } from 'commander';
import path from 'path';
import fs from 'fs';

import utils from './src/utils.js';
import { Extracter } from "./src/extracter.js";
import { Parser } from "./src/parser.js";

async function run() {
    program.requiredOption('-s, --source <path>', 'The absolute source path to read from. If resolves to a directory, parses all files in the directory. If path to file, parse only that file');
    program.requiredOption('-d, --destination <directory>', 'The absolute path to a folder in which to output data')
    program.option('-f, --file', "Flag. If present, writes parser statistics to file in output directory. Otherwise writes to the terminal.")
    program.option('-t, --threshold <integer>', 'The minimum length in characters for a line to be considered')
    program.option('-p, --parse', 'Parse only (skips the extraction of text from PDF). Useful when experimenting with different rules and thresholds')
    program.option('k, --keep', 'Keeps the temporary folder and the raw text extracted from the PDFs')
    program.option('-b, --debug', 'Run in debugging mode')
    program.parse();

    let options = program.opts();

    let source = resolvePath(options.source);
    let destination = resolvePath(options.destination, true);

    let printStatsToFile = options.file;
    let parse = options.parse;
    let keep = options.keep;
    let debug = options.debug;

    let threshold = options.threshold;
    if (!threshold) {
        threshold = 5; // Default option
    }

    let temporaryDirectory = path.join(destination.path, "/temp/");
    utils.makeTemporaryDirectory(temporaryDirectory);

    console.log(temporaryDirectory);
    
    if (!parse) {
        let extracter = new Extracter(source, temporaryDirectory, debug);
        extracter.extractText();
    }

    let parser = new Parser(temporaryDirectory, destination, threshold, debug);
    parser.parse(printStatsToFile);

    if (!keep) {
        utils.removeTemporaryDirectory(temporaryDirectory);
    }

}


function resolvePath(pathToResolve, create = false) {
    
    if (!path.isAbsolute(pathToResolve)) {
        throw new Error("Path must be absolute");
    }
    
    if (create) {
        try {
            fs.mkdirSync(pathToResolve, { recursive: true } )
        } catch {
            throw new Error("Could not create directory: " + pathToResolve)
        }
    }

    if(!fs.existsSync(pathToResolve)) {
        throw new Error("Path must be valid and exist");
    }
    
    let res = {
        path: pathToResolve,
        isDir: true
    };

    if (fs.statSync(pathToResolve).isFile()) {
        res.isDir = false;
    }
    
    return res;
}

run();