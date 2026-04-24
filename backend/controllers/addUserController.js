import Students from "../models/students.js";
import Admin from "../models/admin.js";
import Instructor from "../models/instructors.js";
import axios from "axios";
import FormData from "form-data";

export const addUser = async (req, res) => {
  const models = {
    student: Students,
    admin: Admin,
    instructor: Instructor
  };

  try {
    const { type, ...userData } = req.body;

    const model = models[type];

    if (!model) {
      return res.status(400).json({ message: "Invalid user type" });
    }

    // 🔹 Validation
    if (type === "student" && !userData.rollNumber) {
      return res.status(400).json({ message: "rollNumber required" });
    }

    // optional fields safety
    userData.sections = [];

    // 🔹 Save User
    let savedUser;
    try {
      savedUser = await new model(userData).save();
    } catch (dbError) {
      return res.status(500).json({
        message: "Database save failed",
        error: dbError.message
      });
    }

    const userId = savedUser.rollNumber || savedUser._id;

    // 🔹 Files (SAFE)
    const faceFile = req.files?.face?.[0];
    const fingerprintFile = req.files?.fingerprint?.[0];
    console.log("Received files:", {
      face: faceFile ? faceFile.originalname : "No face file",
      fingerprint: fingerprintFile ? fingerprintFile.originalname : "No fingerprint file"
    });

    // 🔹 Upload Face
    if (type === "student" && faceFile) {
      try {
        const faceForm = new FormData();
        faceForm.append("user_id", userId);
        faceForm.append("file", faceFile.buffer, {
          filename: faceFile.originalname
        });

        await axios.post(
          "http://localhost:8000/api/enroll/face",
          faceForm,
          {
            headers: faceForm.getHeaders(),
            timeout: 15000
          }
        );
      } catch (err) {
        console.error("Face upload failed:", err.message);
      }
    }

    // 🔹 Upload Fingerprint
    if (type === "student" && fingerprintFile) {
      try {
        const fingerForm = new FormData();
        fingerForm.append("user_id", userId);
        fingerForm.append("file", fingerprintFile.buffer, {
          filename: fingerprintFile.originalname
        });

        await axios.post(
          "http://localhost:8000/api/enroll/fingerprint",
          fingerForm,
          {
            headers: fingerForm.getHeaders(),
            timeout: 15000
          }
        );
      } catch (err) {
        console.error("Fingerprint upload failed:", err.message);
      }
    }

    // 🔹 Final Response
    return res.status(201).json({
      message: "User created successfully",
      user: savedUser
    });

  } catch (error) {
    console.error("Controller Error:", error.message);

    return res.status(500).json({
      message: "Unexpected server error",
      error: error.message
    });
  }
};