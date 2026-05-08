import Students from "../models/students.js";
import Instructor from "../models/instructors.js";
import mongoose from "mongoose";

// Direct collection reference — no Mongoose model needed for student_images
// since it is written by the Python/FastAPI biometric service.
const studentImagesCollection = () =>
  mongoose.connection.db.collection("student_images");

export const deleteUser = async (req, res) => {
  const { type, id } = req.query;

  try {
    if (type === "student") {
      const result = await Students.deleteOne({ rollNumber: id });

      if (result.deletedCount === 0) {
        return res.status(404).json({ message: "Student not found" });
      }

      // Clean up biometric embeddings (face + fingerprint) stored by the
      // Python service. roll_number in student_images maps to rollNumber here.
      await studentImagesCollection().deleteMany({ roll_number: id });

      return res.status(200).json({ message: "Student deleted successfully" });

    } else if (type === "instructor") {
      const result = await Instructor.deleteOne({ instructorID: id });

      if (result.deletedCount === 0) {
        return res.status(404).json({ message: "Instructor not found" });
      }

      return res
        .status(200)
        .json({ message: "Instructor deleted successfully" });

    } else if (type === "admin") {
      return res.status(400).json({ message: "Admin deletion not allowed" });

    } else {
      return res.status(400).json({ message: "Invalid type" });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};