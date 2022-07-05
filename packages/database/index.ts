import Knex from "knex";

if (!process.env.PG_CONNECTION_STRING) {
  throw new Error("PG_CONNECTION_STRING must be set");
}

export const db = Knex({
  client: "pg",
  connection: process.env.PG_CONNECTION_STRING,
});

export type TweetRecord = {
  id: string;
  tweet_text: string;
};

export type WordRecord = {
  id: number;
  token: string;
  alternative: string | null;
  tweet_id: string | null;
};
