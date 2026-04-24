import Course from "../models/course.js";
export const getCourse = async (req, res) => {
  try {
    const { courseCode } = req.query;
    if (!courseCode) {
      const courses = await Course.find({});
      return res.status(200).json({courses});
    } else {
      const course = await Course.findOne({ courseCode: courseCode });
      if (!course) {
        return res.status(404).json({
          message: "Course not found"
        });
      }
      return res.status(200).json({course});
    }
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};
