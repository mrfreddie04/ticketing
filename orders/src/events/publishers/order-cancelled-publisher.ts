import { Publisher, Subjects, OrderCancelledEvent, OrderCancelledEventData } from "@monroe-computer-technology/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  protected readonly subject = Subjects.OrderCancelled;
  onPublish(data: OrderCancelledEventData): void {
    console.log(`Event published to subject [${this.subject}]`);
  }
}