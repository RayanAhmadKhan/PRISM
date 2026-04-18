import Course from "../models/course.js";

export const createCourse = async (req, res) => {
  try {
    const { courseCode, courseName, creditHours } = req.body;

    if (!courseCode || !courseName || !creditHours) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    const newCourse = new Course({
      courseCode,
      courseName,
      creditHours
    });

    await newCourse.save();

    res.status(201).json({
      message: "Course created successfully",
      data: newCourse
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Course already exists"
      });
    }

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};
