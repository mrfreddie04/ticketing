import { Publisher, PaymentCreatedEvent, PaymentCreatedEventData, Subjects } from "@monroe-computer-technology/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  protected readonly subject = Subjects.PaymentCreated;
  onPublish(data: PaymentCreatedEventData): void {
    console.log(`Event published to subject [${this.subject}]`);
  }

}