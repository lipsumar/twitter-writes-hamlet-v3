import express from "express";
import { getLogs } from "core/lib";
import cors from "cors";

const app = express();

app.use(cors());

app.get("/logs", async (req, res) => {
  const logs = await getLogs([
    "search-result",
    "twitter.stream.start",
    "twitter.stream.stop",
  ]);
  res.send(logs);
});

export default app;
