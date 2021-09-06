import { TicketUpdatedEventData } from "@monroe-computer-technology/common";
import mongoose from "mongoose";
import { Order, OrderStatus } from "./order";
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

//An interface that describes properties required to create a new user
interface TicketAttrs {
  id: string;
  title: string;
  price: number;
}

//An interface to describe properties that a User Document (single user) has
export interface TicketDoc extends mongoose.Document {
  title: string;
  version: number;
  price: number;
  isReserved(): Promise<boolean>;
}

//An iterface that describes the properties that a User Model (collection of users) has (like dbSet<UserDoc>)
interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
  findByEvent(event: {id: string; version: number;}): Promise<TicketDoc|null>;
}

const ticketSchema = new mongoose.Schema({
  // version: {
  //   type: Number,
  //   required: true
  // },  
  title: {
    type: String, //this is NOT ts string type, this tis GLOBAL String ctor in js
    required: true
  },
  price: {
    type: Number ,
    required: true,
    min: 0
  }
}, {
  toJSON: {
    transform(doc, ret) {
      //mofiy ret before it is returned 
      ret.id = ret._id;
      delete ret._id;
    }
  }
});

ticketSchema.set("versionKey", "version"); //rename __v to version
ticketSchema.plugin(updateIfCurrentPlugin);

// ticketSchema.pre("save", function(done) {
//   //when saving this record mongoose will add version check to the existing select criteria
//   this.$where = {
//     version: this.get("version") - 1
//   };
//   done();
// });

ticketSchema.statics.build = (ticketAttrs: TicketAttrs): TicketDoc => {
  return new Ticket({
    _id: ticketAttrs.id,
    //version: ticketAttrs.version,
    title: ticketAttrs.title,
    price: ticketAttrs.price
  });
};

ticketSchema.statics.findByEvent = async (event: {id: string; version: number;}): Promise<TicketDoc|null> => {
  const ticket = await Ticket.findOne({ 
    _id: event.id, 
    version: event.version - 1
  });
  return ticket;
};

ticketSchema.methods.isReserved = async function(): Promise<boolean> {
  //Find orders with this ticket, status !Cancelled
  const existingOrder = await Order.findOne({ 
    ticket: this as TicketDoc, //because we use reference it will in actuality check for ticketId only
    status: {
      $in: [
        OrderStatus.AwaitingPayment, 
        OrderStatus.Complete, 
        OrderStatus.Created
      ]
    }
  });
  return !!existingOrder;
}

//User model
//function mode<T extends Document, U extends Model<T>>
const Ticket: TicketModel = mongoose.model<TicketDoc, TicketModel>("Ticket", ticketSchema);

export { Ticket };