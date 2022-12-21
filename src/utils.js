import fs from 'node:fs';
import path from 'node:path';

export default {
    stringContainsRegex(str, regex) {
        return regex.test(str);
    },
    getFileNamesInDirectory(dir) {
        try {
            return fs.readdirSync(dir);
        } catch {
            throw new Error("Something went wrong when reading directory: " + dir);
        }
    },

    filterFilenamesByExtension(dirList, extension) {
        let regex = new RegExp(`^[^._].*\.${extension}$`, "i")
        // console.log(regex)
        return dirList.filter(function(filename) {
            return regex.test(filename);
        })
    }
    ,

    makeDirectory(p) {
        if (fs.existsSync(p)) {
            return;
        }

        try {
            fs.mkdirSync(p)
        } catch {
            throw new Error("Something went wrong in creating a folder");
        }
    },

    removeDirectory(p) {
        if (!fs.existsSync(p)) {
            return;
        }
        try {
            let filenames = fs.readdirSync(p);
            for (let filename of filenames) {
                let filePath = path.join(p, filename);
                fs.rmSync(filePath);
            }
            fs.rmdirSync(p);
            
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