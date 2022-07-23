import { Entry, LiveTextContent, TextContent } from "types";
import entries from "parse-hamlet/entries.json";
import { db } from "database";
import { cloneDeep } from "lodash";
import invariant from "tiny-invariant";

function addTweetIdsInEntryField(
  entryField: TextContent,
  words: { id: number; tweet_id: string | null }[]
): LiveTextContent {
  return {
    ...entryField,
    words: entryField.words.map((w) => {
      const word = words.find((r) => r.id === w.index);
      invariant(!!word);
      return {
        ...w,
        tweetId: word.tweet_id,
      };
    }),
  };
}

async function entryToLiveEntry(entry: Entry): Promise<Entry<LiveTextContent>> {
  const liveEntry = cloneDeep(entry);
  const rows = (await db("words")
    .select(["id", "tweet_id"])
    .where({ entry_index: entry.index })) as {
    id: number;
    tweet_id: string | null;
  }[];

  if ("name" in liveEntry) {
    liveEntry.name = addTweetIdsInEntryField(liveEntry.name, rows);
  }
  if ("direction" in liveEntry && typeof liveEntry.direction !== "undefined") {
    liveEntry.direction = addTweetIdsInEntryField(liveEntry.direction, rows);
  }
  liveEntry.text = addTweetIdsInEntryField(liveEntry.text, rows);

  return liveEntry as Entry<LiveTextContent>;
}

export async function getEntriesInRange(
  entryIndex: number,
  { before, after }: { before: number; after: number }
): Promise<Entry<LiveTextContent>[]> {
  const index = entryIndex - 1;
  const start = Math.max(index - before, 0);
  const end = Math.min(index + after, entries.length - 1);

  const entriesInRange: Entry<LiveTextContent>[] = [];
  for (let i = start; i <= end; i++) {
    entriesInRange.push(await entryToLiveEntry(entries[i] as Entry));
  }

  return entriesInRange;
}
