import mongoose from "mongoose";

const connectDB = async()=>{
    
    try {
        await mongoose.connect(process.env.MONGODB_URI);
    console.log("MONGODB is connected.....");
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

export default connectDB;