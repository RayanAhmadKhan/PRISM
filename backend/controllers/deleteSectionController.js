import Sections from "../models/sections.js";

export const deleteSection = async (req,res)=>{
    const {sectionId}= req.query;
    try{
        if(!sectionId){
            return res.status(400).json({message: "Section ID is required"});
        }
        const deletedSection = await Sections.findByIdAndDelete(sectionId);
        if (!deletedSection) {
            return res.status(404).json({message: "Section not found"});
        }
        res.status(200).json({message: "Section deleted successfully", section: deletedSection});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Server error"});
    }
    
}