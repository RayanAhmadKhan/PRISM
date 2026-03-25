import mongoose from 'mongoose';

const connectdb = async ()=>{
    try{
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Successfully connected to the DB");
    }
    catch(error){
        console.error("Database connection failed:", error);
    }
}

export default connectdb