import { Listener, Subjects, TicketUpdatedEvent, TicketUpdatedEventData } from "@monroe-computer-technology/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { queueGroupName } from "./queue-group-name";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  protected readonly subject = Subjects.TicketUpdated;
  public queueGroupName: string = queueGroupName;

  async onMessage(data: TicketUpdatedEventData, msg: Message): Promise<void> {
    console.log(`Event [${this.subject}] received.`)

    const ticket = await Ticket.findByEvent(data);

    if(!ticket) {
      //msg.ack();
      throw new Error("Ticket doesn't exists. Possibly event out of order");
      //console.log("Ticket doesn't exists. Possibly event out of order");
      //return;
    }

    const {title, price } = data;
    ticket.set({ title, price });

    await ticket.save();

    console.log(`Event [${this.subject}] processed. Version rec/sav: ${data.version}/${ticket.version}`);
    msg.ack();
  }

}