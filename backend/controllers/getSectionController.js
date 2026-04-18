import Section from "../models/sections.js";

export const getSectionController = async (req, res) => {
  try {
    const { type, courseId, id } = req.query;

    if (!type || !courseId) {
      return res.status(400).json({
        message: "type and courseId are required"
      });
    }

    if (type === "all") {
      const sections = await Section.find({ courseCode: courseId });
      return res.status(200).json(sections);
    } else if (type === "student") {
      const sections = await Section.find({
        courseCode: courseId,
        students: id
      });
      return res.status(200).json(sections);
    } else if (type === "instructor") {
      const sections = await Section.find({
        courseCode: courseId,
        instructor: id
      });
      return res.status(200).json(sections);
    } else {
      return res.status(400).json({
        message: "Invalid type"
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};
