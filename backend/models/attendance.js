import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Section",
    required: true
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
 },
  students: [
    {
      student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
      status: {
        type: String,
        enum: ["Present", "Absent"],
        default: "Absent"
      },
      confidenceScore: {
        type: Number,
        min: 0,
        max: 1,
        required: true
      },
      flagged: { 
        type: Boolean,
        default: false
    }
    }
  ],
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Instructor",
    required: true
 }
});

const Attendance = mongoose.model("Attendance", attendanceSchema);

export default Attendance;
