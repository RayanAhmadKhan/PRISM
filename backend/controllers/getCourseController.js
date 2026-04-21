import Course from "../models/course.js";
export const getCourse = async (req, res) => {
  try {
    const { courseCode } = req.query;
    if (!courseCode) {
      return res.status(400).json({
        message: "Course code is required"
      });
    }
    if (courseCode === "all") {
      const courses = await Course.find({});
      return res.status(200).json({
        message: "Courses retrieved successfully",
        data: courses
      });
    } else {
      const course = await Course.findOne({ courseCode: courseCode });
      if (!course) {
        return res.status(404).json({
          message: "Course not found"
        });
      }
      res.status(200).json({
        message: "Course retrieved successfully",
        data: course
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};
