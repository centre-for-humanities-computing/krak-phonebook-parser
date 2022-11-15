let path = require('path');
let fs = require('fs');
let extract = require('pdf-text-extract');

// 1. Extract data to array
// 2. Parse

// let PDFpath = path.join(__dirname, "pdfs/");
let PDFpath = path.join(__dirname, "test/"); // absolute path for pdfs
let textPath = path.join(__dirname, "texts/"); // absolute path for extracted text

let extractOptions = { //options object for extract() -- doesn't seem to work properly
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

function writeToFiles(originalFilename, pages) {
    // Get year from filename and build new folder path
    let year = originalFilename.match(/\d{4}/)[0];
    let localDir = path.join(textPath, year);

    // See if the folder exists; if not, create
    if (!fs.existsSync(localDir)) {
        fs.mkdirSync(localDir);
    }
    
    // For each page in the PDF
    for (let i = 0; i < pages.length; i++) {
        // Path
        let name = year + "-page-" + i + ".txt";
        let pageFilename = path.join(localDir, name);
        
        // Create a new file for each page
        fs.writeFile(pageFilename, pages[i], "utf-8", function(err) {
            if (err) { console.log(err) }
        })
    }
}