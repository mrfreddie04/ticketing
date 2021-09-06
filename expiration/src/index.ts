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
    
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );

    natsWrapper.client.on("close", ()=>{
      console.log("NATS connection closed! Exiting...");
      process.exit();
    });    

    process.on("SIGINT", () => natsWrapper.client.close());
    process.on("SIGTERM", () => natsWrapper.client.close());

    const orderCreatedListener = new OrderCreatedListener(natsWrapper.client);
    orderCreatedListener.listen();

    console.log("Connected to redis");
  } catch(err) {
    console.log("err")
  } 
};

start();