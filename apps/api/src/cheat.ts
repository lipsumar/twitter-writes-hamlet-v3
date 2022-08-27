import { TwitterApi } from "twitter-api-v2";

const twitterClient = new TwitterApi({
  appKey: process.env.TWH_CHEAT_API_KEY,
  appSecret: process.env.TWH_CHEAT_API_KEY_SECRET,
  accessToken: process.env.TWH_CHEAT_ACCESS_TOKEN,
  accessSecret: process.env.TWH_CHEAT_ACCESS_TOKEN_SECRET,
});

export async function tweet(status: string) {
  await twitterClient.v2.tweet(status);
}
