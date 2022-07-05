import invariant from "tiny-invariant";
import Twit from "twit";
import { dbLog } from "./lib";

const windowDuration = 1000 * 60 * 15;

export type Tweet = {
  retweeted_status?: {};
  text: string;
  id_str: string;
  created_at: string;
  user: {
    screen_name: string;
    profile_image_url_https: string;
  };
};

export default class Twitter {
  appClient: Twit;
  userClient: Twit;
  stream: Twit.Stream | null = null;
  searchCountInLastWindow: number = 0;
  windowStart: number = 0;
  windowEnd: number = 0;

  constructor(options: Twit.Options) {
    this.appClient = new Twit({
      app_only_auth: true,
      consumer_key: options.consumer_key,
      consumer_secret: options.consumer_secret,
    });
    this.userClient = new Twit({
      consumer_key: options.consumer_key,
      consumer_secret: options.consumer_secret,
      access_token: options.access_token,
      access_token_secret: options.access_token_secret,
    });

    this.startWindow();
  }

  private startWindow() {
    this.windowStart = new Date().getTime();
    this.windowEnd = this.windowStart + windowDuration;
    this.searchCountInLastWindow = 0;
  }

  async search(
    words: string[],
    since_id: string | null = null,
    limit: number = 10
  ): Promise<{ tweets: Tweet[]; rateLimitRemaining: number }> {
    const resp = await this.appClient.get("search/tweets", {
      q: words.join(","),
      result_type: "recent",
      since_id: since_id || undefined,
      count: limit,
      tweet_mode: "extended",
    });

    this.searchCountInLastWindow++;
    if (new Date().getTime() > this.windowEnd) {
      this.startWindow();
    }
    console.log(`[search] ${this.searchCountInLastWindow}/450`);
    return {
      tweets: (resp.data as any).statuses.map((tw: any) => ({
        ...tw,
        text: tw.full_text,
      })) as Tweet[],
      rateLimitRemaining: parseInt(
        resp.resp.headers["x-rate-limit-remaining"] as string,
        10
      ),
    };
  }

  startTracking(tokens: string[], onTweet: (tweet: Tweet) => void) {
    const stream = this.userClient.stream("statuses/filter", {
      track: tokens.join(","),
    });
    stream.on("tweet", onTweet);
    stream.on("limit", (msg) => {
      console.log("Stream: limit", msg);
      dbLog("twitter.stream.limit", { msg });
    });
    stream.on("disconnect", (msg) => {
      console.log("Stream: disconnect", msg);
      dbLog("twitter.stream.disconnect", { msg });
    });
    stream.on("connected", (msg) => {
      console.log("Stream: connected");
    });
    stream.on("reconnect", (msg) => {
      console.log("Stream: reconnect", msg);
      dbLog("twitter.stream.reconnect", { msg });
    });
    stream.on("warning", (msg) => {
      console.log("Stream: warning", msg);
      dbLog("twitter.stream.warning", { msg });
    });
    stream.on("error", (msg) => {
      console.log("Stream: error", msg);
      dbLog("twitter.stream.error", { msg });
    });
    this.stream = stream;
  }

  stopTracking() {
    invariant(this.stream !== null, "stopTracking: no stream");
    this.stream.stop();
  }
}
