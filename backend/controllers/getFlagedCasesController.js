import Attendance from "../models/attendance.js";

export const getFlaggedCases = async (req, res) => {
  try {
    const { markedBy, studentId } = req.query;

    // 🔹 Validate input
    if (!markedBy && !studentId) {
      return res.status(400).json({
        message: "Either markedBy or studentId is required"
      });
    }

    // 🔹 Build dynamic query
    const query = {
      "students.flagged": true
    };

    if (markedBy) query.markedBy = markedBy;
    if (studentId) query["students.student"] = studentId;

    // 🔹 Fetch data
    const records = await Attendance.find(query)
      .populate("section", "sectionName")
      .populate("students.student", "name rollNumber")
      .lean();

    // 🔹 Keep only flagged students
    const result = records
      .map(record => ({
        ...record,
        students: record.students.filter(s => s.flagged)
      }))
      .filter(record => record.students.length > 0);

    return res.status(200).json(result);

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};