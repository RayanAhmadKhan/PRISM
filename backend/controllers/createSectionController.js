import Sections from "../models/sections.js";

export const createSection = async (req, res) => {
  const { sectionName, semester, year, courseCode, instructor } = req.body;

  try {
    if (!sectionName || !semester || !year || !courseCode || !instructor) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingSection = await Sections.findOne({
      sectionName,
      courseCode,
      semester,
      year
    });

    if (existingSection) {
      return res.status(400).json({ message: "Section already exists" });
    }

    const newSection = new Sections({
      sectionName,
      semester,
      year,
      courseCode,
      instructor,
      students: []
    });

    const savedSection = await newSection.save();

    res.status(201).json({
      message: "Section created successfully",
      section: savedSection
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};