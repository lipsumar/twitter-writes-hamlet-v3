import { LiveWord as LiveWordType } from "types";

type LiveWordProps = {
  word: LiveWordType;
};
export default function LiveWord({ word }: LiveWordProps) {
  if (!word.tweetId) {
    return <span style={{ opacity: 0.5 }}>{word.token}</span>;
  }
  return <span>{word.token}</span>;
}
