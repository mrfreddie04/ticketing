import { Stan } from "node-nats-streaming";
import { Subjects } from "./subjects";

interface Event {
  subject: Subjects;
  data: any;
};

export abstract class Publisher<T extends Event> {
  protected abstract subject: T["subject"];
  public abstract onPublish(data: T["data"]): void;

  private client: Stan;

  constructor(client: Stan) {
    this.client = client;
  }

  public publish(data: T["data"]): Promise<void> {
    return new Promise((resolve, reject ) => {
      this.client.publish(this.subject, JSON.stringify(data), (err) => {
        if(err) {
          reject(err);
          return;
        }
        this.onPublish(data);
        resolve();
      });
    });
  };

}

