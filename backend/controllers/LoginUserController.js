import Students from "../models/students.js";
import Admin from "../models/admin.js";
import Instructor from "../models/instructors.js";

export const loginUser = async (req, res) => {
  const { type, email, password } = req.query;
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
    if (user.password !== password) {
      return res.status(401).json({ message: "Incorrect password." });
    }
    res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
