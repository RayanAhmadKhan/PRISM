import Sections from "../models/sections.js";

export const createSection = async (req, res) => {
  const { sectionName, semester, year, courseCode, instructor, students } = req.body;
  try {
    if (!sectionName || !semester || !year || !courseCode || !instructor) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const newSection = new Sections({
      sectionName,
      semester,
      year,
      courseCode,
      instructor,
      students
    });
    const savedSection = await newSection.save();
    res.status(201).json({ message: "Section created successfully", section: savedSection });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
