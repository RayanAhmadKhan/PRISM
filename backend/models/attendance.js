import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sections",
      required: true
    },

    date: {
      type: String,
      required: true
    },

    students: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Students",
          required: true
        },

        status: {
          type: String,
          enum: ["Present", "Absent"],
          default: "Absent"
        },

        confidenceScore: {
          type: Number,
          min: 0,
          max: 100,
          default: 0
        },

        flagged: {
          type: Boolean,
          default: false
        },

        flagReason: {
          type: String,
          default: null
        },

        verificationResult: {
          type: mongoose.Schema.Types.Mixed,
          default: null
        },

        responded: {              
          type: Boolean,
          default: false
        }
      }
    ],

    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Instructors",
      required: true
    },

    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open"
    },

    startTime: {
      type: Date,
      default: Date.now
    },

    endTime: {
      type: Date,
      required: true
    }
  },
  { timestamps: true }
);

attendanceSchema.index({ section: 1, date: 1 }, { unique: true });
attendanceSchema.index({ "students.student": 1 });

const Attendance =
  mongoose.models.Attendance || mongoose.model("Attendance", attendanceSchema);

export default Attendance;