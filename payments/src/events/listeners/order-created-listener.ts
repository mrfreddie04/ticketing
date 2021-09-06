import { Listener, OrderCreatedEvent, OrderCreatedEventData, Subjects, OrderStatus } from "@monroe-computer-technology/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { Order } from "../../models/order";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  protected readonly subject = Subjects.OrderCreated;
  public queueGroupName: string = queueGroupName;

  async onMessage(data: OrderCreatedEventData, msg: Message): Promise<void> {      
      const status: OrderStatus =  data.status in OrderStatus ? data.status as OrderStatus : OrderStatus.Created;
      const order = Order.build({
        id: data.id,
        userId: data.userId,
        status: status,
        version: data.version,
        price: data.ticket.price
      });

      await order.save();

      msg.ack();
  }
}