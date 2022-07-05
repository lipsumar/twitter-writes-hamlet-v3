import "env";
import {
  getCurrentCursor,
  getTweetAtIndex,
  getWordsAt,
  setWordAsFound,
} from "./lib";
import SearchEngine from "./SearchEngine";
import Twitter from "./Twitter";
import { Tweet } from "./Twitter";

const fakeOldTweet: Tweet = {
  created_at: "Mon Apr 08 16:47:52 +0000 2019",
  text: "blah",
  id_str: "1115295204754501632",
  user: {
    profile_image_url_https: "",
    screen_name: "",
  },
};

(async () => {
  const twitterListener = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  });
  let currentCursor = await getCurrentCursor();

  const lastTweet =
    currentCursor === 1
      ? fakeOldTweet
      : await getTweetAtIndex(currentCursor - 1);

  const wordsToListen = await getWordsAt(currentCursor, 1);

  const searchEngine = new SearchEngine(wordsToListen, twitterListener);
  searchEngine.on("match", async ({ tweet, word, source }) => {
    //console.log("match found, next word");
    await setWordAsFound(word, tweet, source);
    currentCursor = await getCurrentCursor();
    const nextWords = await getWordsAt(currentCursor, 1);
    searchEngine.findWord(nextWords[0], tweet);
  });
  searchEngine.findWord(wordsToListen[0], lastTweet);
})();
