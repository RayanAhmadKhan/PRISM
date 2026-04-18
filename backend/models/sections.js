import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema(
  {
    sectionName: {
      type: String,
      required: true
    },
    semester: {
      type: String,
      required: true
    },
    year: {
      type: Number,
      required: true
    },
    courseCode: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Courses",
      required: true
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Instructors",
      required: true
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Students"
      }
    ]
  },
  { timestamps: true }
);

sectionSchema.index({ sectionName: 1, courseCode: 1 }, { unique: true });
const Sections = mongoose.model("Sections", sectionSchema);

export default Sections;
