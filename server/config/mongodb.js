import mongoose from "mongoose";

const connectDB = async () => {

        mongoose.connection.on('connected', ()=>{
                console.log(process.env.MONGODB_URI);
           console.log("✅ Database Connected Successfully"); 
        })
        await mongoose.connect(`${process.env.MONGODB_URI}/AIimage`)

        
}

export default connectDB;