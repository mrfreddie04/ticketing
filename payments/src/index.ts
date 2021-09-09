import mongoose from "mongoose";
import { app } from "./app";
import { natsWrapper } from "./nats-wrapper"; //instance of NatsWrapper
import { OrderCancelledListener } from "./events/listeners/order-cancelled-listener";
import { OrderCreatedListener } from "./events/listeners/order-created-listener";

const start = async () => {
  if(!process.env.JWT_KEY) {
    throw new Error("JWT_KEY must be defined");
  }
  if(!process.env.MONGO_URI) {
    throw new Error("MONGO_URI must be defined");
  }  
  if(!process.env.NATS_URL) {
    throw new Error("NATS_URL must be provided");
  }  
  if(!process.env.NATS_CLUSTER_ID) {
    throw new Error("NATS_CLUSTER_ID must be provided");
  }  
  if(!process.env.NATS_CLIENT_ID) {
    throw new Error("NATS_CLIENT_ID must be provided");
  }  

  try {
    console.log("Payments Service starting...");
    
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );

    console.log("Payments Service connected to NATS", process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL);    

    natsWrapper.client.on("close", ()=>{
      console.log("Payments Service closed connection to NATS! Exiting...");
      process.exit();
    });    

    process.on("SIGINT", () => natsWrapper.client.close());
    process.on("SIGTERM", () => natsWrapper.client.close());

    const orderCreatedListener = new OrderCreatedListener(natsWrapper.client);
    const orderCancelledListener = new OrderCancelledListener(natsWrapper.client);
    orderCreatedListener.listen();
    orderCancelledListener.listen();

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Payments Service connected to Mongo DB ", process.env.MONGO_URI);
  } catch(err) {
    console.log("Payments Service failed to start properly");
  }

  app.listen(3000, ()=>{
    console.log("Payments Service listening on port 3000!!!");
    console.log("Payments Service is running...");
  });  
};

start();