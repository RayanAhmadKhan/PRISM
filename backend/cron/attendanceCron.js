import cron from "node-cron";
import Attendance from "../models/Attendance.js";

export const startAttendanceCron = () => {

  cron.schedule("*/5 * * * *", async () => {
    try {
      console.log("[Attendance Cron] Started at:", new Date());

      const now = new Date();
      // Calculate 30 minutes ago
      const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);

      // Find records created more than 30 minutes ago and not yet finalized
      const records = await Attendance.find({
        startTime: { $lte: thirtyMinutesAgo },
        "status": "open"
      });

      console.log("[Attendance Cron] Found", records.length, "records to process");

      for (let record of records) {
        // Check if students array exists
        if (!record.students || !Array.isArray(record.students)) {
          console.log("[Attendance Cron] Record has no students array, closing");
          record.status = "closed";
          await record.save();
          continue;
        }

        record.students = record.students.map(student => {
          // Mark as absent if no confidence score (low/missing verification)
          if (student.confidenceScore == null || student.confidenceScore < 50) {
            student.status = "Absent";
          }

          return student;
        });

        // Close the attendance record
        record.status = "closed";
        await record.save();
        console.log("[Attendance Cron] Closed record:", record._id, "started at:", record.startTime);
      }

      console.log("[Attendance Cron] Completed successfully");
    } catch (error) {
      console.error("[Attendance Cron] Error:", error.message);
      console.error("[Attendance Cron] Stack:", error.stack);
    }
  });

};