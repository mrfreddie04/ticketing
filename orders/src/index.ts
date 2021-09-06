import mongoose from "mongoose";
import { app } from "./app";
import { natsWrapper } from "./nats-wrapper"; //instance of NatsWrapper
import { TicketCreatedListener } from "./events/listeners/ticket-created-listener";
import { TicketUpdatedListener } from "./events/listeners/ticket-updated-listener";
import { ExpirationCompleteListener } from './events/listeners/expiration-complete-listener';
import { PaymentCreatedListener } from './events/listeners/payment-created-listener';

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
    //NATS configuration
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );

    //Graceful shutdown - when close event is received from NATS Serice (usually in response to client.close())
    natsWrapper.client.on("close", ()=>{
      console.log("Orders: NATS connection closed! Exiting...");
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
    console.log("Orders: Listeners started");

    //Mongoose configuration/connection
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    });
    console.log("Orders: Connected to mongodb");
  } catch(err) {
    console.log("err")
  }

  //Web server startup
  app.listen(3000, ()=>{
    console.log("Orders Service listening on port 3000!!!");
    console.log("Orders Mongo DB", process.env.MONGO_URI);
    console.log("Orders NATS Client", process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL);
  });  
};

start();