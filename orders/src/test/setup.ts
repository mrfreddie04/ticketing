import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

//inform ts about signin global method
declare global {
  var signin: (userid?:string) => string[];
  var getMongooseId: () => string;
}

jest.mock("../nats-wrapper");

let mongo: MongoMemoryServer;

//hook function - run before the tested code gets executed
beforeAll( async () => {
  //startup in-memory db server
  //console.log("Running beforeAll");

  process.env.JWT_KEY = "12345";
  
  mongo = new MongoMemoryServer();
  await mongo.start();
  const mongoUri = await mongo.getUri();

  console.log("Mongo Uri: ", mongoUri);
  await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
  });
})

//run before each test
beforeEach( async () => {
  jest.clearAllMocks();
  //reset data in the db
  //console.log("Running beforeAEach");
  const collections = await mongoose.connection.db.collections();
  for(let collection of collections) {
    await collection.deleteMany({});
  }
})

afterAll( async () => {
  //stop server and delete connection
  console.log("Running afterAll");
  await mongo.stop();
  await mongoose.connection.close();
})

global.getMongooseId = () => {
  return new mongoose.Types.ObjectId().toHexString();
}

global.signin = (userid?: string) => {
  //BUILD session cookie 
  //Build JWT payload

  if(!userid){
    userid = global.getMongooseId();
  }

  const payload =  {
    id: userid,
    email: "test@test.com",
    iat: Math.round(Date.now()/1000)
  };

  //create a token
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  //build session object
  const session = { jwt: token };

  //turn session into JSON
  const sessionJson = JSON.stringify(session);

  //encode base64
  const base64 = Buffer.from(sessionJson).toString("base64");

  //return a string that is a cookie with data
  const cookie = `express:sess=${base64}`;
  
  return [cookie];
};




