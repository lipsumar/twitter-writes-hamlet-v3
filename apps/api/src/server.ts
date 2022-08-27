import "env";
import "newrelic";
import logger from "logger";
import app from "./app";
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`> ready on http://localhost:${PORT}`);
});
