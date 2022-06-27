import { Word } from "types";

const okWords = [
  "who's",
  "what's",
  "that's",
  "mind's",
  "neptune's",
  "i'll",
  "country's",
  "savior's",
  "let's",
  "brother's",
  "nephew's",
  "father's",
  "king's",
  "we'll",
  "mother's",
  "god's",
  "truncheon's",
  "men's",
  "man's",
  "you'll",
  "they'll",
  "he'll",
  "she'll",

  "nature's",
  "fortune's",
  "pin's",
  "lion's",
  "i'm",
  "there's",
  "he's",
  "marvel's",
  "o'ertook",
  "o'erhasty",
  "o'erhanging",
  "thou'lt",
  "i've",
  "howe'er",
  "have't",
  "o'erthrown",
  "thou'rt",
  "an't",
];
const hardcodedEquivalences: Record<string, string> = {
  //"frown'd": 'frowned',
  //"appear'd": 'appeared',
  //"prick'd": 'pricked',
  //"esteem'd": 'esteemed',
  //"seal'd": 'sealed',

  // "'tis": 'it is',
  // "'twill": 'it will',
  // "'a": 'a',
  "usurp'st": "usurps",
  "on't": "on it",
  "is't": "is it",
  "in't": "in it",
  "e'en": "even",
  //"'gainst": 'against',
  "o'er": "over",
  "do't": "do it",
  //"'twere": 'it were',
  "h'ath": "he has",
  "i'": "in",
  vailèd: "veiled",
  "know'st": "knowest",
  "encount'red": "encountered",
  "saw't": "saw it",
  "'twixt": "between",
  "o'erwhelm": "overwhelm",
  "bear't": "bear it",
  "ta'en": "taken",
  "to't": "to it",
  "o'ergrowth": "overgrowth",
  "revisit'st": "revisitest",
  "know't": "know it",
  // "'gins": 'begins',
  // "'adieu": 'adieu',
  "sworn't": "sworn it",
  //  "'faith": 'faith',
  "o'ermaster": "overmaster",
  // "'t": 'it',
  "swear't": "swear it",
  "say'st": "sayest",
  "soe'er": "soever",
  "if't": "if it",
  "tragical-": "tragical",
  "woo't": "will you",
  "'as'es": "asses",
  "fall'n": "fallen",
  "for't": "for it",
  "was't": "was it",
  "ne'er": "never",
  "see't": "see it",
  "upon't": "upon it",
  "o'erdoing": "overdoing",
  "o'erstep": "overstep",
  "o'erweigh": "overweigh",
  "e'er": "ever",
  "find'st": "findest",
  "turn'st": "turnest",
  "befall'n": "befallen",
  "knew'st": "knewest",
  "hold'st": "holdest",
  "o'erbears": "overbears",
  "call't": "call it",
  "o'errule": "overrule",
  "wand'ring": "wandering",
  "pray'st": "prayest",
  "gave't": "gave it",
  "think'st": "thinkest",
  "pardon't": "pardon it",
  "think't": "think it",
  "o'erhear": "overhear",
  "o'ersways": "oversways",
  "o'ertop": "overtop",
  "by'r": "by our",
  "ha't": "have it",
};
//let count = 0;
export function parseText(
  text: string,
  indexOffset: number
): { words: Word[]; lastIndex: number } {
  const words = text.split(/[ "[\],.!?;():—]+/);

  const finalWords: Word[] = [];
  let index = indexOffset - 1;

  words.forEach((w, i) => {
    if (w.trim() === "") {
      // if (i === words.length - 1) return; // last one is ok
      // console.log('prev:', words.slice(i - 10, i - 1));
      // throw new Error('empty word');
      return;
    }
    if (w === "'") {
      return;
    }

    index++;
    if (w.match(/^[a-zA-Z]+$/)) {
      // ok
      finalWords.push({ token: w, index });
      return;
    }
    if (w.match(/[a-zA-Z]+-[a-zA-Z]+/)) {
      // composed
      finalWords.push(
        ...w.split("-").map((token, i) => {
          if (i > 0) {
            index++;
          }
          return {
            token,
            index,
          };
        })
      );
      return;
    }

    const wLower = w.toLowerCase();

    if (w.slice(-2) === "'d") {
      finalWords.push({ token: w, alternative: w.slice(-2) + "ed", index });
      return;
    }

    if (w.slice(-2) === "'s") {
      finalWords.push({ token: w, index });
      return;
    }

    if (w[w.length - 1] === "'") {
      finalWords.push({ token: w, alternative: w.slice(0, -1), index });
      return;
    }

    if (w[0] === "'") {
      finalWords.push({ token: w, alternative: w.slice(1), index });
      return;
    }
    if (okWords.includes(wLower)) {
      finalWords.push({ token: w, index });
      return;
    }

    if (hardcodedEquivalences[wLower]) {
      finalWords.push({
        token: w,
        alternative: hardcodedEquivalences[wLower],
        index,
      });
      return;
    }

    if (w.match(/\d+/)) {
      finalWords.push({
        token: w,
        index,
      });
      return;
    }

    console.log(text);
    throw new Error("unhandled word: " + w);
    //count++;
  });
  return { words: finalWords, lastIndex: index };
}

// scenes.forEach((scene) => {
//   scene.entries.forEach((entry) => {
//     if (entry.type === "dialogue") {
//       allWords.push(...parseText(entry.name));
//     }
//     allWords.push(...parseText(entry.text));
//   });
// });
// console.log(`${count} unhandled words`);

// writeFileSync("./allWords.json", JSON.stringify(allWords));
