import dotenv from "dotenv-defaults";
import path from "path";
dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
  defaults: path.resolve(__dirname, "../../.env.defaults"),
});
