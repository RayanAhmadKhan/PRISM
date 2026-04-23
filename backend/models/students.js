import mongoose from "mongoose";
import bcrypt from "bcrypt";

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
    }]
})

// Hash password before saving
studentSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
studentSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

const Students =  mongoose.models.Students || mongoose.model('Students', studentSchema);

export default Students