import mongoose from "mongoose";
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

//An interface that describes properties required to create a new user
interface TicketAttrs {
  userId: string;
  title: string;
  price: number;
}

//An interface to describe properties that a User Document (single user) has
interface TicketDoc extends mongoose.Document {
  userId: string;
  title: string;
  price: number;
  version: number;
  orderId?: string;
  createdAt: string;
  //list extra properties if we configure mongoose to add fields like createdAt, updatedAt, etc..
}

//An iterface that describes the properties that a User Model (collection of users) has (like dbSet<UserDoc>)
interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
}

const ticketSchema = new mongoose.Schema({
  title: {
    type: String, //this is NOT ts string type, this tis GLOBAL String ctor in js
    required: true
  },
  price: {
    type: Number ,
    required: true
  },
  userId: {
    type: String, 
    required: true
  },  
  orderId: {
    type: String, 
    required: false
  },    
  createdAt: {
    type: String, 
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

ticketSchema.set("versionKey", "version"); //rename __v to version
ticketSchema.plugin(updateIfCurrentPlugin);

ticketSchema.statics.build = (ticketAttrs: TicketAttrs): TicketDoc => {
  return new Ticket({
    userId: ticketAttrs.userId,
    title: ticketAttrs.title,
    price: ticketAttrs.price,
    createdAt: Date.now().toString()
  });
};

ticketSchema.pre("save", async function(done) {  
  //in the context of tis function keyword "this" ponts tot he document being saved
  done();
});

//User model
//function mode<T extends Document, U extends Model<T>>
const Ticket: TicketModel = mongoose.model<TicketDoc, TicketModel>("Ticket", ticketSchema);


export { Ticket };