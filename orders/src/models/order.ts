import mongoose from "mongoose";
import { OrderStatus } from "@monroe-computer-technology/common";
import { TicketDoc } from "./ticket";
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

//An interface that describes properties required to create a new user
interface OrderAttrs {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticket: TicketDoc;
}

//An interface to describe properties that a User Document (single user) has
interface OrderDoc extends mongoose.Document {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticket: TicketDoc;
  version: number;  
  //list extra properties if we configure mongoose to add fields like createdAt, updatedAt, etc..
}

//An iterface that describes the properties that a User Model (collection of users) has (like dbSet<UserDoc>)
interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc;
}

const orderSchema = new mongoose.Schema({
  userId: {
    type: String, 
    required: true
  },    
  status: {
    type: String, 
    required: true,
    enum: Object.values(OrderStatus),
    default: OrderStatus.Created
  },      
  expiresAt: {
    type: mongoose.Schema.Types.Date, 
    required: false //completed orders do not expire
  },
  ticket: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Ticket", //Ticket is a Model Class
    required: true
  },  
}, {
  toJSON: {
    transform(doc, ret) {
      //mofiy ret before it is returned 
      delete ret.__v;
      ret.id = ret._id;
      delete ret._id;
    }
  }
});

orderSchema.set("versionKey", "version"); //rename __v to version
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (orderAttrs: OrderAttrs): OrderDoc => {
  return new Order({
    userId: orderAttrs.userId,
    status: orderAttrs.status,
    ticket: orderAttrs.ticket,
    expiresAt: orderAttrs.expiresAt
  });
};

const Order: OrderModel = mongoose.model<OrderDoc, OrderModel>("Order", orderSchema);

export { Order, OrderStatus };