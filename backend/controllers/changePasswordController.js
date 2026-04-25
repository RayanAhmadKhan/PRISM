import Students from "../models/students.js";
import Instructors from "../models/instructors.js";
import bcrypt from "bcryptjs";

export const changePassword = async (req, res) => {
    try {
        const { type, userID, password, newPassword } = req.body;

        if (!type || !userID || !password || !newPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }
        let user = null;
        if (type === "student") {
            user = await Students.findById(userID);
        } else if (type === "instructor") {
            user = await Instructors.findById(userID);
        }
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }

        // ✅ Assign plain text — pre-save hook hashes it (same as updateUserInfo)
        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

