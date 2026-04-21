import Attendance from "../models/Attendance.js";

export const getFlaggedCases = async (req, res) => {
  try {
    const { markedBy } = req.query;
    if (!markedBy) {
      return res.status(400).json({ message: "markedBy query parameter is required." });
    }

    const flaggedCases = await Attendance.find({ markedBy }).lean();
    if (!flaggedCases.length) {
      return res.status(404).json({
        message: "No flagged cases found for the specified marker."
      });
    }

    const result = flaggedCases.map(record => ({
      ...record,
      students: record.students.filter(s => s.flagged)
    }));

    const filteredResult = result.filter(r => r.students.length > 0);

    if (!filteredResult.length) {
      return res.status(404).json({
        message: "No flagged cases found."
      });
    }

    res.status(200).json(filteredResult);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};