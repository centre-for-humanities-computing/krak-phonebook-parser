let fs = require('fs');
let path = require('path');

let basePath = "/Volumes/Seagate/Krak/extracts";

let filenames = fs.readdirSync(basePath);

console.log(filenames);

let regexes = {
    gadenavn: /(^[A-Z]+(?:\s|[A-Z]|\W)*[A-Z]+$)/gm // virker!
}

let gader = new Map();

// let data = fs.readFileSync("./test/output.txt", 'utf-8');

// let res = data.match(regexes.gade);
// res = [...data.matchAll(regexes.gadenavn)];
// console.log(res);

/*
for (let i = 0; i < res.length; i++) {
    if (regexes.gadenavn.test(res[i])) {
        if (!gader.has(res[i])) {
            gader.set(res[i], {
                data: []
            })
        }
        let obj = gader.get(res[i]);
        obj.data.push(res[i+1])
        gader.set(res[i], obj);
    }
}

console.log(gader);
*/

