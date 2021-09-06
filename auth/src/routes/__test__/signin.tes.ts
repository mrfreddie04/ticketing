import request from "supertest"; //lest us make fake requests to express app
import { app } from "../../app";

it("fails when email that does not exist is supplied", async () => {
  return request(app)  
    .post("/api/users/signin")
    .send({
      email: "piotr1234@piotr.com",
      password: "12345"      
    })
    .expect(400);      
});

it("fails when invalid password is supplied", async () => {
  await request(app)  
    .post("/api/users/signup")
    .send({
      email: "piotr123@piotr.com",
      password: "12345"
    })
    .expect(201);

  return request(app)  
    .post("/api/users/signin")
    .send({
      email: "piotr123@piotr.com",
      password: "1234"      
    })
    .expect(400);      
});

it("responds with a cookie on successful signin", async () => {
  //it will call POST /api/users/signup running thru the entire spp middleware as if it came via http from the client
  await request(app)  
    .post("/api/users/signup")
    .send({
      email: "piotr123@piotr.com",
      password: "12345"
    })
    .expect(201);

  const response = await request(app)  
    .post("/api/users/signin")
    .send({
      email: "piotr123@piotr.com",
      password: "12345"      
    })
    .expect(200);      

  expect(response.get("Set-Cookie"))
    .toBeDefined();    
});