import Course from "../models/course.js";
export const changeCourseInfo = async (req, res) => {
    try {
        const { courseCode, courseName, creditHours } = req.body;
        const course = await Course.findOne({ courseCode });
        console.log("Course found:", course);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }
        course.courseName = courseName || course.courseName;
        course.creditHours = creditHours || course.creditHours;
        await course.save();
        res.status(200).json({ message: "Course information updated successfully", course });
    } catch (error) {
        res.status(500).json({ message: "Error updating course information", error: error.message });
    }
}