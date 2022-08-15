import express from "express";
import { lib as coreLib } from "core";
import cors from "cors";
import { getCompletedCount, getEntriesInRange } from "./lib";
import { Runner } from "core";
import { tweet } from "./cheat";
import { faker } from "@faker-js/faker";
import { getTweetAtIndex } from "core/lib";

const { getCurrentWord, getDbWordsAt, getLogs } = coreLib;

const app = express();

const runner = new Runner();

app.use(cors());

app.get("/logs", async (req, res) => {
  const logs = await getLogs([
    "search-result",
    "twitter.stream.start",
    "twitter.stream.stop",
  ]);
  res.send(logs);
});

app.get("/init", async (req, res) => {
  const currentWord = await getCurrentWord();

  res.send({
    currentWord,
    entries: await getEntriesInRange(currentWord.entry_index, {
      before: 15,
      after: 1,
    }),
    stats: {
      total: 31979,
      completed: await getCompletedCount(),
    },
  });
});

app.get("/entry/:entryIndex", async (req, res) => {
  const entries = await getEntriesInRange(Number(req.params.entryIndex), {
    before: 0,
    after: 0,
  });
  res.send(entries[0]);
});

app.get("/tweet/:tweetId", async (req, res) => {
  const tweetId = parseInt(req.params.tweetId, 10);
  const tweet = await getTweetAtIndex(tweetId);
  res.send(tweet);
});

let clients: any[] = [];
app.get("/events", (req, res) => {
  const headers = {
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
    "Cache-Control": "no-cache",
  };
  res.writeHead(200, headers);

  const data = `data: ${JSON.stringify("hello")}\n\n`;

  res.write(data);

  const clientId = Date.now();

  const newClient = {
    id: clientId,
    res,
  };

  clients.push(newClient);

  req.on("close", () => {
    console.log(`${clientId} Connection closed`);
    clients = clients.filter((client) => client.id !== clientId);
  });
});
function broadcast(data: any) {
  clients.forEach((client) =>
    client.res.write(`data: ${JSON.stringify(data)}\n\n`)
  );
}

let cheatTimeout: NodeJS.Timeout;

runner.on("match", async ({ word }) => {
  if (cheatTimeout) {
    clearTimeout(cheatTimeout);
  }
  const dbWords = await getDbWordsAt([word.index, word.index + 1]);
  broadcast({ word: dbWords[0], currentWord: dbWords[1] });
});

runner.on("watch", ({ word }) => {
  cheatTimeout = setTimeout(() => {
    tweet(`${faker.lorem.words()} ${word.token} ${faker.lorem.words()}`);
    console.log("=====> cheat tweet", word.token);
  }, 1000 * 60 * 60 * 24);
});
runner.run();

export default app;
