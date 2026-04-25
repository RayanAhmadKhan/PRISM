import Attendance from "../models/attendance.js";
import Sections from "../models/sections.js";

export const createAttendanceRecord = async (req, res) => {
  try {
    const { sectionId, markedBy } = req.body;

    const today = new Date().toISOString().split("T")[0];

    const existing = await Attendance.findOne({
      section: sectionId,
      date: today
    });

    if (existing) {
      return res.status(400).json({ message: "Attendance already created" });
    }

    const section = await Sections.findById(sectionId).populate("students");

    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    const students = section.students.map(s => ({
      student: s._id,
      status: "Absent",
      confidenceScore: 0,
      flagged: false,
      responded: false 
    }));

    const now = new Date();

    const attendanceRecord = new Attendance({
      section: sectionId,
      date: today,
      markedBy,
      students,
      startTime: now,
      endTime: new Date(now.getTime() + 30 * 60 * 1000),
      status: "open"
    });

    await attendanceRecord.save();

    res.status(201).json({
      message: "Attendance created",
      attendanceRecord
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};