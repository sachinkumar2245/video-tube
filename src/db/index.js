// always database connections with try catch 
// database connection takes time async await
// because database is in another continent
// servers can be lagging or can throw error

import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import dotenv from "dotenv";


const connectDB = async () =>{
    try {
       const connectionInstance =  await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`) //connection with database

       // here we console the incoming database stream
       console.log(`\n MongoDB connected ! DB host: ${connectionInstance.connection.host}`);
       
       
    } catch (error) {
        console.log("MongoDB Connection error ", error);
        process.exit(1)
        
    }
}

export default connectDB;