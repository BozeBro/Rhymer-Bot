import { wordsnColors, VowelMap } from "./rap"
const token = require("./auth.json")["token"]
/*
makes message that the discord bot will return
Each group of words that rhyme will be on a new line
*/
function makeMessage(ipaWords: VowelMap) {
    let keys =  Object.keys(ipaWords)
    let reducer = (prev: VowelMap, cur: string) => ipaWords[cur].length > 1 ? {...prev, [cur]: ipaWords[cur]} : prev
    let newIpaWords: VowelMap = keys.reduce(reducer, {})
    let values = Object.values(newIpaWords);
    return "Groups of words that rhymed.\n" + values.map((words: string[]) => words.join(" ")).join("\n")
}
// same as makeMessage but a one-liner for fun
function makeMessagelol(ipaWords: VowelMap) {
    return "Groups of words that rhymed.\n" + Object.values(
        Object.keys(ipaWords)
        .reduce(
            ((prev: VowelMap, cur: string) => ipaWords[cur].length > 1 ? {...prev, [cur]: ipaWords[cur]} : prev), {}))
        .map((words: string[]) => words.join(" ")).join("\n")
}
// The !rap command. Only activate if there is actual text
async function handleRap(rap: string): Promise<string> {
    let sentence: string = rap.replace("!rap ", "").trim();
    let data = await wordsnColors(sentence);
    //let words = data[0];
    let ipaWords = data[1];
    return makeMessage(ipaWords)
}
const {Client, Intents} = require('discord.js')
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS] });
client.on("ready", () => console.log("Logged in"))
client.on("messageCreate", async (msg: any) => {
    if (msg.content === "!rap") msg.reply("This is how you rap")
    else if (msg.content.includes("!rap ")) {
        let sentence = await handleRap(msg.content)
        msg.reply(sentence)
    }
})

client.login(token)