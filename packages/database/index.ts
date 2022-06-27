import Knex from "knex";

if (!process.env.PG_CONNECTION_STRING) {
  throw new Error("PG_CONNECTION_STRING must be set");
}

export const db = Knex({
  client: "pg",
  connection: process.env.PG_CONNECTION_STRING,
});
