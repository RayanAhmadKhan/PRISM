import express from "express";
import env from "dotenv";
import cors from "cors";
import connectdb from "./config/db.js";
import { startAttendanceCron } from "./cron/attendanceCron.js";

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
import getAttendanceRecordRoute from "./routes/getAttendanceRecordRoute.js";
import addStudentInSectionRoute from "./routes/AddStudentInSectionRoute.js";
import loginUserRoute from "./routes/loginUserRoute.js";
import getFlaggedCasesRoute from "./routes/getFlaggedCasesRoute.js";
import flagApprovalRoute from "./routes/flagApprovalRoute.js";
import markAttendanceRoute from "./routes/MarkAttendanceRoute.js";
import changeSectionRoute from "./routes/changeSectionRoute.js";
import changeCourseInfoRoute from "./routes/changeCourseInfoRoute.js";
import updateUserInfoRoute from "./routes/updateUserInfoRoute.js";
import removeStudentFromSection from "./routes/Removestuedentfromsection.js";
import updateSectionRoute from "./routes/updateSectionRoute.js";
import changePasswordRoute from "./routes/changePasswordRoute.js";
env.config();

const port = process.env.PORT || 3000;
const app = express();

startAttendanceCron();

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
app.use("/getAttendanceRecord", getAttendanceRecordRoute);
app.use("/addStudentInSection", addStudentInSectionRoute);
app.use("/loginUser", loginUserRoute);
app.use("/getFlaggedCases", getFlaggedCasesRoute);
app.use("/flagApproval", flagApprovalRoute);
app.use("/markAttendance", markAttendanceRoute);
app.use("/changeSection", changeSectionRoute);
app.use("/changeCourseInfo", changeCourseInfoRoute);
app.use("/updateSection", updateSectionRoute);
app.use("/updateUserInfo", updateUserInfoRoute);
app.use("/removeStudentFromSection", removeStudentFromSection);
app.use("/changePassword", changePasswordRoute);

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
