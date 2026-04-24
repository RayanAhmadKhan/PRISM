import Attendance from "../models/attendance.js";

export const getAttendanceRecord = async (req, res) => {
  try {
    const { sectionId, date, markedBy, studentId } = req.query;

    let query = {};

    if (sectionId) {
      query.section = sectionId;
    }

    if (date) {
      query.date = date;
    }

    if (markedBy) {
      query.markedBy = markedBy;
    }

    if (studentId) {
      query["students.student"] = studentId;
    }

    const attendanceRecords = await Attendance.find(query)
      .populate("students.student", "name rollNumber")
      .populate("markedBy", "name")
      .populate({
        path: "section",
        select: "sectionName courseCode",
        populate: {
          path: "courseCode",
          select: "courseCode courseName"
        }
      });

    // ✅ No data → return empty array (NOT 404)
    if (!attendanceRecords || attendanceRecords.length === 0) {
      return res.status(200).json([]);
    }

    // ✅ If studentId is provided → return only that student's records
    if (studentId) {
      const filteredData = attendanceRecords
        .map(record => {
          const studentData = record.students.find(
            s => s.student._id.toString() === studentId
          );

          return studentData
            ? {
                _id: record._id,
                section: record.section,
                date: record.date,
                markedBy: record.markedBy,
                student: studentData
              }
            : null;
        })
        .filter(Boolean); // remove nulls

      return res.status(200).json(filteredData);
    }

    // ✅ Default → return full records
    return res.status(200).json(attendanceRecords);
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};
