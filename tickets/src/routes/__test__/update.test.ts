import request from "supertest"; //lest us make fake requests to express app
import { app } from "../../app";
import { getMongooseId } from "./utility";
import { Ticket } from "../../models/ticket";

import { natsWrapper } from "../../nats-wrapper";

const createTicket = (cookie: string[], title: string, price: number) => {
  return request(app)  
    .post("/api/tickets")
    .set("Cookie",cookie)    
    .send({
      title: title,
      price: price
    });
}

it("returns 404 if provided id does not exist", async () => {
  const ticketUpdater = global.signin();

  await request(app)  
    .put(`/api/tickets/${getMongooseId()}`)
    .set("Cookie",ticketUpdater)
    .send({
      title: "Ticket Updated",
      price: 60      
    })
    .expect(404);
});

it("returns 401 if user is not authenticated", async () => {
  await request(app)  
    .put(`/api/tickets/${getMongooseId()}`)
    .send({
      title: "Ticket Updated",
      price: 60      
    })
    .expect(401);
});

it("returns 401 if user does not own the ticket", async () => {  
  const ticketOwner = global.signin();
  const ticketUpdater = global.signin();

  const response = await createTicket(ticketOwner,"Ticket Created",50);

  await request(app)  
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie",ticketUpdater)
    .send({
      title: "Ticket Updated",
      price: 60      
    })
    .expect(401);
});

it("rejects update if the ticket is reserved", async () => {  
  const ticketOwner = global.signin();

  const response = await createTicket(ticketOwner,"Ticket Created",50);

  //update ticket in the db - set orderId
  const ticketId = response.body.id;
  const orderId = global.getMongooseId();
  const ticket = await Ticket.findById(ticketId);
  ticket!.set({orderId:orderId});
  await ticket!.save();

  //assert that request to update will return 400 (Bad Request)
  await request(app)  
    .put(`/api/tickets/${ticketId}`)
    .set("Cookie",ticketOwner)
    .send({
      title: "Ticket Updated",
      price: 60      
    })
    .expect(400);
});

it("returns 400 if update data is invalid", async () => {
  const ticketOwner = global.signin();

  const response = await createTicket(ticketOwner,"Ticket Created",50);

  await request(app)  
    .put(`/api/tickets/${response}`)
    .set("Cookie",ticketOwner)
    .send({
      price: -10
    })
    .expect(400);
});

it("updates the ticket provided valid inputs", async () => {
  const ticketOwner = global.signin();
  const createResponse = await createTicket(ticketOwner,"Ticket Created",50);
  const ticket = {
    title: "New Title and price $100",
    price: 100
  };

  const updateResponse = await request(app)  
    .put(`/api/tickets/${createResponse.body.id}`)
    .set("Cookie",ticketOwner)
    .send(ticket)
    .expect(200);

  console.log("Ticket Updated",updateResponse.body);     

  const response = await request(app)  
    .get(`/api/tickets/${createResponse.body.id}`)
    .send()
    .expect(200);    
  
  expect(response.body.id).toEqual(createResponse.body.id);  
  expect(response.body.title).toEqual(ticket.title);  
  expect(response.body.price).toEqual(ticket.price);    
});

it("publishes an event for ticket update", async () => {  
  const ticketOwner = global.signin();
  const createResponse = await createTicket(ticketOwner,"Ticket Created",50);
  const ticket = {
    title: "New Title and price $100",
    price: 100
  };

  const updateResponse = await request(app)  
    .put(`/api/tickets/${createResponse.body.id}`)
    .set("Cookie",ticketOwner)
    .send(ticket)
    .expect(200);

  console.log("Ticket Updated",updateResponse.body);     

  //check if publish function was called    
  expect(natsWrapper.client.publish).toHaveBeenCalled();

});