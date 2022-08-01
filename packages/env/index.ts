import dotenv from "dotenv-defaults";
import path from "path";
dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
  defaults: path.resolve(__dirname, "../../.env.defaults"),
});

const requiredKeys = [
  "PG_CONNECTION_STRING",
  "TWITTER_BEARER_TOKEN",
  "TWITTER_CONSUMER_KEY",
  "TWITTER_CONSUMER_SECRET",
  "TWITTER_ACCESS_TOKEN_KEY",
  "TWITTER_ACCESS_TOKEN_SECRET",

  "TWH_CHEAT_API_KEY",
  "TWH_CHEAT_API_KEY_SECRET",
  "TWH_CHEAT_ACCESS_TOKEN",
  "TWH_CHEAT_ACCESS_TOKEN_SECRET",
];
requiredKeys.forEach((key) => {
  if (!process.env[key]) {
    throw new Error("Missing env var: " + key);
  }
});
