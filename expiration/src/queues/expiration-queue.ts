import Queue from "bull";
import { ExpirationCompleteEventData } from "@monroe-computer-technology/common";
import { natsWrapper } from "../nats-wrapper";
import { ExpirationCompletePublisher } from "../events/publishers/expiration-complete-publisher";

export interface Payload {
  orderId: string;
}

const expirationQueue = new Queue<Payload>("order:expiration", {
  redis: {
    host: process.env.REDIS_HOST
  }
});

expirationQueue.process( async (job: Queue.Job<Payload>) => {
  const expirationCompleteEventData: ExpirationCompleteEventData = {
    orderId: job.data.orderId
  };
  const publisher = new ExpirationCompletePublisher(natsWrapper.client);
  await publisher.publish(expirationCompleteEventData);
});

export { expirationQueue };