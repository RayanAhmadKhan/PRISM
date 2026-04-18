import express from "express";
import env from "dotenv";
import cors from "cors";
import connectdb from "./config/db.js";
import testRoutes from "./routes/testRoutes.js";
import addUserRoutes from "./routes/addUserRoutes.js";
import deleteUserRoutes from "./routes/deleteUserRouter.js";
import getAllUsersRoute from "./routes/getAllUsersRoute.js";
import createSectionRoute from "./routes/createSectionRoute.js";
import deleteSectionRoute from "./routes/deleteSectionRoute.js";
import getSelectionRoute from "./routes/getSelectionRoute.js";
import createCourseRoute from "./routes/createCourseRoute.js";
import deleteCourseRoute from "./routes/deleteCourseRoute.js";
import getCourseRoute from "./routes/getCourseRoute.js";
import createAttendanceRoute from "./routes/createAttendanceroute.js";
import deleteAttendanceRecordRoute from "./routes/deleteAttendanceRecordRoute.js";

env.config();

const port = process.env.PORT || 3000;
const app = express();

app.use(cors());

app.use(express.json());
app.use("/test", testRoutes);
app.use("/addUser", addUserRoutes);
app.use("/deleteUser", deleteUserRoutes);
app.use("/getAllUsers", getAllUsersRoute);
app.use("/section", createSectionRoute);
app.use("/deleteSection", deleteSectionRoute);
app.use("/getSection", getSelectionRoute);
app.use("/createCourse", createCourseRoute);
app.use("/deleteCourse", deleteCourseRoute);
app.use("/getCourse", getCourseRoute);
app.use("/createAttendance", createAttendanceRoute);
app.use("/deleteAttendanceRecord", deleteAttendanceRecordRoute);

app.get("/", (req, res) => {
  res.json({ message: "Hello World from Backend!" });
});

console.log("Connecting to the database...");
connectdb();
console.log("MONGO_URI =", process.env.URI);

app.listen(port, () => {
  console.log("Server is running");
  console.log("http://localhost:" + port);
});
