import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
    courseCode:{
        type: String,
        required: true,
        unique: true
    },
    courseName: {
        type: String,
        required: true
    },
    creditHours: {
        type: Number,
        required: true
    }
})

const Course = mongoose.models.Courses || mongoose.model('Courses', courseSchema);

export default Course;