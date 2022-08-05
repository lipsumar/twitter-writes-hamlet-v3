import { readdirSync, readFileSync, writeFileSync } from "fs";

import invariant from "tiny-invariant";
import { parseScene } from "./parse-scene";
import { parseText } from "./parse-text";
import { Entry, Word } from "types";

/*

The Tragedy of Hamlet, Prince of Denmark.

ACT 1, Scene 1

...

ACT 1, Scene 2

*/

const files = readdirSync("./scenes-html-corrected");

const allEntries: Entry[] = [];

const title = "The Tragedy of Hamlet, Prince of Denmark";
const { lastIndex, words } = parseText(title, 1);
allEntries.push({
  type: "title",
  text: {
    raw: title,
    words: words,
  },
  index: 1,
  actNumber: 0,
  sceneNumber: 0,
});

let index = lastIndex + 1;
let entryIndex = 2;

for (const filename of files) {
  //if (filename !== "A1S1.html") continue;
  console.log("Parsing " + filename);

  const m = filename.match(/^A(\d)S(\d)/);
  invariant(m && m.length === 3, "bad filename");

  const actNumber = Number(m[1]);
  const sceneNumber = Number(m[2]);

  const sceneTitle = `Act ${actNumber}, Scene ${sceneNumber}`;
  const { lastIndex: sceneTitleLastIndex, words } = parseText(
    sceneTitle,
    index
  );
  allEntries.push({
    type: "title-scene",
    text: {
      raw: sceneTitle,
      words: words,
    },
    index: entryIndex++,
    actNumber,
    sceneNumber,
  });
  index = sceneTitleLastIndex + 1;

  const { entries, lastIndex, lastEntryIndex } = parseScene(
    readFileSync(`./scenes-html-corrected/${filename}`, "utf-8"),
    index,
    entryIndex,
    actNumber,
    sceneNumber
  );
  index = lastIndex + 1;
  entryIndex = lastEntryIndex + 1;

  allEntries.push(...entries);
}

function validateEntries(entries: Entry[]) {
  let index = 1;
  let entryIndex = 1;
  entries.forEach((entry) => {
    invariant(
      entry.index === entryIndex,
      `entry index mismatch (${entry.index} instead of ${entryIndex})`
    );
    entryIndex++;

    entry.text.words.forEach((w) => {
      // if (w.index !== index) {
      //   console.log(entry.text);
      // }
      invariant(
        w.index === index,
        "[text] word index mismatch (" + w.index + " instead of " + index + ")"
      );
      index++;
    });
  });
}

writeFileSync(
  "./entries-potentially-invalid.json",
  JSON.stringify(allEntries, null, 2)
);

validateEntries(allEntries);

console.log("✅ all entries valid!");

writeFileSync("./entries.json", JSON.stringify(allEntries, null, 2));
