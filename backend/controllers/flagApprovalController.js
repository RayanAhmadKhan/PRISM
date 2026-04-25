import Attendance from "../models/Attendance.js";
export const flagApproval = async (req, res) => {
  try {
    const { attendanceId, studentId, action } = req.body;

    if (!attendanceId || !studentId || !action) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const attendanceRecord = await Attendance.findById(attendanceId);
    if (!attendanceRecord) {
      return res.status(404).json({ message: "Attendance record not found" });
    }
    const student = attendanceRecord.students.find(
      s => s.student.toString() === studentId
    );
    if (!student) {
      return res
        .status(404)
        .json({ message: "Student not found in attendance record" });
    }
    if(student.flagged === false && action === "accept") {
      return res.status(400).json({ message: "Student is not flagged" });
    }
    if (action === "accept") {
      student.flagged = false;
      student.status = "Present";
    } else if (action === "reject") {
      student.flagged = false;
      student.status = "Absent";
    } else {
      return res.status(400).json({ message: "Invalid action" });
    }
    await attendanceRecord.save();
    res.status(200).json({ message: "Flag approval updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
