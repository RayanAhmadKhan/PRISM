import Students from "../models/students.js";
import Admin from "../models/admin.js";
import Instructor from "../models/instructors.js";

export const allUsers= async (req,res)=>{
    try{
        const students = await Students.find({});
        const instructors = await Instructor.find({});
        const admins = await Admin.find({});
        res.status(200).json({students, instructors, admins});
    }
    catch(error){
        res.status(500).json({message: "Internal Server Error", error: error.message })
    }
}