import cron from "node-cron";
import Attendance from "../models/Attendance.js";

export const startAttendanceCron = () => {

  cron.schedule("*/5 * * * *", async () => {

    const now = new Date();

    const records = await Attendance.find({
      endTime: { $lte: now },
      finalized: false
    });

    for (let record of records) {

      record.students = record.students.map(student => {
        if (!student.responded) {
          student.status = "Absent";
        }

        if (student.confidenceScore < 0.5) {
          student.flagged = true;
        }

        return student;
      });

      record.finalized = true;
      await record.save();
    }

  });

};