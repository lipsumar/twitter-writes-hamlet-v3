import "env";
import { db } from "..";

(async () => {
  await db.schema.dropTableIfExists("words");
  await db.schema.dropTableIfExists("tweets");
  console.log("Done!");
  db.destroy();
})();
