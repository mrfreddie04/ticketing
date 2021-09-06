import { Subscription, Message, Stan, SubscriptionOptions } from "node-nats-streaming";
import { Subjects } from "./subjects";

interface Event {
  subject: Subjects;
  data: any;
};

export abstract class Listener<T extends Event> {
  protected abstract subject: T["subject"];
  public abstract queueGroupName:string;
  public abstract onMessage(data: T["data"], msg: Message): void;

  private client: Stan;
  protected ackWait: number = 5 * 1000;

  constructor(client: Stan) {
    this.client = client;
  }

  public subscriptionOptions(): SubscriptionOptions {
    return this.client
      .subscriptionOptions()
      .setManualAckMode(true)
      .setDeliverAllAvailable()
      .setAckWait(this.ackWait)
      .setDurableName(this.queueGroupName);    
  };

  public listen(): void {
    const subscription: Subscription = this.client.subscribe(
      this.subject,
      this.queueGroupName,
      this.subscriptionOptions()
      );
  
    subscription.on("message", (msg: Message) => {
      console.log(
        `Message received: ${this.subject} / ${this.queueGroupName}`
      );
      const parsedData = this.parseMessage(msg);
      this.onMessage(parsedData, msg);
    });
  };

  public parseMessage(msg:Message): any {
    const data = msg.getData();
    return typeof data === "string" 
      ? JSON.parse(data) //String
      : JSON.parse(data.toString("utf8")); //Buffer      
  }  
}