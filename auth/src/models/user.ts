import mongoose from "mongoose";
import { Password } from "../services/password";

//An interface that describes properties required to create a new user
interface UserAttrs {
  email: string;
  password: string;
}

//An interface to describe properties that a User Document (single user) has
interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
  //list extra properties if we configure mongoose to add fields like createdAt, updatedAt, etc..
}

//An iterface that describes the properties that a User Model (collection of users) has (like dbSet<UserDoc>)
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

const userSchema = new mongoose.Schema({
  email: {
    type: String, //this is NOT ts string type
    required: true
  },
  password: {
    type: String, //this is NOT ts string type
    required: true
  }
}, {
  toJSON: {
    transform(doc, ret) {
      delete ret.password;
      delete ret.__v;
      ret.id = ret._id;
      delete ret._id;
      //return ret;
    }
  }
});

userSchema.statics.build = (userAttrs: UserAttrs): UserDoc => {
  return new User(userAttrs);
};

userSchema.pre("save", async function(done) {
  if( this.isModified("password")) {
    const hashed = await Password.toHash(this.get("password"));
    this.set("password", hashed);
  }
  
  done();
});

//User model
//function mode<T extends Document, U extends Model<T>>
const User: UserModel = mongoose.model<UserDoc, UserModel>("User", userSchema);

// TEST
// const user = User.build({
//   email: "test@test.com",
//   password: "1234"
// });

export { User };