import mongoose from "mongoose";
import { app } from "./app";
import { natsWrapper } from "./nats-wrapper"; //instance of NatsWrapper
import { TicketCreatedListener } from "./events/listeners/ticket-created-listener";
import { TicketUpdatedListener } from "./events/listeners/ticket-updated-listener";
import { ExpirationCompleteListener } from './events/listeners/expiration-complete-listener';
import { PaymentCreatedListener } from './events/listeners/payment-created-listener';

const start = async () => {
  console.log("Starting Orders Service...");
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
    //NATS configuration
    console.log("Orders Service starting...");
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );

    console.log("Orders Service connected to NATS", process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL);    

    //Graceful shutdown - when close event is received from NATS Serice (usually in response to client.close())
    natsWrapper.client.on("close", ()=>{
      console.log("Orders Service closed connection to NATS...");
      process.exit();
    });    

    //send close event to NATS Service
    process.on("SIGINT", () => natsWrapper.client.close());
    process.on("SIGTERM", () => natsWrapper.client.close());

    //set up listeners
    const ticketCreatedListener = new TicketCreatedListener(natsWrapper.client);
    const ticketUpdatedListener = new TicketUpdatedListener(natsWrapper.client);
    const expirationCompleteListener = new ExpirationCompleteListener(natsWrapper.client);
    const paymentCreatedListener = new PaymentCreatedListener(natsWrapper.client);
    ticketCreatedListener.listen();
    ticketUpdatedListener.listen();
    expirationCompleteListener.listen();
    paymentCreatedListener.listen();
    console.log("Orders Service Listeners started");

    //Mongoose configuration/connection
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    });
    console.log("Orders Service Connected to mongodb", process.env.MONGO_URI);
  } catch(err) {
    console.log("Orders Service failed to connect to mongodb")
  }

  //Web server startup
  app.listen(3000, ()=>{
    console.log("Orders Service listening on port 3000!!!");
    console.log("Orders Service is running...");  
  });  
};

start();