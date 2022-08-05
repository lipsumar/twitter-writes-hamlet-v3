import { JSDOM } from "jsdom";
import invariant from "tiny-invariant";
import { parseText } from "./parse-text";
import { Entry, Word } from "types";

function ucFirst(str: string): string {
  return str[0].toUpperCase() + str.substring(1).toLowerCase();
}

function fixNameCapitalization(str: string): string {
  const m = str.match(/([A-Z]{2,})/g);
  m?.forEach((upper) => {
    str = str.replace(upper, ucFirst(upper));
  });
  return str;
}

export function parseScene(
  htmlPage: string,
  indexOffset: number,
  entryIndexOffset: number,
  actNumber: number,
  sceneNumber: number
): { entries: Entry[]; lastIndex: number; lastEntryIndex: number } {
  const dom = new JSDOM(htmlPage);
  const mainDiv = dom.window.document.querySelector("body > div.text");
  invariant(mainDiv);
  const nodes = mainDiv.childNodes.values();

  const entries: Entry[] = [];

  let index = indexOffset;
  let entryIndex = entryIndexOffset;
  let lastLineNumber = null;
  for (const node of nodes) {
    const { nodeName, textContent } = node;

    if (!["I", "B", "#text", "CODE"].includes(nodeName)) {
      continue;
    }

    if (!textContent) continue;
    let text = textContent.trim().replaceAll(/[\s\u00A0]+/g, " ");

    if (!text) continue;

    if (nodeName === "CODE") {
      const parsedLineNumber = parseInt(text, 10);
      invariant(
        Number.isInteger(parsedLineNumber),
        "line number expected to be integer"
      );
      lastLineNumber = parsedLineNumber;
      continue;
    }

    if (nodeName === "B") {
      text = fixNameCapitalization(text);
    }

    const { words, lastIndex } = parseText(text, index);
    index = lastIndex + 1;

    if (nodeName === "I") {
      entries.push({
        index: entryIndex++,
        type: "direction",
        text: { raw: text, words },
        actNumber,
        sceneNumber,
      });
    }

    if (nodeName === "B") {
      entries.push({
        index: entryIndex++,
        type: "name",
        text: { raw: text, words },
        actNumber,
        sceneNumber,
      });
    }

    if (nodeName === "#text") {
      invariant(typeof lastLineNumber === "number");
      entries.push({
        index: entryIndex++,
        type: "dialogue",
        text: { raw: text, words },
        lineNumber: lastLineNumber,
        actNumber,
        sceneNumber,
      });
    }
  }

  entries.forEach((e, i) => {
    try {
      validateEntry(e);
    } catch (err: any) {
      console.log(`Invalid entry #${i}:`, e);
      console.log(err.message);
      console.log("- previous: ", entries[i - 1] || "none");
      throw err;
    }
  });

  return { entries, lastIndex: index - 1, lastEntryIndex: entryIndex - 1 };
}

function validateEntry(entry: Entry): void {
  if (entry.type === "dialogue") {
    invariant(
      typeof entry.lineNumber === "number",
      "dialogue must have lineNumber"
    );
  }
}
