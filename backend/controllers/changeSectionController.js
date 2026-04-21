import Sections from "../models/Sections.js";
import Students from "../models/Students.js";
export const changeSection = async (req, res) => {
  try {
    const { rollNumber, oldSectionName, newSectionName, courseId } = req.body;
    if (!rollNumber || !oldSectionName || !newSectionName || !courseId) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const student = await Students.findOne({ rollNumber });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    const oldSection = await Sections.findOne({
      sectionName: oldSectionName,
      courseCode: courseId
    });
    if (!oldSection) {
      return res.status(404).json({ message: "Old section not found" });
    }
    const newSection = await Sections.findOne({
      sectionName: newSectionName,
      courseCode: courseId
    });
    if (!newSection) {
      return res.status(404).json({ message: "New section not found" });
    }
    const findStudentInOldSection = await Sections.findOne({
      sectionName: oldSectionName,
      courseCode: courseId,
      students: student._id
    });
    if (!findStudentInOldSection) {
      return res.status(400).json({ message: "Student not in old section" });
    }
    const removeResult = await Sections.updateOne(
      { sectionName: oldSectionName, courseCode: courseId },
      { $pull: { students: student._id } }
    );
    if (removeResult.modifiedCount === 0) {
      return res
        .status(500)
        .json({ message: "Failed to remove student from old section" });
    }
    const addResult = await Sections.updateOne(
      { sectionName: newSectionName, courseCode: courseId },
      { $addToSet: { students: student._id } }
    );
    if (addResult.modifiedCount === 0) {
      await Sections.updateOne(
        { sectionName: oldSectionName, courseCode: courseId },
        { $addToSet: { students: student._id } }
      );
      return res
        .status(500)
        .json({
          message: "Failed to add student to new section, rolled back changes"
        });
    }
    return res.status(200).json({ message: "Section changed successfully" });
  } catch (error) {
    console.error("Error changing section:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
