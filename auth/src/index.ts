import mongoose from "mongoose";
import { app } from "./app";

const start = async () => {
  console.log("Starting Auth Service.....");
  if(!process.env.JWT_KEY) {
    throw new Error("JWT_KEY must be defined");
  }
  if(!process.env.MONGO_URI) {
    throw new Error("MONGO_URI must be defined");
  }    

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    });
    console.log("Auth Service connected to mongodb", process.env.MONGO_URI);
  } catch(err) {
    console.log("Auth Service failed to connect to mongodb")
  }

  app.listen(3000, ()=>{
    console.log("Auth Service listening on port 3000!!!");
    console.log("Auth Service is running...");    
  });  
};

start();