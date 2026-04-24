import Students from "../models/students.js";
import Admin from "../models/admin.js";
import Instructor from "../models/instructors.js";

export const allUsers = async (req, res) => {
    try {
        const [students, instructors, admins] = await Promise.all([
            Students.find({}, "name rollNumber email"),
            Instructor.find({}, "name instructorID email"),
            Admin.find({}, "name adminID email")
        ]);

        res.status(200).json({ students, instructors, admins });

    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
};