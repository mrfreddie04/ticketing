import { Publisher, Subjects, TicketCreatedEvent } from "@monroe-computer-technology/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  protected readonly subject = Subjects.TicketCreated;

  public onPublish(data: TicketCreatedEvent["data"]): void {
    console.log(`Event published to subject [${this.subject}]. Version: ${data.version}`);
  }
}