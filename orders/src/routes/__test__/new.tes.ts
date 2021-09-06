import request from "supertest"; //lest us make fake requests to express app
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { Order, OrderStatus } from "../../models/order";

import { natsWrapper } from "../../nats-wrapper";

it("has a route handler listening to /api/orders for post requests", async () => {

  const response = await request(app)  
    .post("/api/orders")
    .send({});

  expect(response.status).not.toEqual(404);
});

it("returns 401 if user is not signed in", async () => {

  const response = await request(app)  
    .post("/api/orders")
    .send({});  

    expect(response.status).toEqual(401);
});

it("returns a status other than 401 if the user is signed in", async () => {
  const cookie = global.signin();

  const response = await request(app)  
    .post("/api/orders")
    .set("Cookie",cookie)
    .send({});  

    expect(response.status).not.toEqual(401);
});

it("returns error if user is signed in, but invalid ticketId is provided", async () => {
  const cookie = global.signin();

  await request(app)  
    .post("/api/orders")
    .set("Cookie",cookie)
    .send({
    }).expect(400);  

  await request(app)  
    .post("/api/orders")
    .set("Cookie",cookie)
    .send({
      ticketId: ""
    }).expect(400);

  await request(app)  
    .post("/api/orders")
    .set("Cookie",cookie)
    .send({
      ticketId: "123456"
    }).expect(400);
});

it("returns an error (status 404) if the input is valid, but ticket does not exist", async () => {
  const cookie = global.signin();

  const response = await request(app)  
    .post("/api/orders")
    .set("Cookie",cookie)
    .send({
      ticketId: global.getMongooseId()
    });  

  expect(response.status).toEqual(404);
});

it("returns an error (status 400) if the ticket is already reserved", async () => {

  //arrange 
  //create a ticket
  const ticket = Ticket.build({
    id: global.getMongooseId(),
    title: "Test Ticket",
    price: 1000
  });
  await ticket.save();

  //console.log("Ticket", ticket);

  //create an active order for this ticket
  const order = Order.build({
    userId: global.getMongooseId(),
    status: OrderStatus.Created,
    ticket: ticket,
    expiresAt: new Date()
  });
  await order.save();

  //console.log("Order", order);

  //act
  const response = await request(app)  
    .post("/api/orders")
    .set("Cookie",global.signin())
    .send({
      ticketId: ticket.id!
    });  

  //assert  
  expect(response.status).toEqual(400);
});

it("reserves ticket (status 201) if ticket is available (order cancelled)", async () => {
  //arrange 
  //create a ticket
  const ticket = Ticket.build({
    id: global.getMongooseId(),
    title: "Test Ticket",
    price: 1000
  });
  await ticket.save();

  //console.log("Ticket", ticket);

  //create an active order for this ticket
  const order = Order.build({
    userId: global.getMongooseId(),
    status: OrderStatus.Cancelled,
    ticket: ticket,
    expiresAt: new Date()
  });
  await order.save();

  //console.log("Order", order);

  //act
  const response = await request(app)  
    .post("/api/orders")
    .set("Cookie",global.signin())
    .send({
      ticketId: ticket.id!
    });  

  //assert  
  expect(response.status).toEqual(201);  
});

it("reserves ticket (status 201) if ticket is available (no orders)", async () => {
  //arrange 
  //create a ticket
  const ticket = Ticket.build({
    id: global.getMongooseId(),
    title: "Test Ticket",
    price: 1000
  });
  await ticket.save();

  //console.log("Ticket", ticket);

  //act
  const response = await request(app)  
    .post("/api/orders")
    .set("Cookie",global.signin())
    .send({
      ticketId: ticket.id!
    });  

  //assert  
  expect(response.status).toEqual(201);  
});

it("emits an order created event", async () => {
  //arrange 
  //create a ticket
  const ticket = Ticket.build({
    id: global.getMongooseId(),
    title: "Test Ticket",
    price: 1000
  });
  await ticket.save();

  //act
  const response = await request(app)  
    .post("/api/orders")
    .set("Cookie",global.signin())
    .send({
      ticketId: ticket.id!
    });  

  //assert  
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});