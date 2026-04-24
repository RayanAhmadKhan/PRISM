import Section from "../models/sections.js";

export const getSectionController = async (req, res) => {
  try {
    const { courseId, id } = req.query;

    let filter = {};

    if (courseId) {
      filter.courseCode = courseId;
    }

    if (id) {
      filter.$or = [
        { students: id },
        { instructor: id }
      ];
    }

    const sections = await Section.find(filter)
      .populate("courseCode", "courseCode courseName")
      .populate("instructor", "name instructorID")
      .populate("students", "name rollNumber");

    return res.status(200).json({
      sections
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};