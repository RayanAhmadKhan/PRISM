import Attendance from "../models/Attendance.js";

export const getFlaggedCases = async (req, res) => {
  try {
    const { markedBy } = req.query;

    if (!markedBy) {
      return res.status(400).json({ message: "markedBy is required" });
    }

    const flaggedCases = await Attendance.find({ markedBy })
      .populate("section", "sectionName")
      .populate("students.student", "name rollNumber")
      .lean();

    const filtered = flaggedCases
      .map(record => ({
        ...record,
        students: record.students.filter(s => s.flagged)
      }))
      .filter(r => r.students.length > 0);

    return res.status(200).json(filtered);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};