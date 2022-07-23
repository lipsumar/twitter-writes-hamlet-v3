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

type DbWord = {
  id: number;
  token: string;
  alternative: string | null;
  entry_index: number;
  entry_field: "text" | "name" | "direction";
  tweet_id: string | null;
  source: string | null;
};
export async function getCurrentWord(): Promise<DbWord> {
  const row = await db
    .select("*")
    .from("words")
    .whereNull("tweet_id")
    .orderBy("id", "asc")
    .first();
  return row;
}

export async function getNextWords(count = 3): Promise<Word[]> {
  const rows = await db
    .select<WordRecord[]>("*")
    .from("words")
    .whereNull("tweet_id")
    .orderBy("id", "asc")
    .limit(count);
  return rows.map(wordRecordToWord);
}

export async function getDbWordsAt(indices: number[]): Promise<DbWord[]> {
  return db
    .select<DbWord[]>("*")
    .from("words")
    .whereIn("id", indices)
    .orderBy("id", "asc");
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

type DbTweet = {
  tweet_created_at: string;
  tweet_text: string;
  username: string;
  profile_image_url: string;
  id: string;
};
function dbTweetToTweet(dbTweet: DbTweet): Tweet {
  return {
    created_at: dbTweet.tweet_created_at,
    text: dbTweet.tweet_text,
    id_str: dbTweet.id,
    user: {
      screen_name: dbTweet.username,
      profile_image_url_https: dbTweet.profile_image_url,
    },
  };
}
export async function getTweetAtIndex(index: number): Promise<Tweet> {
  const rows = await db("words")
    .join("tweets", "words.tweet_id", "tweets.id")
    .select("tweets.*")
    .where({ "words.id": index })
    .limit(1);
  return dbTweetToTweet(rows[0]);
}

export type DbLog = {
  message: string;
  created_at: string;
  data?: Record<string, any>;
};
export async function dbLog(message: string, data: DbLog["data"]) {
  await db("logs").insert({ message, data });
}

export async function getLogs(filterMessages: string[]): Promise<DbLog[]> {
  return (await db("logs")
    .select("*")
    .whereIn("message", filterMessages)
    .orderBy("created_at", "asc")) as DbLog[];
}

export type DbEntry = {
  id: number;
  type: "dialogue" | "direction" | "title";
  text_raw: string;
  name_raw: string | null;
  direction_raw: string | null;
  continued: boolean;
  title_type: "title" | "scene";
};
