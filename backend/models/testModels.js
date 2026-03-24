import mongoose from "mongoose";

const testSchema = new mongoose.Schema({
    
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true
    },

    faceConfidence: {
        type: Number,
        required: true
    },

    fingerprintConfidence: {
        type: Number,
        required: true
    },

    faceVerified: {
        type: Boolean,
        default: false
    },

    fingerprintVerified: {
        type: Boolean,
        default: false
    },

    flagged: {
        type: Boolean,
        default: false
    },

    testType: {
        type: String,
        enum: ["FACE", "FINGERPRINT", "BOTH"],
        default: "BOTH"
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

});

export default mongoose.model("TestModel", testSchema);