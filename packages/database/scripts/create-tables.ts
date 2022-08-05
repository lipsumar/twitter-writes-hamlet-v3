import "env";
import { db } from "..";

(async () => {
  await db.schema.createTable("tweets", (table) => {
    table.string("id", 32);
    table.string("tweet_created_at", 30).notNullable();
    table.string("tweet_text", 2000).notNullable(); // seen in the wild: 982
    table.string("username", 32).notNullable();
    table.string("profile_image_url").notNullable();

    table.primary(["id"]);
  });

  await db.schema.createTable("entries", (table) => {
    table.integer("id");
    table
      .enu("type", ["dialogue", "name", "direction", "title", "title-scene"])
      .notNullable();
    table.string("text_raw", 500).notNullable();
    table.integer("act_number").notNullable();
    table.integer("scene_number").notNullable();
    table.integer("line_number");

    table.primary(["id"]);
  });

  await db.schema.createTable("words", (table) => {
    table.integer("id");
    table.string("token", 20).notNullable();
    table.string("alternative", 20);
    table.integer("entry_index").notNullable();
    table.string("tweet_id", 32);
    table.string("source", 16);

    table.primary(["id"]);
    table.foreign("tweet_id").references("tweets.id");
    table.foreign("entry_index").references("entries.id");
  });

  await db.schema.createTable("logs", (table) => {
    table.increments("id");
    table.timestamp("created_at").defaultTo(db.fn.now());
    table.string("message", 1024).notNullable();
    table.jsonb("data");

    table.primary(["id"]);
  });

  db.destroy();
  console.log("Done!");
})();
