import { Word } from "types";
import _ from "lodash";
import invariant from "tiny-invariant";
import { Tweet } from "./Twitter";
import { EventEmitter } from "events";
import Twitter from "./Twitter";
import { dbLog } from "./lib";
import logger from "logger";
async function pause(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export default class SearchEngine extends EventEmitter {
  upcomingWords: Word[];
  currentIndex: number;
  twitter: Twitter;

  constructor(upcomingWords: Word[], twitter: Twitter) {
    super();
    invariant(
      upcomingWords.length > 0,
      "cant create SearchEngine without words"
    );
    this.currentIndex = upcomingWords[0].index;
    this.twitter = twitter;
    this.upcomingWords = upcomingWords;
  }

  async findWord(word: Word, previousTweet: Tweet) {
    // first, try search
    //this.log("-> findWord", word);
    const tweet = await this.twitterSearch(word, previousTweet, 15);
    if (tweet) {
      this.log("FOUND", tweet.text);
      this.emit("match", { tweet, word, source: "search-1" });
      dbLog("found", { wordIndex: word.index, source: "search-1" });
    } else {
      const delay = 1000;
      //this.log(`first search failed, retrying in ${delay}`);
      await pause(delay);
      const tweet2 = await this.twitterSearch(word, previousTweet, 30);
      if (tweet2) {
        this.log("FOUND", tweet2.text);
        this.emit("match", { tweet: tweet2, word, source: "search-2" });
        dbLog("found", { wordIndex: word.index, source: "search-2" });
      } else {
        //this.log("second search failed, setting up stream");
        this.twitterStream(word, previousTweet);
      }
    }
  }

  async twitterSearch(word: Word, previousTweet: Tweet, limit: number) {
    const terms = this.getAllTermsForWord(word);
    dbLog("twitter.search", { wordIndex: word.index, limit });
    this.log(`twitter.search (${limit})`, terms);
    const result = await this.twitter.search(
      terms,
      previousTweet.id_str,
      limit
    );
    dbLog("search-result", {
      rateLimitRemaining: result.rateLimitRemaining,
      wordIndex: word.index,
    });
    // console.log(result.tweets);
    const tweets = result.tweets
      .filter((tw) => this.isTweetAcceptable(tw, previousTweet))
      .reverse();
    this.log(
      `found ${result.tweets.length} tweets, ${tweets.length} acceptable`
    );

    const matchingTweet = tweets.find((tw) => this.matchTweet(tw, terms));
    return matchingTweet;
  }

  isTweetAcceptable(tweet: Tweet, previousTweet: Tweet): boolean {
    return (
      !tweet.retweeted_status &&
      new Date(tweet.created_at).getTime() >
        new Date(previousTweet.created_at).getTime()
    );
  }

  twitterStream(word: Word, previousTweet: Tweet) {
    const terms = this.getAllTermsForWord(word);
    this.log(`twitter.stream`, terms);
    dbLog("twitter.stream.start", { wordIndex: word.index });
    let found = false;

    const searchInterval = setInterval(async () => {
      const tweet = await this.twitterSearch(word, previousTweet, 15);
      if (found) {
        clearInterval(searchInterval);
        return;
      }
      if (tweet) {
        clearInterval(searchInterval);
        this.twitter.stopTracking();
        dbLog("twitter.stream.stop", { wordIndex: word.index });
        this.log("FOUND(bg search)", tweet.text);
        this.emit("match", { tweet: tweet, word, source: "bg-search" });
        dbLog("found", { wordIndex: word.index, source: "bg-search" });
      }
    }, 5000);

    this.twitter.startTracking(terms, (tweet) => {
      if (!this.isTweetAcceptable(tweet, previousTweet)) {
        //this.log("found tweet but not acceptable");
        return;
      }
      if (this.matchTweet(tweet, terms)) {
        found = true;
        clearInterval(searchInterval);
        this.twitter.stopTracking();
        dbLog("twitter.stream.stop", { wordIndex: word.index });
        this.log("FOUND(stream)", tweet.text);
        this.emit("match", { tweet: tweet, word, source: "stream" });
        dbLog("found", { wordIndex: word.index, source: "stream" });
      }
    });
  }

  matchTweet(tweet: Tweet, terms: string[]): boolean {
    if (!tweet.text) {
      logger.warn(`tweet w/ no text ${JSON.stringify(tweet)}`);
    }
    return !!terms.find((t) => tweet.text.toLowerCase().includes(t));
  }

  getAllTermsForWord(word: Word): string[] {
    const terms = [word.token.toLowerCase()];
    if (word.alternative) {
      terms.push(word.alternative.toLowerCase());
    }
    return terms;
  }

  log(msg: string, data?: any) {
    logger.log({ message: `${msg}`, level: "info", data });
  }
}
