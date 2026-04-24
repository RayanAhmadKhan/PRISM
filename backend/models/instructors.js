import mongoose from "mongoose";
import bcrypt from "bcrypt";

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

// Hash password before saving
instructorSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
instructorSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

const Instructor =  mongoose.models.Instructor || mongoose.model('Instructors', instructorSchema);

export default Instructor;