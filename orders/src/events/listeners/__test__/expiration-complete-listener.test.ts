import { Message } from 'node-nats-streaming';
import { ExpirationCompleteEventData, OrderStatus, Subjects } from "@monroe-computer-technology/common";
import { ExpirationCompleteListener } from '../expiration-complete-listener';
import { Order } from "../../../models/order";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";

const setup = async () => {
  //Create a listener
  const listener = new ExpirationCompleteListener(natsWrapper.client);

  //Generate ticket id
  const ticketId = global.getMongooseId();

  const ticket = Ticket.build({
    id: ticketId,
    title: "Scary Movie",
    price: 20
  });

  await ticket.save();

  //Build new ticket object & save to db
  const order = Order.build({
    userId: global.getMongooseId(),
    status: OrderStatus.Created,
    expiresAt: new Date(),
    ticket: ticket
  });    
  await order.save();

  //save order id
  const orderId = order.id

  //Create fake ticker:updated event data
  const data: ExpirationCompleteEventData = {
    orderId: orderId
  };

  //Create a fake message object - provide mocj for ack() method
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  //return ingredients
  return {listener, order, ticket, data, msg};
};

it('updates the order status to cancelled', async () => {
  //Arrange
  const { listener, data, msg, order } = await setup();

  //Act - call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);

  //Assert - make sure the order was cancelled
  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder).toBeDefined();
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it("acks the message", async () => {
  //Arrange
  const { listener, data, msg } = await setup();

  //Act - call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);

  //Assert - make sure msg.ack() was called
  expect(msg.ack).toHaveBeenCalled();
});

it('publishes OrderCancelled event', async () => {
  //Arrange
  const { listener, data, msg, order, ticket } = await setup();

  //Act - call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);

  //Assert - make sure the order was cancelled
  expect(natsWrapper.client.publish as jest.Mock).toHaveBeenCalled();

  // check arguments
  // const calls = (natsWrapper.client.publish as jest.Mock).mock.calls
  // console.log(natsWrapper.client.publish.mock.calls)
  const args = (natsWrapper.client.publish as jest.Mock).mock.calls[0];
  const cancelledOrderData = JSON.parse(args[1]);
  //console.log(cancelledOrderData);
  expect(args[0]).toEqual(Subjects.OrderCancelled);
  expect(cancelledOrderData.id).toEqual(order.id);
  expect(cancelledOrderData.ticket.id).toEqual(ticket.id);
});