import "env";
import entriesJSon from "parse-hamlet/entries.json";
import { Entry } from "types";
import { db } from "..";
const entries = entriesJSon as Entry[];

const words = entries.flatMap((entry) => {
  const entryWords = [];
  if ("name" in entry) {
    entryWords.push(
      ...entry.name.words.map((w) => ({
        ...w,
        entryIndex: entry.index,
        entryField: "name",
      }))
    );
  }

  if ("direction" in entry && entry.direction) {
    entryWords.push(
      ...entry.direction.words.map((w) => ({
        ...w,
        entryIndex: entry.index,
        entryField: "direction",
      }))
    );
  }

  entryWords.push(
    ...entry.text.words.map((w) => ({
      ...w,
      entryIndex: entry.index,
      entryField: "text",
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
    entry_field: w.entryField,
  };
});

const entryRows = entries.map((entry) => {
  const row: any = {
    id: entry.index,
    type: entry.type,
    text_raw: entry.text.raw,
  };
  if ("name" in entry) {
    row.name_raw = entry.name.raw;
  }
  if ("direction" in entry && entry.direction) {
    row.direction_raw = entry.direction.raw;
  }
  if ("continued" in entry && entry.continued) {
    row.continued = true;
  }
  if ("titleType" in entry) {
    row.title_type = entry.titleType;
  }
  return row;
});

(async () => {
  await db.batchInsert("entries", entryRows);
  await db.batchInsert("words", rows);
  console.log("done!");
  db.destroy();
})();
