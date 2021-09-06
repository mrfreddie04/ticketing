import { Message } from 'node-nats-streaming';
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCreatedListener } from "../order-created-listener";
import { OrderCreatedEventData, OrderStatus, Subjects } from "@monroe-computer-technology/common"

const setup = async () => {
  //create listener
  const listener = new OrderCreatedListener(natsWrapper.client);

  const orderId = global.getMongooseId();

  //create a ticket
  const ticket =  Ticket.build({
    userId: global.getMongooseId(),
    title: "Movie",
    price: 20   
  });
  await ticket.save();

  //fabricate test data
  const data: OrderCreatedEventData = {
    id: orderId,
    version: 0,
    status: OrderStatus.Created,
    expiresAt: "123",
    userId: global.getMongooseId(),
    ticket: {
      id: ticket.id,
      price: ticket.price
    }
  };

  //fabricate fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  //return fabricated components
  return {listener, data, ticket, msg, orderId};
};

it("reserves ticket - sets the userId of the ticket", async () => {
  //arrange
  const {listener, data, ticket, msg, orderId} = await setup();

  //act
  await listener.onMessage(data,msg);

  //assert
  const updatedTicket = await Ticket.findById(ticket.id);
  //const updatedTicket = await Ticket.findOne({_id: ticket.id, orderId: orderId});

  expect(updatedTicket).toBeDefined();
  expect(updatedTicket!.orderId).toEqual(data.id);
});

it("acks the message", async () => {
  //arrange
  const {listener, data, ticket, msg} = await setup();

  //act
  await listener.onMessage(data,msg);

  expect(msg.ack).toHaveBeenCalled();
});

it("publishes ticket:updated event", async ()=>{
  //arrange
  const {listener, data, ticket, msg} = await setup();

  //act
  await listener.onMessage(data,msg);

  //assert
  expect(natsWrapper.client.publish).toHaveBeenCalled();

  // check arguments
  // const calls = (natsWrapper.client.publish as jest.Mock).mock.calls
  // console.log(natsWrapper.client.publish.mock.calls)
  const args = (natsWrapper.client.publish as jest.Mock).mock.calls[0];
  const updatedTicketData = JSON.parse(args[1]);
  console.log(updatedTicketData);
  expect(args[0]).toEqual(Subjects.TicketUpdated);
  expect(updatedTicketData.id).toEqual(data.ticket.id);
  expect(updatedTicketData.orderId).toEqual(data.id);
});