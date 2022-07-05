declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TWITTER_BEARER_TOKEN: string;
      PG_CONNECTION_STRING: string;
      TWITTER_CONSUMER_KEY: string;
      TWITTER_CONSUMER_SECRET: string;
      TWITTER_ACCESS_TOKEN_KEY: string;
      TWITTER_ACCESS_TOKEN_SECRET: string;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
