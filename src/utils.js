import fs from 'node:fs';
import path from 'node:path';

export default {
    getFileNamesInDirectory: function(dir) {
        return fs.readdirSync(dir);
    },

    filterFilenamesByExtension: function(dirList, extension) {
        let regex = new RegExp(`^[^._].*\.${extension}$`, "i")
        console.log(regex)
        return dirList.filter(function(filename) {
            return regex.test(filename);
        })
    }
    ,

    makeDirectory: function (tempPath) {
        // let tempPath = path.join(basePath, "temp");
        if (fs.existsSync(tempPath)) {
            return;
        }

        try {
            fs.mkdirSync(tempPath)
        } catch {
            throw new Error("Something went wrong in creating a folder");
        }
    },

    removeDirectory: function(tempPath) {
        // let tempPath = path.join(basePath, "temp");
        if (!fs.existsSync(tempPath)) {
            return;
        }
        try {
            let filenames = fs.readdirSync(tempPath);
            for (let filename of filenames) {
                let filePath = path.join(tempPath, filename);
                fs.rmSync(filePath);
            }
            fs.rmdirSync(tempPath);
            
        } catch {
            throw new Error("Could not delete files or folder");
        }
    },

    writeArrayToFile(destDir, array, filename) {
        let fullPath = path.join(destDir, filename);
        let str = array.join("\n")
        try {
            fs.writeFileSync(fullPath, str, 'utf-8');
        } catch {
            throw new Error("Encountered problem when writing to file: "+ filename);
        }
    }
}