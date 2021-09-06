import nats, { Stan } from "node-nats-streaming";

class NatsWrapper {
  private static _instance: NatsWrapper;
  private _client?: Stan;

  private constructor() {
    console.log("In NATS ctor!");
  }

  public get client(): Stan {
    if(this._client)
      return this._client;
    throw new Error("Cannot access NATS client before connecting")  ;
  }

  public static get Instance()
  {
      // Do you need arguments? Make it a regular static method instead.
      return this._instance || (this._instance = new this());
  }  

  public connect(clusterId: string, clientId: string, url: string): Promise<void> {
    this._client = nats.connect(clusterId, clientId, {url: url});

    return new Promise<void>((resolve,reject) => {
      this.client.on("connect", () => {
        console.log("Connected to NATS")
        resolve();
      });
      this.client.on("error", (err) => {
        reject(err);
      });
    })
  }

}

//export a single instance
export const natsWrapper = NatsWrapper.Instance;