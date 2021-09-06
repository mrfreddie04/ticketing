import request from "supertest"; //lest us make fake requests to express app
import { app } from "../../app";
import { getMongooseId } from "./utility";

it("returns 404 is ticket is not found", async () => {
  await request(app)  
    .get(`/api/tickets/${getMongooseId()}`)
    .send()
    .expect(404);
});


it("returns a ticket if ticket is found", async () => {
  const ticket = {
    title: "My title",
    price: 100.55
  };

  const postResponse = await request(app)  
    .post("/api/tickets")
    .set("Cookie",global.signin())
    .send(ticket).expect(201);

  //alternatively we could add ticket directly to db

  const ticId = postResponse.body.id;  
  //console.log("Test Tic", ticId);

  const response = await request(app)  
    .get(`/api/tickets/${ticId}`)
    .send()
    .expect(200);

  //console.log("Tix",response.body);
  expect(response.body.id).toEqual(ticId);  
  expect(response.body.title).toEqual(ticket.title);  
  expect(response.body.price).toEqual(ticket.price);  
});
