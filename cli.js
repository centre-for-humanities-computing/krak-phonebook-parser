import { program } from 'commander';
import path from 'path';
import fs from 'fs';
import { Extracter } from "./src/extracter.js";
import { Parser } from "./src/parser.js";
import utils from './src/utils.js';

function run() {
    program.requiredOption('-s, --source <path>', 'The absolute source path to read from. If resolves to a directory, parses all files in the directory. If path to file, parse only that file');
    program.requiredOption('-d, --destination <directory>', 'The absolute path to a folder in which to output data')
    program.parse();

    let options = program.opts();
    let source = resolvePath(options.source);
    let destination = resolvePath(options.destination);

    let temporaryDirectory = path.join(destination.path, "/temp/");
    utils.makeTemporaryDirectory(temporaryDirectory);
    
    let extracter = new Extracter(source, temporaryDirectory);
    // extracter.extractText();

    let parser = new Parser(temporaryDirectory, destination);
    parser.parse();

    // utils.removeTemporaryDirectory(temporaryDirectory);

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
    
    return res;
}

run();