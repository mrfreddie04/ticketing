import { Message } from "node-nats-streaming";
import { Listener } from "./base-listener";
import { Subjects } from "./subjects";
import { TicketCreatedEvent } from "./ticket-created-event";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  protected readonly subject = Subjects.TicketCreated;
  public queueGroupName: string = "payment-service";

  public onMessage(data: TicketCreatedEvent["data"], msg: Message): void {
    console.log(`Received event #${msg.getSequence()}, Event data: ${data.id},${data.title},${data.price}`);
    msg.ack();
  }
}