import { ExpirationCompleteEvent, ExpirationCompleteEventData, Publisher, Subjects } from "@monroe-computer-technology/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent>{
  protected readonly subject = Subjects.ExpirationComplete;
  
  onPublish(data: ExpirationCompleteEventData): void {
    console.log(`Event published to subject [${this.subject}]`);
  }
}