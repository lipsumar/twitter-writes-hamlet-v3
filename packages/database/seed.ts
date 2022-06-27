import "dotenv-defaults/config";
import entriesJSon from "parse-hamlet/entries.json";
import { Entry } from "types";
import { db } from ".";
const entries = entriesJSon as Entry[];

const words = entries.flatMap((entry) => {
  const entryWords = [];
  if ("name" in entry) {
    entryWords.push(...entry.name.words);
  }

  if ("direction" in entry && entry.direction) {
    entryWords.push(...entry.direction.words);
  }

  entryWords.push(...entry.text.words);

  return entryWords;
});

let index = 1;
words.forEach((w) => {
  if (w.index !== index) {
    throw new Error(`index mismatch (${w.index} instead of ${index})`);
  }
  index++;
});

const rows = words.map((w) => {
  return { id: w.index, token: w.token, alternative: w.alternative || null };
});

db.batchInsert("words", rows).then(() => {
  console.log("done!");
  db.destroy();
});
