import { OrderCancelledPublisher } from './../publishers/order-cancelled-publisher';
import { 
    Listener, 
    ExpirationCompleteEvent, 
    ExpirationCompleteEventData, 
    OrderCancelledEventData,
    Subjects, 
    OrderStatus,
    NotFoundError,
    BadRequestError
} from "@monroe-computer-technology/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { Order } from "../../models/order";

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
  protected readonly subject = Subjects.ExpirationComplete;
  public queueGroupName: string = queueGroupName;

  async onMessage(data: ExpirationCompleteEventData, msg: Message): Promise<void> {
    const orderId = data.orderId;  

    const order = await Order.findById(orderId).populate("ticket");

    if(!order) {
      throw new NotFoundError();      
    }

    if(order.status === OrderStatus.Complete) {
      throw new BadRequestError("Order already complete");
    }

    order.set({
      status: OrderStatus.Cancelled
    });

    await order.save();

    const orderCancelledEventData:  OrderCancelledEventData = {
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id
      }
    };    
    const publisher = new OrderCancelledPublisher(this.client);
    await publisher.publish(orderCancelledEventData);

    msg.ack();
  }

}