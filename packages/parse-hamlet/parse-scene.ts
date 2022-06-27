import { JSDOM } from "jsdom";
import invariant from "tiny-invariant";
import { parseText } from "./parse-text";
import { Entry, Word } from "types";

export function parseScene(
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
        invariant(
          !("continued" in lastEntry),
          "cant add direction to continuedDialogue"
        );
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
      if (typeof entry.direction !== "undefined") {
        invariant(
          entry.direction.raw.trim() !== "",
          "dialogue.direction must have a text"
        );
      }
    }
  }
}
