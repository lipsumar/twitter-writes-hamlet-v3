import {
  getCurrentCursor,
  getTweetAtIndex,
  getNextWords,
  setWordAsFound,
} from "./lib";
import SearchEngine from "./SearchEngine";
import Twitter from "./Twitter";
import { Tweet } from "./Twitter";
import { EventEmitter } from "events";
import logger from "logger";
const fakeOldTweet: Tweet = {
  created_at: "Mon Apr 08 16:47:52 +0000 2019",
  text: "blah",
  id_str: "1115295204754501632",
  user: {
    profile_image_url_https: "",
    screen_name: "",
  },
};

export default class Runner extends EventEmitter {
  twitterListener: Twitter;

  constructor() {
    super();
    this.twitterListener = new Twitter({
      consumer_key: process.env.TWITTER_CONSUMER_KEY,
      consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
      access_token: process.env.TWITTER_ACCESS_TOKEN_KEY,
      access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    });
  }

  async run() {
    let currentCursor = await getCurrentCursor();

    const lastTweet =
      currentCursor === 1
        ? fakeOldTweet
        : await getTweetAtIndex(currentCursor - 1);
    if (lastTweet === null) {
      logger.info("its over!!!");
      return;
    }

    const wordsToListen = await getNextWords(1);

    const searchEngine = new SearchEngine(wordsToListen, this.twitterListener);
    searchEngine.on("match", async ({ tweet, word, source }) => {
      await setWordAsFound(word, tweet, source);
      this.emit("match", { word, tweet, source });
      currentCursor = await getCurrentCursor();
      const nextWords = await getNextWords(1);
      searchEngine.findWord(nextWords[0], tweet);
      this.emit("watch", { word: nextWords[0] });
    });
    searchEngine.findWord(wordsToListen[0], lastTweet);
    this.emit("watch", { word: wordsToListen[0] });
  }
}
