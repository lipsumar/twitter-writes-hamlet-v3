import "env";
import entriesJSon from "parse-hamlet/entries.json";
import { Entry } from "types";
import { db } from "..";
const entries = entriesJSon as Entry[];

const words = entries.flatMap((entry) => {
  const entryWords = [];

  entryWords.push(
    ...entry.text.words.map((w) => ({
      ...w,
      entryIndex: entry.index,
    }))
  );

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
  return {
    id: w.index,
    token: w.token,
    alternative: w.alternative || null,
    entry_index: w.entryIndex,
  };
});

const entryRows = entries.map((entry) => {
  const row: any = {
    id: entry.index,
    type: entry.type,
    text_raw: entry.text.raw,
    act_number: entry.actNumber,
    scene_number: entry.sceneNumber,
    line_number: entry.lineNumber || null,
  };
  return row;
});

(async () => {
  await db.batchInsert("entries", entryRows);
  await db.batchInsert("words", rows);
  console.log("done!");
  db.destroy();
})();
