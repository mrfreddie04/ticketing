import { Message } from 'node-nats-streaming';
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledListener } from "../order-cancelled-listener";
import { OrderCancelledEventData, OrderStatus, Subjects } from "@monroe-computer-technology/common"

const setup = async () => {
  //create listener
  const listener = new OrderCancelledListener(natsWrapper.client);

  const orderId = global.getMongooseId();

  //create a ticket
  const ticket =  Ticket.build({
    userId: global.getMongooseId(),
    title: "Movie",
    price: 20   
  });
  ticket.set({orderId:orderId});
  await ticket.save();

  //fabricate test data
  const data: OrderCancelledEventData = {
    id: orderId,
    version: 1,
    ticket: {
      id: ticket.id
    }
  };

  //fabricate fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  //return fabricated components
  return {listener, data, ticket, msg };
};  

it("unreserves ticket, publishes event, acks message", async () => {
  //arrange
  const {listener, data, ticket, msg } = await setup();

  //act
  await listener.onMessage(data,msg);

  //assert
  //database updates
  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket).toBeDefined();
  expect(updatedTicket?.orderId).toBeUndefined();

  //TicketUpdated event published
  expect(natsWrapper.client.publish).toHaveBeenCalled();
  const args = (natsWrapper.client.publish as jest.Mock).mock.calls[0];
  const updatedTicketData = JSON.parse(args[1]);

  expect(args[0]).toEqual(Subjects.TicketUpdated);
  expect(updatedTicketData.id).toEqual(data.ticket.id);
  expect(updatedTicketData?.orderId).toBeUndefined();  

  //OrderCancelled event acked
  expect(msg.ack).toHaveBeenCalled();
});

