import { Listener, OrderCreatedEvent, OrderCreatedEventData, Subjects } from "@monroe-computer-technology/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { expirationQueue, Payload } from "../../queues/expiration-queue";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  protected readonly subject = Subjects.OrderCreated;
  public queueGroupName: string = queueGroupName;

  async onMessage(data: OrderCreatedEventData, msg: Message): Promise<void> {
    const payload: Payload = {
      orderId: data.id
    };

    const expiresAt = data.expiresAt;
    const delay = (new Date(expiresAt).getTime()) - (new Date().getTime());
    //console.log("Waiting this many ms to process the job: ",delay)

    const job = await expirationQueue.add(payload, {
      delay: delay
    });

    msg.ack();
  }
  
}