import { 
  Listener, 
  PaymentCreatedEvent, 
  PaymentCreatedEventData, 
  Subjects,
  OrderStatus,
  NotFoundError
} from "@monroe-computer-technology/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { Order } from "../../models/order";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  protected readonly subject = Subjects.PaymentCreated;
  public queueGroupName: string = queueGroupName;
  
  async onMessage(data: PaymentCreatedEventData, msg: Message): Promise<void> {
    const {orderId, id, stripeId} = data;
    
    const order = await Order.findById(orderId);

    if(!order) {
      throw new NotFoundError();   
    }

    order.set({status: OrderStatus.Complete});
    await order.save();

    //ideally should emit an additional event to bring other services in-sync (version number)

    msg.ack();
  }

}