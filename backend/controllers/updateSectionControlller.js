import Sections from "../models/sections.js";

export const updateSectionController = async (req, res) => {
    try {
        const { sectionId, sectionName, semester, year, courseCode, instructor } = req.body;

        const section = await Sections.findById(sectionId);
        if (!section) {
            return res.status(404).json({ message: "Section not found" });
        }
        if (sectionName) section.sectionName = sectionName;
        if (semester) section.semester = semester;
        if (year) section.year = year;
        if (courseCode) section.courseCode = courseCode;
        if (instructor) section.instructor = instructor;

        const updatedSection = await section.save();
        return res.status(200).json(updatedSection);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};