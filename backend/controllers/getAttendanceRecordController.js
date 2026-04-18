import Attendance from "../models/attendance.js";

export const getAttendanceRecord = async (req, res) => {
  try {
    const { sectionId, date, markedBy, studentId } = req.query;

    if (!sectionId) {
      return res
        .status(400)
        .json({ message: "sectionId is required" });
    }

    let query = { section: sectionId, date: date || new Date().toISOString().split("T")[0] };

    if (markedBy) {
      query.markedBy = markedBy;
    }

    if (studentId) {
      query["students.student"] = studentId;
    }

    const attendanceRecord = await Attendance.findOne(query)
      .populate("students.student", "name rollNumber")
      .populate("markedBy", "name");

    if (!attendanceRecord) {
      return res.status(404).json({ message: "Attendance not found" });
    }

    if (studentId) {
      const studentData = attendanceRecord.students.find(
        s => s.student._id.toString() === studentId
      );

      return res.status(200).json(studentData);
    }

    return res.status(200).json(attendanceRecord);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
