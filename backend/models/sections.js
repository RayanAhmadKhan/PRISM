import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  semester: {
    type: string,
    required: true
  },
  year: {
    type: string,
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
});

const Sections = mongoose.model("Sections", studentSchema);

export default Sections;