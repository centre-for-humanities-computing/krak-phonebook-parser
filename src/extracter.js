import * as cmd from 'node-cmd';
import utils from './utils.js';

class Extracter {

    #sourcePath
    #sourceIsDir
    #destinationDirPath

    constructor(source, destination) {
        this.#sourcePath = source.path;
        this.#sourceIsDir = source.isDir;
        this.#destinationDirPath = destination.path;
    }

    extractText() {
        if (this.#sourceIsDir) {
            let filenames = this.#getPDFFileNamesInDirectory(this.#sourcePath)
        }
    }

    #getPDFFileNamesInDirectory(dir) {
        let res = utils.getFileNamesInDirectory(dir);
        let pdfs = res.filter((filename) => {
            return /^[^_.].*\.pdf$/i.test(filename)
        });
        console.log(pdfs);
        return pdfs;
    }
}

export { Extracter };











// let extract = require('pdf-text-extract');








/*

let dataFolder = "";
let PDFpath = path.join(__dirname, "pdfs/"); // absolute path for pdfs
let textPath = path.join(__dirname, "texts/"); // absolute path for extracted text

//////////////////
// Note: The pdf-text-extract has issues with options -- I instead extracted the text using the 'pdftotext' terminal command with the raw argument: "pdftotext -r [input] [output]"
// https://www.xpdfreader.com/pdftotext-man.html
//////////////////

function run() {
    
    readPDFs();
}

// run();


/////////////////////////////////

function readPDFs () {
    // Options object for extract() -- doesn't seem to work properly
    let extractOptions = { 
        firstPage: 0,
        lastPage: 1
    }

    // Gets all filenames in the pdf folder
    let filenames = fs.readdirSync(PDFpath); 

    for (let filename of filenames) {
        // absolute path for the file
        let filePath = path.join(PDFpath, filename);
        
        // the callback gives text: an array of pages of the original PDF
        extract(filePath, extractOptions, function(err, text) {
            if (err) {
                console.dir(err);
                return;
            }

            writeToFiles(filename, text);
        })
    }
}


function writeToFiles(originalFilename, pageArray) {
    // Get year from filename and build new folder path
    let year = originalFilename.match(/\d{4}/)[0];
    let localDir = path.join(textPath, year);

    // See if the folder exists; if not, create
    if (!fs.existsSync(localDir)) {
        fs.mkdirSync(localDir);
    }
    
    // For each page in the PDF
    for (let i = 0; i < pageArray.length; i++) {
        // Path
        let name = year + "-page-" + i + ".txt";
        let pageFilename = path.join(localDir, name);
        
        // Create a new file for each page
        fs.writeFile(pageFilename, pageArray[i], "utf-8", function(err) {
            if (err) { console.log(err) }
        })
    }
}
*/