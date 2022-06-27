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
  titleType: "title",
  text: {
    raw: title,
    words: words,
  },
  index: 1,
});

let index = lastIndex + 1;
let entryIndex = 2;

for (const filename of files) {
  //if (filename !== "A1S1.html") continue;
  console.log("Parsing " + filename);

  const m = filename.match(/^A(\d)S(\d)/);
  if (!m) throw new Error("bad filename");

  const actNumber = Number(m[1]);
  const sceneNumber = Number(m[2]);

  const sceneTitle = `Act ${actNumber}, Scene ${sceneNumber}`;
  const { lastIndex: sceneTitleLastIndex, words } = parseText(
    sceneTitle,
    index
  );
  allEntries.push({
    type: "title",
    titleType: "scene",
    text: {
      raw: sceneTitle,
      words: words,
    },
    index: entryIndex++,
  });
  index = sceneTitleLastIndex + 1;

  const { entries, lastIndex, lastEntryIndex } = parseScene(
    readFileSync(`./scenes-html-corrected/${filename}`, "utf-8"),
    index,
    entryIndex
  );
  index = lastIndex + 1;
  entryIndex = lastEntryIndex + 1;

  allEntries.push(...entries);
}

const stats = { longestWord: "" };

function statWord(w: Word) {
  if (w.token.length > stats.longestWord.length) {
    stats.longestWord = w.token;
  }
  if (
    typeof w.alternative === "string" &&
    w.alternative.length > stats.longestWord.length
  ) {
    stats.longestWord = w.alternative;
  }
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
    if (entry.type === "dialogue" && !("continued" in entry)) {
      entry.name.words.forEach((w) => {
        statWord(w);
        if (w.index !== index) {
          console.log(entries[entryIndex - 1].text);
          console.log(entry.name);
        }
        invariant(
          w.index === index,
          "[name] word index mismatch (" +
            w.index +
            " instead of " +
            index +
            ")"
        );
        index++;
      });
    }
    if (
      entry.type === "dialogue" &&
      "continued" in entry &&
      entry.continued === true
    ) {
      invariant(
        typeof (entry as any).direction === "undefined",
        "continued dialogue cant have direction"
      );
    }
    if ("direction" in entry) {
      invariant(entry.direction, "entry.direction cant be set and empty");
      entry.direction.words.forEach((w) => {
        statWord(w);
        if (w.index !== index) {
          console.log(entry.direction);
        }
        invariant(
          w.index === index,
          `[direction] word index mismatch (${w.index} instead of ${index})`
        );
        index++;
      });
    }
    entry.text.words.forEach((w) => {
      statWord(w);
      if (w.index !== index) {
        console.log(entry.text);
      }
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
console.log(stats);
writeFileSync("./entries.json", JSON.stringify(allEntries, null, 2));
