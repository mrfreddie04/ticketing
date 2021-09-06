import { Listener, OrderCancelledEvent, OrderCancelledEventData, Subjects, OrderStatus } from "@monroe-computer-technology/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { Order } from "../../models/order";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  protected readonly subject = Subjects.OrderCancelled;
  public queueGroupName: string = queueGroupName;

  async onMessage(data: OrderCancelledEventData, msg: Message): Promise<void> {

    const order = await Order.findByEvent({id: data.id, version: data.version});
    if(!order) {
      throw new Error("Order not found. Possibly an out of sequence event");
    }

    order.set({ status: OrderStatus.Cancelled });

    await order.save();

    msg.ack();    
  }

}