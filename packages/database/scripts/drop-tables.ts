import "env";
import { db } from "..";

(async () => {
  await db.schema.dropTableIfExists("words");
  await db.schema.dropTableIfExists("tweets");
  await db.schema.dropTableIfExists("logs");
  console.log("Done!");
  db.destroy();
})();
