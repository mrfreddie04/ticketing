import { Message } from 'node-nats-streaming';
import { TicketCreatedEventData } from "@monroe-computer-technology/common";
import { natsWrapper } from "../../../nats-wrapper";
import { TicketCreatedListener } from "../ticket-created-listener";
import { Ticket } from "../../../models/ticket";

const setup = async () => {
  //Create an instance of a listener
  const listener = new TicketCreatedListener(natsWrapper.client);

  //Create a fake event data
  const data: TicketCreatedEventData = {
    id: global.getMongooseId(),
    version: 0,
    title: "Movie 123",
    price: 100,
    userId: global.getMongooseId()
  };

  //Create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return {listener, data, msg};
};

it('creates and saves a ticket', async () => {
  //Arrange
  const { listener, data, msg } = await setup();

  //Act - call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);

  //Assert - make sure a ticket was created and has proper content
  const ticket = await Ticket.findById(data.id);

  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
});

it("acks the message", async () => {
  const { listener, data, msg } = await setup();

  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);

  // write assertions to make sure a ticket was created!
  expect(msg.ack).toHaveBeenCalled();
});