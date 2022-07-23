import { useEffect, useState } from "react";
import invariant from "tiny-invariant";
import { Entry, LiveTextContent, LiveWord, TextContent } from "types";
import HamletEntry from "./HamletEntry";

type HamletTextProps = {
  initialEntries: Entry<LiveTextContent>[];
};

function updateWord(
  word: {
    id: number;
    entry_index: number;
    entry_field: "text" | "name" | "direction";
    tweet_id: string | null;
  },
  entries: Entry<LiveTextContent>[]
): Entry<LiveTextContent>[] {
  return entries.map((entry) => {
    if (entry.index !== word.entry_index) {
      return entry;
    }
    invariant(word.entry_field in entry);
    const textContent = (entry as any)[word.entry_field] as TextContent;
    return {
      ...entry,
      [word.entry_field]: {
        ...textContent,
        words: textContent.words.map((w) => {
          if (w.index !== word.id) return w;
          return { ...w, tweetId: word.tweet_id };
        }),
      },
    };
  });
}

export default function HamletText({ initialEntries }: HamletTextProps) {
  const [entries, setEntries] = useState(initialEntries);

  useEffect(() => {
    const source = new EventSource("http://localhost:5000/events");
    source.onmessage = (e) => {
      if (e.data === '"hello"') {
        return;
      }
      const data = JSON.parse(e.data);
      // @todo validate we're up to date
      setEntries(updateWord(data.word, entries));
    };
    return () => source.close();
  }, []);

  return (
    <>
      {entries.map((entry: Entry<LiveTextContent>) => (
        <HamletEntry key={entry.index} entry={entry} />
      ))}
    </>
  );
}
