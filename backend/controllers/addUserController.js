import Students from "../models/students.js";
import Admin from "../models/admin.js";
import Instructor from "../models/instructors.js";

export const addUser = async (req, res)=>{
    const models = {
    student: Students,
    admin: Admin,
    instructor: Instructor
    };

    const {type, ...userData} = req.body;
    const model = models[type];

    if (!model) {
        return res.status(400).json({ message: "Invalid user type." });
    }
    if (type === 'student' && !userData.rollNumber) {
        return res.status(400).json({ message: "rollNumber required" });
    }

    if (type === 'instructor' && !userData.instructorID) {
        return res.status(400).json({ message: "instructorID required" });
    }
    try {
        const newUser = new model(userData);
        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (error) {
        res.status(500).json({ message: "Error saving user data", error: error.message });
    }

}