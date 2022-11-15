let path = require('path');
let fs = require('fs');
let extract = require('pdf-text-extract');

// 1. Extract data to array
// 2. Parse

// let PDFpath = path.join(__dirname, "pdfs/");
let PDFpath = path.join(__dirname, "test/");
let textPath = path.join(__dirname, "texts/");

let extractOptions = {
    firstPage: 0,
    lastPage: 1
}

// Gets all filenames in the data folder
let filenames = fs.readdirSync(PDFpath);

for (let filename of filenames) {
    let filePath = path.join(PDFpath, filename);
    console.log(filePath);
    extract(filePath, extractOptions, function(err, text) {
        if (err) {
            console.dir(err);
            return;
        }

        console.dir(text.length);
        writeToFiles(filename, text);
    })
}

function writeToFiles(originalFilename, pages) {
    let year = originalFilename.match(/\d{4}/)[0]; // gets year
    let localDir = path.join(textPath, year);
    if (!fs.existsSync(localDir)) {
        fs.mkdirSync(localDir);
    }
    
    for (let i = 0; i < pages.length; i++) {
        let name = year + "-page-" + i;
        let pageFilename = path.join(localDir, name);
        fs.writeFile(pageFilename, pages[i], "utf-8", function(err) {
            if (err) { console.log(err) }
        })
    }
}