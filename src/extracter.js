import cmd from 'node-cmd';
import path from 'node:path';
import utils from './utils.js';

class Extracter {

    #sourcePath
    #sourceIsDir
    #temporaryDirPath
    #debug

    constructor(source, temporaryDirectory, debugMode) {
        this.#sourcePath = source.path;
        this.#sourceIsDir = source.isDir;
        this.#temporaryDirPath = temporaryDirectory;
        this.#debug = debugMode;
    }

    async extractText() {
        let filenames;
        if (this.#sourceIsDir) {
            filenames = this.#getPDFFileNamesInDirectory(this.#sourcePath)
        } else {
            let filename = path.basename(this.#sourcePath)
            if (this.#isValidPDFFile(filename)) {
                filenames = [filename];
            } else {
                throw new Error("Not a valid file path.")
            }
            
        }

        if (this.#debug) {
            console.log('------------------------------------------')
            console.log('Reading from original files: ' + filenames.join(", "));
            console.log('------------------------------------------')
        }

        for (let filename of filenames) {
            let fullSourceFilePath;
            if (this.#sourceIsDir) {
                fullSourceFilePath = path.join(this.#sourcePath, filename);
            } else {
                fullSourceFilePath = this.#sourcePath;
            }
            let tempFileName = filename.replace(/.pdf$/i, ".txt");
            let fullTemporaryFilePath = path.join(this.#temporaryDirPath, tempFileName);
            this.#extractFromPDF(fullSourceFilePath, fullTemporaryFilePath);
        }
    
    }

    #extractFromPDF(fullSourceFilePath, fullTemporaryFilePath) {
        // console.log(cmd)
        let cmdCommand = "pdftotext -raw " + fullSourceFilePath + " " + fullTemporaryFilePath;

        if (this.#debug) {
            console.log('------------------------------------------')
            console.log('Running command:')
            console.log(cmdCommand);
            console.log('------------------------------------------')
        }

        try {
            cmd.runSync(cmdCommand);
            if (this.#debug) {
                console.log('------------------------------------------')
                console.log('Successfully extracted text from file: ' + fullSourceFilePath);
                console.log('------------------------------------------')
            }

        } catch {
            throw new Error("Something went wrong in running the pdftotext command");
        }
    }

    #getPDFFileNamesInDirectory(dir) {
        let res = utils.getFileNamesInDirectory(dir);
        let pdfs = res.filter((filename) => this.#isValidPDFFile(filename));
        return pdfs;
    }

    #isValidPDFFile(filename) {
        return /^[^_.].*\.pdf$/i.test(filename); // Does not begin with . or _ and ends with .pdf
    }

}

export { Extracter };