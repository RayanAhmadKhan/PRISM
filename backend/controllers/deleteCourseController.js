import Course from "../models/Course.js";

export const deleteCourse = async (req, res) => {
  try {
    const { courseCode } = req.query;

    if (!courseCode) {
      return res.status(400).json({
        message: "Course code is required"
      });
    }
    const deletedCourse = await Course.findOneAndDelete({
      courseCode: courseCode
    });

    if (!deletedCourse) {
      return res.status(404).json({
        message: "Course not found"
      });
    }

    res.status(200).json({
      message: "Course deleted successfully",
      data: deletedCourse
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};
