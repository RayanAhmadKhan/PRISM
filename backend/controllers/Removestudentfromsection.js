import Sections from "../models/Sections.js";
import Students from "../models/Students.js";

export const removeStudentFromSection = async (req, res) => {
  try {
    const { rollNumber, sectionName, courseId } = req.body;

    if (!rollNumber || !sectionName || !courseId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const student = await Students.findOne({ rollNumber });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const section = await Sections.findOne({
      sectionName,
      courseCode: courseId
    });
    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    const isEnrolled = section.students.some(
      (id) => id.toString() === student._id.toString()
    );
    if (!isEnrolled) {
      return res.status(400).json({ message: "Student is not enrolled in this section" });
    }

    const result = await Sections.updateOne(
      { sectionName, courseCode: courseId },
      { $pull: { students: student._id } }
    );

    if (result.modifiedCount === 0) {
      return res.status(500).json({ message: "Failed to remove student from section" });
    }

    return res.status(200).json({ message: "Student removed from section successfully" });
  } catch (error) {
    console.error("Error removing student from section:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};