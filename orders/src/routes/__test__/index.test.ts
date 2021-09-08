import request from "supertest"; //lest us make fake requests to express app
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { Order, OrderStatus } from "../../models/order";

const buildTicket = async () => {
  const ticket = Ticket.build({
    id: global.getMongooseId(),
    title: "Test Ticket",
    price: 1000
  });
  await ticket.save();
  return ticket;
}

it("has a route handler listening to GET /api/orders", async () => {
  const response = await request(app)  
    .get("/api/orders")
    .set("Cookie",global.signin())
    .send()
    .expect(200);
});

it("fetches orders for particular user v(1)", async () => {
  //Create 3 tickets
  const ticket1 = await buildTicket();
  const ticket2 = await buildTicket();
  const ticket3 = await buildTicket();

  //Create 2 users
  const user1 = global.signin();
  const user2 = global.signin();

  //Create 1 order as user #1
  await request(app)
    .post("/api/orders")
    .set("Cookie",user1)
    .send({ticketId: ticket1.id})
    .expect(201);

  //Create 2 orders as user #2
  const {body: order1} = await request(app)
    .post("/api/orders")
    .set("Cookie",user2)
    .send({ticketId: ticket2.id})
    .expect(201); 

  const {body: order2} = await request(app)
    .post("/api/orders")
    .set("Cookie",user2)
    .send({ticketId: ticket3.id})
    .expect(201);

  //Make request to get orders for user #2
  const {body: orders} = await request(app)  
    .get("/api/orders")
    .set("Cookie",user2)
    .send()
    .expect(200);

  //console.log("Orders", orders);
  expect(orders[0].id).toEqual(order1.id);
  expect(orders[1].id).toEqual(order2.id);
  expect(orders[0].ticket.id).toEqual(ticket2.id);
  expect(orders[1].ticket.id).toEqual(ticket3.id);
  expect(orders.filter((o: { id: any; }) => o.id === order2.id).length).toEqual(1);
  //expect(orders.filter((o: { id: any; }) => o.id === order1.id).length).toEqual(1);
  //expect(orders.filter((o: { id: any; }) => o.id === order2.id).length).toEqual(1);
});

// it("fetches orders for particular user v(2)", async () => {
//   //Create 3 tickets
//   const ticket1 = await buildTicket();
//   const ticket2 = await buildTicket();
//   const ticket3 = await buildTicket();

//   //Create 1 order as user #1
//   const user1 = global.getMongooseId();
//   const order1 = Order.build({
//     userId: user1,
//     status: OrderStatus.Created,
//     ticket: ticket1,
//     expiresAt: new Date()
//   });
//   await order1.save();

//   //Create 2 orders as user #2
//   const user2 = global.getMongooseId();
//   const order2 = Order.build({
//     userId: user2,
//     status: OrderStatus.Created,
//     ticket: ticket2,
//     expiresAt: new Date()
//   });
//   await order2.save();

//   const order3 = Order.build({
//     userId: user2,
//     status: OrderStatus.Created,
//     ticket: ticket3,
//     expiresAt: new Date()
//   });
//   await order3.save();    

//   //Make request to get orders for user #2
//   const response = await request(app)  
//     .get("/api/orders")
//     .set("Cookie",global.signin(user2))
//     .send()
//     .expect(200);

//   expect(response.body?.length).toEqual(2);
// });