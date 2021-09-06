import mongoose from "mongoose";
import { OrderStatus } from "@monroe-computer-technology/common";
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

//An interface that describes properties required to create a new user
interface OrderAttrs {
  id: string;
  userId: string;
  status: OrderStatus;
  price: number;
  version: number; 
}

//An interface to describe properties that a User Document (single user) has
interface OrderDoc extends mongoose.Document {
  userId: string;
  status: OrderStatus;
  price: number;
  version: number;  
  //list extra properties if we configure mongoose to add fields like createdAt, updatedAt, etc..
}

//An iterface that describes the properties that a User Model (collection of users) has (like dbSet<UserDoc>)
interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc;
  findByEvent(event: {id: string; version: number;}): Promise<OrderDoc|null>;
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
  price: {
    type: Number, 
    required: true
  }
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
    _id: orderAttrs.id,
    userId: orderAttrs.userId,
    status: orderAttrs.status,
    price: orderAttrs.price,
    version: orderAttrs.version 
  });
};

orderSchema.statics.findByEvent = async (event: {id: string; version: number;}): Promise<OrderDoc|null> => {
  const ticket = await Order.findOne({ 
    _id: event.id, 
    version: event.version - 1
  });
  return ticket;
};

const Order: OrderModel = mongoose.model<OrderDoc, OrderModel>("Order", orderSchema);

export { Order, OrderStatus };