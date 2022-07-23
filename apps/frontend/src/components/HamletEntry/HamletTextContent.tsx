import { LiveTextContent, LiveWord as LiveWordType } from "types";
import LiveWord from "./LiveWord";
type HamletEntryProps = {
  textContent: LiveTextContent;
  as?: "div" | "span";
};
export default function HamletTextContent({
  textContent,
  as,
}: HamletEntryProps) {
  const { raw, words } = textContent;
  const Tag = as || "div";

  let rawIndex = 0;
  let previousWord: LiveWordType | null = null;
  return (
    <Tag>
      {words.flatMap((word, i) => {
        if (!word.tweetId && previousWord && !previousWord.tweetId) {
          previousWord = word;
          return null;
        }
        const wordIndex = raw.indexOf(word.token, rawIndex);
        let spacerToken = null;

        if (wordIndex !== rawIndex) {
          // there is something before next word
          spacerToken = raw.substring(rawIndex, wordIndex);
        }
        rawIndex = wordIndex + word.token.length;
        const token = <LiveWord key={i} word={word} />;
        previousWord = word;

        if (spacerToken) {
          return [spacerToken, token];
        }
        return token;
      })}
    </Tag>
  );
}
