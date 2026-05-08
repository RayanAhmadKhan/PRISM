import Students from "../models/students.js";
import Admin from "../models/admin.js";
import Instructor from "../models/instructors.js";
import axios from "axios";
import FormData from "form-data";
import env from "dotenv";

env.config();

export const addUser = async (req, res) => {
  const models = {
    student: Students,
    admin: Admin,
    instructor: Instructor
  };

  let savedUser = null;

  try {
    const { type, ...userData } = req.body;
    const model = models[type];

    if (!model) {
      return res.status(400).json({ success: false, message: "Invalid user type" });
    }

    if (type === "student" && !userData.rollNumber) {
      return res.status(400).json({ success: false, message: "rollNumber required" });
    }

    userData.sections = [];

    // 🔹 Files
    const faceFile = req.files?.face?.[0];
    const fingerprintFile = req.files?.fingerprint?.[0];

    // ❗ Strict validation BEFORE saving user
    if (type === "student" && (!faceFile || !fingerprintFile)) {
      return res.status(400).json({
        success: false,
        message: "Face and Fingerprint both are required"
      });
    }

    // 🔹 Save User (TEMP)
    savedUser = await new model(userData).save();
    const userId = savedUser.rollNumber || savedUser._id;

    // 🔹 Upload Face
    if (type === "student") {
      const faceForm = new FormData();
      faceForm.append("user_id", userId);
      faceForm.append("file", faceFile.buffer, {
        filename: faceFile.originalname
      });

      await axios.post(
        process.env.MODEL_API_URL + "/api/enroll/face",
        faceForm,
        {
          headers: faceForm.getHeaders(),
          timeout: 60000
        }
      );
    }

    // 🔹 Upload Fingerprint
    if (type === "student") {
      const fingerForm = new FormData();
      fingerForm.append("user_id", userId);
      fingerForm.append("file", fingerprintFile.buffer, {
        filename: fingerprintFile.originalname
      });

      await axios.post(
        process.env.MODEL_API_URL + "/api/enroll/fingerprint",
        fingerForm,
        {
          headers: fingerForm.getHeaders(),
          timeout: 60000
        }
      );
    }

    // ✅ SUCCESS
    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user: savedUser
    });

  } catch (error) {
    console.error("Controller Error:", error.response?.data || error.message);

    // 🔴 ROLLBACK
    if (savedUser) {
      try {
        await savedUser.deleteOne();
        console.log("Rollback: User deleted",);
      } catch (rollbackErr) {
        console.error("Rollback failed:", rollbackErr.message);
      }
    }

    return res.status(500).json({
      success: false,
      message: "User creation failed. Rolled back.",
      error: error.message
    });
  }
};
