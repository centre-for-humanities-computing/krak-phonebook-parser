export default {
    gadenavn: /(^\d| )?(?<gadenavn>[A-ZÆØÅ]+(?:\s|[A-ZÆØÅ]|\W)*[A-ZÆØÅ]+$)/,   // capturing group: gadenavn
    kommune: /^Kommune\W+(?<kommunenavn>[A-Za-zÆØæøå]*$)/,            // capturing group: kommunenavn
    postnr: /^(?<postnr>(?:\d|[^A-ZÆØÅa-zæøå ]){4}) +(?<by>[A-Za-zÆØÅæøå ]+)/,     // capturing groups: postnr og by
    name: /^(?<nummer>(?:. |\d+))*(?<navn>[A-ZÆØÅ][a-zæøå]+(?: [A-ZÆØÅ][a-zæøå]+)*)/, // capturing groups: number + navn
    phone: /(?<!\d)(?<phone>\d[\d ,]*|Hem.nr.)$/,                   // Virker ikke helt; gruppen phone returnerer også enkelte tal
    disregards: /Sogn|Valgkr.+|Politikr.+|Politist.+|Kvarter|Lokalcenter|Kort|\(.+\)/
}