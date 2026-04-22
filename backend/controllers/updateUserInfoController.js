import Students from "../models/students.js";
import Admin from "../models/admin.js";
import Instructor from "../models/instructors.js";

export const updateUserInfo = async (req, res) => {
  try {
    const { type, userID, name, email, password } = req.body;

    let user;
    if (type === "student") {
        user = await Students.findOne({ rollNumber: userID });
    
    } else if (type === "admin") {
      user = await Admin.findById({adminID: userID});
    } else if (type === "instructor") {
      user = await Instructor.findById({instructorID: userID});
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = user.name || name;
    user.email = user.email || email;
    if (password) {
      user.password = password;
    }

    await user.save();
    res.json({ message: "User information updated successfully" });
  } catch (error) {
    console.error("Error updating user info:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};