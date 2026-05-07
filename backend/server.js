import env from "dotenv";
import connectdb from "./config/db.js";
import { startAttendanceCron } from "./cron/attendanceCron.js";
import app from "./app.js";

env.config();

if (process.env.NODE_ENV !== "test") {
  console.log("Connecting to the database...");
  connectdb();
  startAttendanceCron();

  app.listen(port, () => {
    console.log("Server is running");
    console.log("http://localhost:" + port);
  });
}