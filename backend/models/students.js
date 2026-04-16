import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
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
    rollNumber:{
        type: String,
        required: true,
        unique: true
    },
    sections:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sections'
    }],
    fingerprintData:{
        type: Buffer,
        default: null
    },
    faceData:{
        type: Buffer,
        default: null
    }
})

const Students = mongoose.model('Students', studentSchema);

export default Students