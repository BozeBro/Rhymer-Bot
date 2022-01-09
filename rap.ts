import fetch from "node-fetch";
interface IpaMap {
    [word: string]: string
}
interface VowelMap {
    [word: string]: string[]
}
// short then long. a, e, i, o, u
const vowels = ["a", "ā", "e", "ē", "i", "ī", "ä", "ō", "ə", "ü"]
const colors = ["red", "orange", "yellow", "green", "blue", "indigo", "violet", "purple", "pink", "beige", "white"]
const colorMap: IpaMap = vowels.reduce((result:IpaMap, vowel:string, index:number) => Object.assign(result, {[vowel]: colors[index]}), {})
// Obtains Ipa from Merriam Webster Dictionary
// 1000 API calls a day
let getIpa = async (word: string): Promise<string> => {
    const key = require("./auth.json")["key"]
    const url = `https://www.dictionaryapi.com/api/v3/references/collegiate/json/${word}?key=${key}`

    const res = await fetch(url, {
        method: "GET",
        redirect: "follow"
    })
    .then(async (res) => await res.json()
    )
    try {
        let ipa = res[0]['hwi']['prs'][0]["mw"]
        return ipa
    }
    catch(err) {
        return ""
    }
}
// getIpa but for an array of words
let getIpas = (async function (words: string[]): Promise<string[]> {
    let ipas = await Promise.all(words.map(getIpa)).then((ipas) => ipas);
    return ipas
});
// Groups the words rhymed categories
function categorize(words: string[], ipas: string[], vowels: string[]): [VowelMap, IpaMap] {
    let pairing = words.reduce((result:IpaMap, word:string, index:number) => Object.assign(result, {[word]: ipas[index]}), {})
    let reducer = ((prev: VowelMap, cur: string) => ({...prev, [cur]: [...vowels].filter(vowel => pairing[cur].includes(vowel))}))
    let wordIpas = words.reduce(reducer, {})
    return [wordIpas, pairing]
}
// Places rhymed words into colors
function colorize(words: string[], wordIpa: VowelMap, pairing:IpaMap, colorMap: IpaMap): string[] {
    let reducer = ((prev: VowelMap, cur: string) => ({...prev, [cur]: [...words].filter(word => pairing[word].includes(cur))}))
    let ipaWords = vowels.reduce(reducer, {})
    let colors = words.map(word => {
        let sounds: string[] = wordIpa[word]
        return sounds.length >= 1 && ipaWords[sounds[0]].length > 1 ? colorMap[sounds[0]] : "white"
    })
    return colors
}
let wordsnColors = (async function (sentence: string): Promise<[string[],VowelMap]> {
    //let wordsWPronunc: string[] = sentence.split(" ")
    let words: string[] = sentence
        .split(" ")
        .map((word) => word
            .split("")
            .filter(char => (/[a-zA-Z]/).test(char))
            .join(""));

    let ipas = await getIpas(words);
    let data: [VowelMap, IpaMap] = categorize(words, ipas, vowels);
    let wordIpas: VowelMap = data[0]
    let pairing: IpaMap = data[1]
    // let colors = colorize(words, wordIpas, pairing, colorMap)
    let reducer = ((prev: VowelMap, cur: string) => ({...prev, [cur]: [...words].filter(word => pairing[word].includes(cur))}))
    let ipaWords = vowels.reduce(reducer, {})
    return [words, ipaWords]
});
export { wordsnColors, VowelMap };