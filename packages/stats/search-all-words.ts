import "env";
import { db } from "database";
import { uniq } from "lodash";
import { readFileSync, writeFileSync } from "fs";
import Twitter from "core/Twitter";
import { Stats } from "./types";

// async function pause(ms: number) {
//   return new Promise((resolve) => {
//     setTimeout(resolve, ms);
//   });
// }

// (async () => {
//   const twitter = new Twitter({
//     consumer_key: process.env.TWITTER_CONSUMER_KEY,
//     consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
//     access_token: process.env.TWITTER_ACCESS_TOKEN_KEY,
//     access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
//   });

//   const allWords = await db("words").select("*");
//   const allWordsFlat = allWords
//     .flatMap((r) => [r.token, r.alternative].filter(Boolean))
//     .map((w: string) => w.toLowerCase());
//   const uniqueWords = uniq(allWordsFlat);

//   console.log(`${uniqueWords.length} unique words`);

//   const mostUsedWords = readFileSync(
//     "./3000-most-used-words.txt",
//     "utf-8"
//   ).split("\n");

//   const wordsToSearch = uniqueWords.filter((w) => !mostUsedWords.includes(w));

//   console.log(`${wordsToSearch.length} after removing most used`);

//   let stats: Stats = {}; //JSON.parse(readFileSync("./stats.json", "utf-8"));
//   let i = 0;
//   for (const word of wordsToSearch) {
//     console.log(`${word} (${i}/${wordsToSearch.length})`);

//     const { tweets } = await twitter.search([word], null, 100);
//     const tweetsToSave = tweets
//       .filter(
//         (tw) => !tw.retweeted_status && tw.text.toLowerCase().includes(word)
//       )
//       .map((tw) => ({
//         id: tw.id_str,
//         text: tw.text,
//         username: tw.user.screen_name,
//         created_at: tw.created_at,
//       }));
//     console.log(`  ${tweetsToSave.length} tweets`);
//     stats[word] = { tweets: tweetsToSave, at: new Date().toISOString() };
//     if (i % 100 === 0) {
//       writeFileSync(`./stats-${i}.json`, JSON.stringify(stats));
//       stats = {};
//     }

//     i++;
//     await pause(1900);
//   }
//   writeFileSync(`./stats-${i}.json`, JSON.stringify(stats));
// })();
