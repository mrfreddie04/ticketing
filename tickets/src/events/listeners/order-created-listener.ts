import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';
import { Listener, OrderCreatedEvent, OrderCreatedEventData, Subjects } from "@monroe-computer-technology/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { queueGroupName } from "./queue-group-name";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  protected readonly subject = Subjects.OrderCreated;
  public queueGroupName: string = queueGroupName;

  async onMessage(data: OrderCreatedEventData, msg: Message): Promise<void> {
    //find the ticket
    const ticketId = data.ticket.id;  
    const orderId = data.id;

    //if no ticket - throw error
    const ticket = await Ticket.findById(ticketId);

    if(!ticket)
      throw new Error("Ticket not found");

    //mark ticket as reserved by setting its orderId
    ticket.set({ orderId: orderId});

    //save the ticket
    await ticket.save();

    //emit ticket:updated event here
    const publisher = new TicketUpdatedPublisher(this.client);
    await publisher.publish({
      id: ticket.id , 
      version: ticket.version, 
      title: ticket.title, 
      price: ticket.price, 
      userId: ticket.userId, 
      orderId: ticket.orderId
    });

    //ack the message
    msg.ack();    
  }

}