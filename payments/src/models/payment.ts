import mongoose from "mongoose";
import { OrderStatus } from "@monroe-computer-technology/common";
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

//An interface that describes properties required to create a new user
interface PaymentAttrs {
  orderId: string;
  stripeId: string;
}

//An interface to describe properties that a User Document (single user) has
interface PaymentDoc extends mongoose.Document {
  orderId: string;
  stripeId: string;
  version: number;  
  //list extra properties if we configure mongoose to add fields like createdAt, updatedAt, etc..
}

//An iterface that describes the properties that a User Model (collection of users) has (like dbSet<UserDoc>)
interface PaymentModel extends mongoose.Model<PaymentDoc> {
  build(attrs: PaymentAttrs): PaymentDoc;
}

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: String, 
    required: true
  },    
  stripeId: {
    type: String, 
    required: true
  }
}, {
  toJSON: {
    transform(doc, ret) {
      //modifiy ret before it is returned 
      delete ret.__v;
      ret.id = ret._id;
      delete ret._id;
    }
  }
});

paymentSchema.set("versionKey", "version"); //rename __v to version
paymentSchema.plugin(updateIfCurrentPlugin);

paymentSchema.statics.build = (paymentAttrs: PaymentAttrs): PaymentDoc => {
  return new Payment({
    orderId: paymentAttrs.orderId,
    stripeId: paymentAttrs.stripeId
  });
};

paymentSchema.statics.findByEvent = async (event: {id: string; version: number;}): Promise<PaymentDoc|null> => {
  const ticket = await Payment.findOne({ 
    _id: event.id, 
    version: event.version - 1
  });
  return ticket;
};

const Payment: PaymentModel = mongoose.model<PaymentDoc, PaymentModel>("Payment", paymentSchema);

export { Payment };