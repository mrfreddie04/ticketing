import { Message } from "node-nats-streaming";
import { Order } from "../../../models/order";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledEventData, OrderStatus } from "@monroe-computer-technology/common";
import { OrderCancelledListener } from "../order-cancelled-listener";

const setup = async () => {
  //Create listener
  const listener = new OrderCancelledListener(natsWrapper.client);

  const orderId = global.getMongooseId();

  //Create an order
  const order = Order.build({
    id: orderId,
    userId: global.getMongooseId(),
    status: OrderStatus.Created,
    price: 100,
    version: 0
  });

  await order.save();

  //Create OrderCreatedEventData object
  const data: OrderCancelledEventData = {
    id: orderId,
    version: 1,
    ticket: {
      id: global.getMongooseId()
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

it('updates order status to cancelled', async () => {
  //Arrange
  const  { listener, data, msg, orderId } = await setup();

  //Act
  await listener.onMessage(data, msg);
  const order = await Order.findById(orderId);

  //Assert
  expect(order).toBeDefined();
  expect(order!.id).toEqual(orderId);
  expect(order!.status).toEqual(OrderStatus.Cancelled);
});

it("acks the message", async () => {
  //Arrange
  const  { listener, data, msg } = await setup();

  //Act
  await listener.onMessage(data, msg);

  //Assert
  expect(msg.ack).toHaveBeenCalled();
})