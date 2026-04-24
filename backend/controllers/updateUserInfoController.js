import Students from "../models/students.js";
import Admin from "../models/admin.js";
import Instructor from "../models/instructors.js";
import { verifyToken, checkRole } from "../middleware/authMiddleware.js";

export const updateUserInfo = async (req, res) => {
  try {
    const { type, userID, name, email, password } = req.body;

    let user;
    if (type === "student") {
      user = await Students.findOne({ rollNumber: userID });
    } else if (type === "admin") {
      user = await Admin.findOne({ adminID: userID });
    } else if (type === "instructor") {
      user = await Instructor.findOne({ instructorID: userID });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) {
      user.password = password; // Will be hashed by pre-save hook
    }

    await user.save();

    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    res.json({
      message: "User information updated successfully",
      user: userWithoutPassword
    });
  } catch (error) {
    console.error("Error updating user info:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
