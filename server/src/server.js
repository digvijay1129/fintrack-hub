import app from "./app.js";
import { env } from "./config/env.js";
import { connectToDatabase } from "./config/database.js";

const server = app.listen(env.PORT, () => {
  console.info(`FinTrack Hub API listening on port ${env.PORT} (${env.NODE_ENV})`);
});

connectToDatabase()
  .then(() => console.info("MongoDB connected."))
  .catch((error) => {
    console.error("MongoDB connection failed; the API is live but not ready.", error.message);
    if (env.NODE_ENV === "production") {
      shutdown(1);
    }
  });

let shuttingDown = false;

function shutdown(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  server.close(() => process.exit(exitCode));
  setTimeout(() => process.exit(exitCode), 10000).unref();
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  shutdown(1);
});
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
  shutdown(1);
});
