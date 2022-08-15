import { Entry, TextContent } from "types";
import entries from "parse-hamlet/entries.json";
import { db, TweetRecord } from "database";
import { cloneDeep } from "lodash";
import invariant from "tiny-invariant";

async function entryToLiveEntry(entry: Entry): Promise<Entry> {
  const liveEntry = cloneDeep(entry);
  const rows = (await db("words")
    .select(["id", "tweet_id"])
    .where({ entry_index: entry.index })) as {
    id: number;
    tweet_id: string | null;
  }[];

  liveEntry.text = {
    ...liveEntry.text,
    words: liveEntry.text.words.map((w) => {
      const word = rows.find((r) => r.id === w.index);
      invariant(!!word);
      return {
        ...w,
        tweetId: word.tweet_id,
      };
    }),
  };

  return liveEntry;
}

export async function getEntriesInRange(
  entryIndex: number,
  { before, after }: { before: number; after: number }
): Promise<Entry[]> {
  const index = entryIndex - 1;
  const start = Math.max(index - before, 0);
  const end = Math.min(index + after, entries.length - 1);

  const entriesInRange: Entry[] = [];
  for (let i = start; i <= end; i++) {
    entriesInRange.push(await entryToLiveEntry(entries[i] as Entry));
  }

  return entriesInRange;
}

export async function getCompletedCount() {
  const row = await db("words").count().whereNotNull("tweet_id");
  return parseInt(row[0].count as string, 10);
}
