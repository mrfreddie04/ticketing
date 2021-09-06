import { Publisher } from "./base-publisher";
import { Subjects } from "./subjects";
import { TicketCreatedEvent } from "./ticket-created-event";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  protected readonly subject = Subjects.TicketCreated;

  public onPublish(data: TicketCreatedEvent["data"]): void {
    console.log(`Event published to subject ${this.subject}`);
  }
}