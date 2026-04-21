import Attendance from "../models/attendance.js";

export const deleteAttendanceRecord = async (req, res) => {
  try {
    const { attendanceId } = req.query;
    if (!attendanceId) {
      return res.status(400).json({ message: "Missing attendanceId" });
    }
    const deletedRecord = await Attendance.deleteOne({ _id: attendanceId });
    res
      .status(200)
      .json({
        message: "Attendance record deleted successfully",
        deletedRecord
      });
  } catch (error) {
    console.error("Error deleting attendance record:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
