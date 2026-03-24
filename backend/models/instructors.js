import mongoose from "mongoose";

const instructorSchema = new mongoose.Schema({
    instructorID:{
        type: String,
        required: true,
        unique: true
    },
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    Sections:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sections'
    }]
})

const Instructor = mongoose.model('Instructors', instructorSchema);

export default Instructor;