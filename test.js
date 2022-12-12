import path from "node:path";

let srcFilePath = path.resolve('./test-data/2004-husregister-test.pdf');
let destPath = path.resolve('./test-data/output');

process.argv.push(...[
    '-s', srcFilePath,
    '-d', destPath,
    '-f',
    '-b',
    '-k',
    '-p'
]);

import('./cli.js'); // use dynamic import to avoid hoisting
