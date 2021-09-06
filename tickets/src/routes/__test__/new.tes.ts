import request from "supertest"; //lest us make fake requests to express app
import { app } from "../../app";
import { Ticket } from "../../models/ticket";

import { natsWrapper } from "../../nats-wrapper";

it("has a route handler listening to /api/tickets for post requests", async () => {

  const response = await request(app)  
    .post("/api/tickets")
    .send({});

  expect(response.status).not.toEqual(404);
});

it("can only be accessed if user is signed in", async () => {

  const response = await request(app)  
    .post("/api/tickets")
    .send({});  

    expect(response.status).toEqual(401);
});

it("returns a status other than 401 if the user is signed in", async () => {
  const cookie = global.signin();

  const response = await request(app)  
    .post("/api/tickets")
    .set("Cookie",cookie)
    .send({});  

    expect(response.status).not.toEqual(401);
});


it("returns error if invalid title is provided", async () => {
  const cookie = global.signin();

  await request(app)  
    .post("/api/tickets")
    .set("Cookie",cookie)
    .send({
      price: 100
    }).expect(400);

  await request(app)  
    .post("/api/tickets")
    .set("Cookie",cookie)
    .send({
      title: "",
      price: 100
    }).expect(400);
});

it("returns error if invalid price is provided", async () => {
  const cookie = global.signin();

  await request(app)  
    .post("/api/tickets")
    .set("Cookie",cookie)
    .send({
      title: "My title"
    }).expect(400);
 
  await request(app)  
    .post("/api/tickets")
    .set("Cookie",cookie)
    .send({
      title: "My title",
      price: ""
    }).expect(400);
 
  await request(app)  
      .post("/api/tickets")
      .set("Cookie",cookie)
      .send({
        title: "My title",
        price: "abc"
      }).expect(400);  

  await request(app)  
    .post("/api/tickets")
    .set("Cookie",cookie)
    .send({
      title: "My title",
      price: -10
    }).expect(400);      

  await request(app)  
    .post("/api/tickets")
    .set("Cookie",cookie)
    .send({
      title: "My title",
      price: 0
    }).expect(400);        
});

it("creates a ticket with valid inputs", async () => {
  const beforeTics = await Ticket.count({});

  //expect(beforeTics).toEqual(0);
  const ticket = {
    title: "My title",
    price: 100.55
  };

  const response = await request(app)  
    .post("/api/tickets")
    .set("Cookie",global.signin())
    .send(ticket).expect(201);

  const afterTics = await Ticket.count({});  
  expect(afterTics-beforeTics).toEqual(1);

  const tickets = await Ticket.find({});  
  expect(tickets.length).toEqual(1);
  expect(tickets[0].title).toEqual(ticket.title);
  expect(tickets[0].price).toEqual(ticket.price);
});

it("publishes an event for a new ticket", async () => {  
  //expect(beforeTics).toEqual(0);
  const ticket = {
    title: "My title",
    price: 100.55
  };

  const response = await request(app)  
    .post("/api/tickets")
    .set("Cookie",global.signin())
    .send(ticket).expect(201);

  //check if publish function was called    
  expect(natsWrapper.client.publish).toHaveBeenCalled();

  //console.log(natsWrapper);
});