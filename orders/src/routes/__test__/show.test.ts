import request from "supertest"; //lest us make fake requests to express app
import { app } from "../../app";
import { Ticket } from "../../models/ticket";

const buildTicket = async () => {
  const ticket = Ticket.build({
    id: global.getMongooseId(),
    title: "Test Ticket",
    price: 1000
  });
  await ticket.save();
  return ticket;
}

it("fetches the order", async () => {
  //Create ticket
  const ticket = await buildTicket();

  //Create user
  const user = global.signin();

  //Create order as user 
  const {body: order} = await request(app)
    .post("/api/orders")
    .set("Cookie",user)
    .send({ticketId: ticket.id})
    .expect(201);

  //Make request to get orders for user #2
  const {body: fetchedOrder} = await request(app)  
    .get(`/api/orders/${order.id}`)
    .set("Cookie",user)
    .send()
    .expect(200);

  //console.log("Orders", orders);
  expect(fetchedOrder.id).toEqual(order.id);
  expect(fetchedOrder.ticket.id).toEqual(ticket.id);
});

it("returns 401 if user does not own the order", async () => {
  //Create a ticket
  const ticket = await buildTicket();

  //Create a user
   const user1 = global.signin();
   const user2 = global.signin();

  //Create order for this ticket & user 
  const {body: order} = await request(app)
    .post("/api/orders")
    .set("Cookie",user1)
    .send({ticketId: ticket.id})
    .expect(201);

  //Make request to get the order by the same user
  const {body: fetchedOrder} = await request(app)  
    .get(`/api/orders/${order.id}`)
    .set("Cookie",user2)
    .send()
    .expect(401);

});

