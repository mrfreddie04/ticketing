// import { Stan } from "node-nats-streaming";

// class NatsWrapper {
//   private static _instance: NatsWrapper;

//   private constructor() {
//     console.log("In Fake NATS ctor!");
//   }

//   public get client(): Partial<Stan> {
//     console.log("In Client get()");
//     return {
//       publish: (subject: string, data: string, callback: ()=>void): string => {
//         callback();
//         return "12345";
//       }
//     }
//   }

//   public static get Instance()
//   {
//       // Do you need arguments? Make it a regular static method instead.
//       return this._instance || (this._instance = new this());
//   }  
// }

//export a single instance
//export const natsWrapper = NatsWrapper.Instance;


//fake implementation
// export const natsWrapper = {
//   client: {
//     publish: (subject: string, data: string, callback: ()=>void): string => {
//       callback();
//       return "12345";
//     }    
//   }
// };

//mock implementation
export const natsWrapper = {
  client: {
      publish: jest.fn()
        .mockImplementation(
          (subject: string, data: string, callback: ()=>void)=>{
            callback(); //call with no parameters - as nats does to signal the success
            return "12345";
          }
        )
    }    
};