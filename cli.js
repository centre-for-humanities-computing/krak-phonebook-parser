import { program } from 'commander';
import * as path from 'path';
import * as fs from 'fs';
// import { Extractor } from "./src/extractor.js";
// import { Parser } from "./src/parser.js";

function run() {
    program.requiredOption('-s, --source <path>', 'The absolute source path to read from. If resolves to a directory, parses all files in the directory. If path to file, parse only that file');
    program.requiredOption('-d, --destination <directory>', 'The absolute path to a folder in which to output data')
    // program.option('-f, --file', 'A flag to set if reading just one file')
    program.parse();

    let options = program.opts();
    let source = resolvePath(options.source);
    let destination = resolvePath(options.destination);
    
}

function resolvePath(pathToResolve) {
    
    if (!path.isAbsolute(pathToResolve)) {
        throw new Error("Path must be absolute");
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
    
    console.log(res);
}

run();