import { readFileSync, readdirSync } from "fs";
import Twitter from "core/Twitter"; // wtf wtf wtf

import { Stats } from "./types";

const files = readdirSync("./data/2022-08-02").filter((f: string) =>
  /stats-\d+\.json/.test(f)
);

const all: Stats = {};
for (const file of files) {
  const content = JSON.parse(readFileSync(file, "utf-8"));
  Object.assign(all, content);
}

const shown = Object.entries(all).filter(
  ([word, content]) => content.tweets.length === 0 && !word.includes("'")
);

shown.forEach(([word, content]) => {
  console.log(word);
});
console.log(`${shown.length}`);
