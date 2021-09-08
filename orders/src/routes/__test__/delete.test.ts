import request from "supertest"; //lest us make fake requests to express app
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { Order, OrderStatus } from "../../models/order";
import { natsWrapper } from "../../nats-wrapper";

const buildTicket = async () => {
  const ticket = Ticket.build({
    id: global.getMongooseId(),
    title: "Test Ticket",
    price: 1000
  });
  await ticket.save();
  return ticket;
}

it("marks an order as cancelled", async () => {
  //Create ticket
  const ticket = await buildTicket();

  //Create a user
  const user = global.signin();

  //Create an order 
  const {body: order} = await request(app)
    .post("/api/orders")
    .set("Cookie",user)
    .send({ticketId: ticket.id})
    .expect(201);

  //Make request to cancel this order
  await request(app)  
    .delete(`/api/orders/${order.id}`)
    .set("Cookie",user)
    .send()
    .expect(204);

  const fetchedOrder = await Order.findById(order.id);
  //console.log("Orders", orders);
  expect(fetchedOrder?.id).toEqual(order.id);
  expect(fetchedOrder?.status).toEqual(OrderStatus.Cancelled);
});

it("emits an order cancelled event", async () => {
  //1) Arrange
  //Create ticket
  const ticket = await buildTicket();

  //Create a user
  const user = global.signin();

  //Create an order 
  const {body: order} = await request(app)
    .post("/api/orders")
    .set("Cookie",user)
    .send({ticketId: ticket.id})
    .expect(201);

  //2) Act
  //Make request to cancel this order
  await request(app)  
    .delete(`/api/orders/${order.id}`)
    .set("Cookie",user)
    .send()
    .expect(204);

  //3) Assert  
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});