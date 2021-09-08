import request from "supertest"; //lest us make fake requests to express app
import { app } from "../../app";

it("returns a 201 on successful signup", async () => {
  //it will call POST /api/users/signup running thru the entire app middleware as if it came via http from the client
  return request(app)  
    .post("/api/users/signup")
    .send({
      email: "piotr123@piotr.com",
      password: "12345"
    })
    .expect(201);
});

it("returns a 400 on invalid input - email", async () => {
  return request(app)  
    .post("/api/users/signup")
    .send({
      email: "piotr123@piotrcom",
      password: "12345"
    })
    .expect(400);
});

it("returns a 400 on invalid input - password", async () => {
  return request(app)  
    .post("/api/users/signup")
    .send({
      email: "piotr123@piotr.com",
      password: "1"
    })
    .expect(400);
});

it("returns a 400 on invalid input - missign email or password", async () => {
  await request(app)  
    .post("/api/users/signup")
    .send({
      email: "piotr123@piotr.com",
    })
    .expect(400);

  await request(app)  
    .post("/api/users/signup")
    .send({
      password: "12345"
    })
    .expect(400);

  return request(app)  
    .post("/api/users/signup")
    .send({
    })
    .expect(400);    
});


it("disallows duplicate emails", async () => {
  await request(app)  
    .post("/api/users/signup")
    .send({
      email: "piotr123@piotr.com",
      password: "12345"
  })
  .expect(201);

  return request(app)  
  .post("/api/users/signup")
  .send({
    email: "piotr123@piotr.com",
    password: "12345"
  })
  .expect(400);
});

it("sets a cookie aftrer successful signup", async () => {
  const response = await request(app)  
    .post("/api/users/signup")
    .send({
      email: "piotr123@piotr.com",
      password: "12345"
  })
  .expect(201);

  expect(response.get("Set-Cookie"))
    .toBeDefined();
});