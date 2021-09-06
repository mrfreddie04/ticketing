import { Publisher, Subjects, OrderCreatedEvent, OrderCreatedEventData } from "@monroe-computer-technology/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  protected readonly subject = Subjects.OrderCreated;
  onPublish(data: OrderCreatedEventData): void {
    console.log(`Event published to subject [${this.subject}]`);
  }
}