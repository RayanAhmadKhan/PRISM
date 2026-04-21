import Students from "../models/students.js";
import Admin from "../models/admin.js";
import Instructor from "../models/instructors.js";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";

console.log("Entering addUserController.js");

export const addUser = async (req, res) => {
    console.log("addUser controller called");

    const models = {
        student: Students,
        admin: Admin,
        instructor: Instructor
    };

    try {
        const { type, ...userData } = req.body;

        console.log("TYPE:", type);
        console.log("USER DATA:", userData);
        console.log("FILES:", req.files);

        const model = models[type];

        if (!model) {
            return res.status(400).json({ message: "Invalid user type" });
        }

        if (type === "student" && !userData.rollNumber) {
            return res.status(400).json({ message: "rollNumber required" });
        }

        userData.sections = [];

        let savedUser;

        try {
            console.log("Saving user...");
            savedUser = await new model(userData).save();
            console.log("User saved:", savedUser._id);
        } catch (dbError) {
            console.error("DB ERROR:", dbError.message);
            return res.status(500).json({
                message: "Database save failed",
                error: dbError.message
            });
        }

        const userId = savedUser.rollNumber || savedUser._id;

        const faceFile = req.files.find(f => f.fieldname === 'face');
        if (type === "student" && faceFile) {
            try {
                console.log("Uploading face...");

                const faceForm = new FormData();
                faceForm.append("user_id", userId);
                faceForm.append(
                    "file",
                    faceFile.buffer,
                    { filename: faceFile.originalname }
                );

                await axios.post(
                    "http://localhost:8000/api/enroll/face",
                    faceForm,
                    {
                        headers: faceForm.getHeaders(),
                        timeout: 15000
                    }
                );

                console.log("Face uploaded successfully");
            } catch (err) {
                console.error("Face upload failed:", err.message);
            }
        }

        const fingerprintFile = req.files?.find(f => f.fieldname === 'fingerprint');
        if (type === "student" && fingerprintFile) {
            try {
                console.log("Uploading fingerprint...");

                const fingerForm = new FormData();
                fingerForm.append("user_id", userId);
                fingerForm.append(
                    "file",
                    fingerprintFile.buffer,
                    { filename: fingerprintFile.originalname }
                );

                await axios.post(
                    "http://localhost:8000/api/enroll/fingerprint",
                    fingerForm,
                    {
                        headers: fingerForm.getHeaders(),
                        timeout: 15000
                    }
                );

                console.log("Fingerprint uploaded successfully");
            } catch (err) {
                console.error("Fingerprint upload failed:", err.message);
            }
        }

        console.log("Sending response...");

        return res.status(201).json({
            message: "User created successfully",
            user: savedUser
        });

    } catch (error) {
        console.error("CONTROLLER CRASH:", error);

        return res.status(500).json({
            message: "Unexpected server error",
            error: error.message
        });
    }
};