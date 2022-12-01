
class RuleLibrary {

    #rules = [
        {
            rangeStart: 0,
            rangeEnd: 3000,
            type: "disregard",
            regex: /Sogn|Valgkr.+|Politikr.+|Politist.+|Kvarter|Lokalcenter|Kort|\(.+\)/
        },
        {
            rangeStart: 2001,
            rangeEnd: 2008,
            type: "street",
            regex: /(^\d| )?(?<street>[A-ZÆØÅ]+(?:\s|[A-ZÆØÅ]|\W)*[A-ZÆØÅ]+$)/ // capturing group: street
        },
        {
            rangeStart: 2001,
            rangeEnd: 2008,
            type: "postalCity",
            regex: /^(?<postal>(?:\d|[^A-ZÆØÅa-zæøå ]){4,6}) +(?<city>[A-Za-zÆØÅæøå ]+)/ // capturing groups: postal, city
        },
        {
            rangeStart: 2001,
            rangeEnd: 2008,
            type: "municipality",
            regex: /Kommune\W+(?<municipality>[A-ZÆØÅ][a-zæøå]+(?: [A-ZÆØÅ][a-zæøå]+)*)/ // capturing group: municipality
        },
        {
            rangeStart: 2001,
            rangeEnd: 2008,
            type: "nameHousenumber",
            regex: /^(?<number>(?:. |\d+))*(?<name>[A-ZÆØÅ][a-zæøå]+(?: [A-ZÆØÅ][a-zæøå]+)*)/ // capturing groups: number, name
        },
        {
            rangeStart: 2001,
            rangeEnd: 2008,
            type: "phone",
            regex: /(?<!\d)(?<phone>\d[\d ,]*|Hem.nr.)$/, // capturing group: phone
            maxOffsetFromName: 1
        }
    ];

    constructor() {

    }
    
    getOffset(year, type) {
        for (let rule of this.#rules) {
            if (this.#matchesTypeInRange(year, type, rule) && rule.hasOwnProperty("maxOffsetFromName")) {
                return rule.maxOffsetFromName;
            }
        }
        return 0;
    }

    matchesType(line, year, type) {
        let regexes = this.#getMatchingRules(year, type);

        let match;
        for (let regex of regexes) {
            match = regex.exec(line);
            if (match) {
                return match;
            }
        }
        return match;
    }

    #getMatchingRules(year, type) {
        let res = [];
        for (let rule of this.#rules) {
            if (this.#matchesTypeInRange(year, type, rule)) {
                res.push(rule.regex);
            }
        }
        return res;
    }

    #matchesTypeInRange(year, type, rule) {
        return rule.rangeStart <= year && year <= rule.rangeEnd && rule.type === type;
    }
}

export { RuleLibrary }

/*
export default {
    gadenavn: /(^\d| )?(?<gadenavn>[A-ZÆØÅ]+(?:\s|[A-ZÆØÅ]|\W)*[A-ZÆØÅ]+$)/,   // capturing group: gadenavn
    kommune: /^Kommune\W+(?<kommunenavn>[A-Za-zÆØæøå]*$)/,            // capturing group: kommunenavn
    postnr: /^(?<postnr>(?:\d|[^A-ZÆØÅa-zæøå ]){4}) +(?<by>[A-Za-zÆØÅæøå ]+)/,     // capturing groups: postnr og by
    name: /^(?<nummer>(?:. |\d+))*(?<navn>[A-ZÆØÅ][a-zæøå]+(?: [A-ZÆØÅ][a-zæøå]+)*)/, // capturing groups: number + navn
    phone: /(?<!\d)(?<phone>\d[\d ,]*|Hem.nr.)$/,                   // Virker ikke helt; gruppen phone returnerer også enkelte tal
    disregards: /Sogn|Valgkr.+|Politikr.+|Politist.+|Kvarter|Lokalcenter|Kort|\(.+\)/
}
*/