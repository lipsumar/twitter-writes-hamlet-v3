import "env";
import Twitter from "core/Twitter";

const twitter = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

const word = process.argv[2];
twitter.search([word], null).then((res) => {
  console.log(
    res.tweets.filter(
      (tw) => !!tw.retweeted_status && tw.text.toLowerCase().includes(word)
    )
  );
});
