import app from "./app.js";

import dotenv from "dotenv";
dotenv.config();

import connect from "./api/db/db.js";
connect();

process.on("uncaughtException", (err) => {
  console.log(err.message, err.name);
  console.log("Uncaugth Exception occured shutting down...");
  process.exit(1);
});

console.log(app.get("env"));

const port = 8000;
const server = app.listen(port, () => console.log(`Server running on ${port}`));

process.on("unhandledRejection", (err) => {
  console.log(err.message, err.name);
  console.log("Unhandled Rejection occured shutting down...");
  server.close(() => process.exit(1));
});
