import * as fs from 'node:fs';
// import * as path from 'node:path';

export default {
    getFileNamesInDirectory: function(dir) {
        return fs.readdirSync(dir);
    }
}