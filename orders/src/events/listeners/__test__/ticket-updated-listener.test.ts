import { Message } from 'node-nats-streaming';
import { TicketUpdatedEventData } from "@monroe-computer-technology/common";
import { TicketUpdatedListener } from '../ticket-updated-listener';
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";

const setup = async () => {
  //Create a listener
  const listener = new TicketUpdatedListener(natsWrapper.client);

  //Generate ticket id
  const id = global.getMongooseId();

  //Build new ticket object & save to db
  const ticket = Ticket.build({
    id: id,
    title: "Movie",
    price: 100,
  });    
  await ticket.save();

  //Create fake ticker:updated event data
  const data: TicketUpdatedEventData = {
    id: id,
    version: ticket.version + 1,
    title: "New Movie",
    price: 110,
    userId: global.getMongooseId()
  };

  //Create a fake message object - provide mocj for ack() method
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  //return ingredients
  return {listener, ticket, data, msg};
};

it('successfully updates ticket if version is in sequence', async () => {
  //Arrange prepare listener, data, msg and prepopulate db with a ticket
  const { listener, ticket, data, msg } = await setup();

  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);

  // write assertions to make sure a ticket was created!
  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket).toBeDefined();
  expect(updatedTicket!.version).toEqual(data.version);
  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
});

it("acks the message if update is successful", async () => {
  const { listener, data, msg } = await setup();

  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);

  // write assertions to make sure a ticket was created!
  expect(msg.ack).toHaveBeenCalled();
});

it('update fails if version is out of sequence', async () => {
  const { listener, data, msg } = await setup();

  //set the version out of order
  data.version = 5;

  try {
    await listener.onMessage(data, msg);
  } catch(err) {
    expect(1).toEqual(1);
    return ;
  }
    
  throw new Error("Should not reach this point");
});

it('does not call ack if version is out of sequence', async () => {
  const { listener, data, msg } = await setup();

  //set the version out of order
  data.version = 5;

  try {
    await listener.onMessage(data, msg);
  } catch(err) {
  } finally {
    expect(msg.ack).not.toHaveBeenCalled();
  }

});


