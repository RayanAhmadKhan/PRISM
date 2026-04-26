import Sections from "../models/sections.js";
import Students from "../models/students.js";

export const addStudentInSection = async (req, res) => {
  try {
    const { rollNumber, sectionName, courseId } = req.body;
    if (!rollNumber || !sectionName || !courseId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const student = await Students.findOne({ rollNumber });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const result = await Sections.updateOne(
      { sectionName, courseCode: courseId },
      { $addToSet: { students: student._id } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Section not found" });
    }
    if (result.modifiedCount === 0) {
      return res.status(400).json({ message: "Student already in section" });
    }

    res.status(200).json({ message: "Student added successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
