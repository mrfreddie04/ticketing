import { Listener, Subjects, TicketCreatedEvent, TicketCreatedEventData } from "@monroe-computer-technology/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { queueGroupName } from "./queue-group-name";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  protected readonly subject = Subjects.TicketCreated;
  public queueGroupName: string = queueGroupName;

  async onMessage(data: TicketCreatedEventData, msg: Message): Promise<void> {
    console.log(`Event [${this.subject}] received`);//: ${msg.getSequence()}`)

    if(await Ticket.findById(data.id)) {
      throw new Error("Ticket already exists");
    }
    
    const { id, title, price } = data;

    const ticket = Ticket.build({
      id,
      title,
      price,
    });

    await ticket.save();

    console.log(`Event [${this.subject}] processed. Version rec/sav: ${data.version}/${ticket.version}`);
    msg.ack();
  }

}