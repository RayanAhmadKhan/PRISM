import Sections from "../models/sections.js";

export const deleteSection = async (req,res)=>{
    const {sectionName, courseCode} = req.body;
    try{
        if(!sectionName || !courseCode){
            return res.status(400).json({message: "All fields are required"});
        }
        const deletedSection = await Sections.findOneAndDelete({sectionName, courseCode});
        if (!deletedSection) {
            return res.status(404).json({message: "Section not found"});
        }
        res.status(200).json({message: "Section deleted successfully", section: deletedSection});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Server error"});
    }
    
}