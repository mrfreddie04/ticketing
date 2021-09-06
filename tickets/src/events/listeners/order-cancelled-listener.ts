import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';
import { Listener, OrderCancelledEvent, OrderCancelledEventData, Subjects } from "@monroe-computer-technology/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { queueGroupName } from "./queue-group-name";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  protected readonly subject = Subjects.OrderCancelled;
  public queueGroupName: string = queueGroupName;

  async onMessage(data: OrderCancelledEventData, msg: Message): Promise<void> {
    const ticketId = data.ticket.id;

    //if no ticket - throw error
    const ticket = await Ticket.findById(ticketId);

    if(!ticket)
      throw new Error("Ticket not found");
      
    ticket.set({orderId: undefined});
    
    await ticket.save();

    const publisher = new TicketUpdatedPublisher(this.client);
    await publisher.publish({
      id: ticket.id , 
      version: ticket.version, 
      title: ticket.title, 
      price: ticket.price, 
      userId: ticket.userId, 
      orderId: ticket.orderId      
    })

    msg.ack();
  }

}