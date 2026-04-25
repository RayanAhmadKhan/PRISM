import Students from "../models/students.js";
import Admin from "../models/admin.js";
import Instructor from "../models/instructors.js";
import { generateToken } from "../middleware/authMiddleware.js";

// Function to determine user type based on ID format using regex
const identifyUserTypeByID = (id) => {
  // Admin ID pattern (typically starts with 'A' or 'ADMIN')
  const adminIDPattern = /^a\d+$|^admin/i;
  
  // Student roll number pattern (typically alphanumeric, e.g., "CS-2021-001" or "21-0001")
  const studentIDPattern = /^\d{2}[A-Z]-\d{4}$/;  
  // Instructor ID pattern (typically starts with 'I' or 'INSTR')
  const instructorIDPattern = /^i\d+$|^instr/i;

  if (adminIDPattern.test(id)) {
    return { type: "admin", field: "adminID" };
  } else if (studentIDPattern.test(id)) {
    return { type: "student", field: "rollNumber" };
  } else if (instructorIDPattern.test(id)) {
    return { type: "instructor", field: "instructorID" };
  }
  
  return null;
};

export const loginUser = async (req, res) => {
  const { id, password } = req.body;

  // Validate input
  if (!id || !password) {
    return res.status(400).json({ message: "ID and password are required." });
  }

  const models = {
    student: Students,
    admin: Admin,
    instructor: Instructor
  };

  try {
    // Identify user type based on ID format
    const userIdentity = identifyUserTypeByID(id);
    
    if (!userIdentity) {
      return res.status(400).json({ 
        message: "Invalid ID format. Could not determine user type." 
      });
    }
    console.log("Identified User Type:", userIdentity);
    const { type, field } = userIdentity;
    const model = models[type];
    const user = await model.findOne({ [field]: id });
    
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Verify that the provided ID matches the user's ID field
    if (user[field] !== id) {
      return res.status(401).json({ message: "Invalid credentials. ID does not match." });
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
