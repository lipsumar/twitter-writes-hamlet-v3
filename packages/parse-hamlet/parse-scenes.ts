import { lchown, readdirSync, readFileSync, writeFileSync } from "fs";
import { JSDOM } from "jsdom";
import invariant from "tiny-invariant";
import { parseText } from "./parse-text";
import { Entry, Scene, Word } from "./types";

function parseScene(
  htmlPage: string,
  indexOffset: number,
  entryIndexOffset: number
): { entries: Entry[]; lastIndex: number; lastEntryIndex: number } {
  const dom = new JSDOM(htmlPage);
  const mainDiv = dom.window.document.querySelector("body > div.text");
  invariant(mainDiv);
  const nodes = mainDiv.childNodes.values();

  const entries: Entry[] = [];

  const getLastEntry = () => entries[entries.length - 1] || {};
  const appendToEntry = (text: string, words: Word[], entry: Entry) => {
    entry.text.raw += (entry.text.raw !== "" ? " " : "") + text;
    entry.text.words.push(...words);
  };

  const appendToLastEntry = (text: string, words: Word[]) =>
    appendToEntry(text, words, getLastEntry());

  let index = indexOffset;
  let entryIndex = entryIndexOffset;

  for (const node of nodes) {
    const { nodeName, textContent } = node;

    if (!textContent) continue;
    const text = textContent.trim().replaceAll(/[\s\u00A0]+/g, " ");

    if (!text) continue;

    if (!["I", "B", "#text"].includes(nodeName)) {
      continue;
    }

    const { words, lastIndex } = parseText(text, index);
    index = lastIndex + 1;

    const lastEntry = getLastEntry();

    if (nodeName === "I") {
      if (lastEntry.type === "direction") {
        appendToLastEntry(text, words);
      } else if (lastEntry.type === "dialogue" && lastEntry.text.raw === "") {
        lastEntry.direction = { raw: text, words };
      } else {
        entries.push({
          type: "direction",
          text: {
            raw: text,
            words,
          },
          index: entryIndex++,
        });
      }
    }

    if (nodeName === "B") {
      entries.push({
        type: "dialogue",
        name: { raw: text, words },
        text: { raw: "", words: [] },
        index: entryIndex++,
      });
    }

    if (nodeName === "#text") {
      if (lastEntry.type === "dialogue") {
        appendToLastEntry(text, words);
      } else {
        // continued dialogue after a direction
        const previousDialogue = entries[entries.length - 2];
        invariant(previousDialogue.type === "dialogue");
        entries.push({
          type: "dialogue",
          continued: true,
          // name: previousDialogue.name,
          text: { raw: text, words },
          index: entryIndex++,
        });
      }
    }
    //console.log(nodeName, "--", entryIndex);
  }

  entries.forEach((e, i) => {
    try {
      validateEntry(e);
    } catch (err: any) {
      console.log(`Invalid entry #${i}:`, e);
      console.log(err.message);
      console.log("- previous: ", entries[i - 1] || "none");
    }
  });
  //console.log(JSON.stringify(entries, null, 2));

  return { entries, lastIndex: index - 1, lastEntryIndex: entryIndex - 1 };
}

function validateEntry(entry: Entry): void {
  if (entry.type === "direction") {
    invariant(entry.text.raw.trim() !== "", "direction must have a text");
  }
  if (entry.type === "dialogue") {
    invariant(entry.text.raw.trim() !== "", "dialogue must have a text");
    if (!("continued" in entry)) {
      invariant(entry.name.raw.trim() !== "", "dialogue must have a name");
    }

    // if (
    //   entry.name !== 'All' &&
    //   entry.name !== 'Lord' &&
    //   entry.name !== 'Ambassador'
    // )
    //   invariant(
    //     entry.name.match(/^[A-Z]+$/),
    //     'dialogue name must be uppercase'
    //   );

    if (typeof entry.direction !== "undefined") {
      invariant(
        entry.direction.raw.trim() !== "",
        "dialogue.direction must have a text"
      );
    }
  }
}

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
        typeof entry.direction === "undefined",
        "continued dialogue cant have direction"
      );
    }
    if ("direction" in entry) {
      invariant(entry.direction, "entry.direction cant be set and empty");
      entry.direction.words.forEach((w) => {
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

writeFileSync("./entries.json", JSON.stringify(allEntries, null, 2));
