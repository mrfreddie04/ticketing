import { natsWrapper } from "./nats-wrapper"; //instance of NatsWrapper
import { OrderCreatedListener} from "./events/listeners/order-created-listener";

const start = async () => {
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
    console.log("Starting Expiration Service...");
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );

    console.log("Expiration Service connected to NATS", process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL);       

    natsWrapper.client.on("close", ()=>{
      console.log("Expiration Service closed connection to NATS! Exiting...");
      process.exit();
    });    

    process.on("SIGINT", () => natsWrapper.client.close());
    process.on("SIGTERM", () => natsWrapper.client.close());

    const orderCreatedListener = new OrderCreatedListener(natsWrapper.client);
    orderCreatedListener.listen();

    console.log("Expiration Service is running...");
  } catch(err) {
    console.log("Expiration Service failed to start properly");
  } 
};

start();