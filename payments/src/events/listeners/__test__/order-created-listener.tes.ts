import { Message } from "node-nats-streaming";
import { Order } from "../../../models/order";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCreatedEventData, OrderStatus } from "@monroe-computer-technology/common";
import { OrderCreatedListener } from "../order-created-listener";

const setup = () => {
  //Create listener
  const listener = new OrderCreatedListener(natsWrapper.client);

  const orderId = global.getMongooseId();

  //Create OrderCreatedEventData object
  const data: OrderCreatedEventData = {
    id: orderId,
    version: 0,
    status: OrderStatus.Created,
    expiresAt: "123",
    userId: global.getMongooseId(),
    ticket: {
      id: global.getMongooseId(),
      price: 10
    }    
  };
  
  //create mock Message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  //return fabricated objects
  return { listener, data, msg, orderId };
}

it('replicates order info', async () => {
  //Arrange
  const  { listener, data, msg, orderId } = setup();

  //Act
  await listener.onMessage(data, msg);
  const order = await Order.findById(orderId);

  //Assert
  expect(order).toBeDefined();
  expect(order!.id).toEqual(orderId);
  expect(order!.price).toEqual(data.ticket.price);
});

it("acks the message", async () => {
  //Arrange
  const  { listener, data, msg, orderId } = setup();

  //Act
  await listener.onMessage(data, msg);

  //Assert
  expect(msg.ack).toHaveBeenCalled();
})