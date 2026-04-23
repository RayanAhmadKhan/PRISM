import Students from "../models/students.js";
import Admin from "../models/admin.js";
import Instructor from "../models/instructors.js";
import { generateToken } from "../middleware/authMiddleware.js";

export const loginUser = async (req, res) => {
  const { type, email, password } = req.body;

  const models = {
    student: Students,
    admin: Admin,
    instructor: Instructor
  };
  const model = models[type];

  if (!model) {
    return res.status(400).json({ message: "Invalid user type." });
  }

  try {
    const user = await model.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Compare hashed password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Incorrect password." });
    }

    // Generate JWT token
    const token = generateToken(user, type);

    // Send back user data without password
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    res.status(200).json({
      message: "Login successful",
      token: token,
      user: userWithoutPassword,
      type: type
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
