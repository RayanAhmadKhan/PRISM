import TestModel from "../models/testModels.js";

export const testController = async (req,res) => {
    console.log("Received test data:", req.body);

    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: "Request body is required (JSON payload)." });
    }

    const { studentId, faceConfidence, fingerprintConfidence, testType } = req.body;

    if (!studentId || faceConfidence == null || fingerprintConfidence == null) {
        return res.status(400).json({ message: "studentId, faceConfidence, and fingerprintConfidence are required." });
    }
    if (!Students.findById(studentId)) {
        return res.status(404).json({ message: "Student not found." });
    }

    try {
        const flagged = (faceConfidence < 0.8 || fingerprintConfidence < 0.8);
        const newTest = new TestModel({
            student: studentId,
            faceConfidence,
            fingerprintConfidence,
            testType,
            flagged
        });
        const savedTest = await newTest.save();
        res.status(201).json(savedTest);
    } catch (error) {
        res.status(500).json({ message: "Error saving test data", error: error.message });
    }
}

export default testController;