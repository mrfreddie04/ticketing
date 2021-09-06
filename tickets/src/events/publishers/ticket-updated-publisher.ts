import { Publisher, Subjects, TicketUpdatedEventData, TicketUpdatedEvent } from "@monroe-computer-technology/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  protected readonly subject = Subjects.TicketUpdated;
  onPublish(data: TicketUpdatedEventData): void {
    console.log(`Event published to subject [${this.subject}]. Version: ${data.version}`);
  }
}