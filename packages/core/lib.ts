import { db, WordRecord } from "database";
import { Word } from "types";
import { Tweet } from "./Twitter";

function wordRecordToWord(row: WordRecord): Word {
  return {
    index: row.id,
    token: row.token,
    alternative: row.alternative || undefined,
  };
}

export async function getCurrentCursor(): Promise<number> {
  const row = await db
    .select("id")
    .from("words")
    .whereNull("tweet_id")
    .orderBy("id", "asc")
    .first();
  return row.id;
}

export async function getWordsAt(index: number, count = 3): Promise<Word[]> {
  const rows = await db
    .select<WordRecord[]>("*")
    .from("words")
    .whereNull("tweet_id")
    .orderBy("id", "asc")
    .limit(count);
  return rows.map(wordRecordToWord);
}

export async function setWordAsFound(word: Word, tweet: Tweet, source: string) {
  await db("tweets").insert({
    tweet_created_at: tweet.created_at,
    tweet_text: tweet.text,
    username: tweet.user.screen_name,
    profile_image_url: tweet.user.profile_image_url_https,
    id: tweet.id_str,
  });
  await db("words")
    .where({ id: word.index })
    .update({ tweet_id: tweet.id_str, source });
}

export async function getTweetAtIndex(index: number): Promise<Tweet> {
  const rows = await db("words")
    .join("tweets", "words.tweet_id", "tweets.id")
    .select("tweets.*")
    .where({ "words.id": index })
    .limit(1);
  return rows[0];
}

export type DbLog = {
  message: string;
  data?: Record<string, any>;
};
export async function dbLog(message: string, data: DbLog["data"]) {
  await db("logs").insert({ message, data });
}
