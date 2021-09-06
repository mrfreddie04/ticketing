import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest"; 
import { app } from "../app";

//inform ts about signin global method
declare global {
  var signin: () => Promise<string[]>;
}

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

global.signin = async () => {
  const response = await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password"
    })
    .expect(201);

  return response.get("Set-Cookie");
};