import "dotenv-defaults/config";
import { db } from ".";

(async () => {
  await db.schema.createTable("tweets", (table) => {
    table.string("id", 32);
    table.timestamps();
    table.string("tweet_created_at", 24).notNullable();
    table.string("tweet_text");
    table.string("username", 32).notNullable();
    table.string("profile_image_url").notNullable();
    table.primary(["id"]);
  });

  await db.schema.createTable("words", (table) => {
    table.integer("id");
    table.timestamps();
    table.string("token", 20).notNullable();
    table.string("alternative", 20);
    table.string("tweet_id", 32);

    table.primary(["id"]);
    table.foreign("tweet_id").references("tweets.id");
  });

  db.destroy();
  console.log("Done!");
})();
