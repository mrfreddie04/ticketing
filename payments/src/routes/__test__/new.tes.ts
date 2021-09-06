import request from "supertest"; //lest us make fake requests to express app
import { app } from "../../app";
import { Order } from "../../models/order";
import { OrderStatus } from "@monroe-computer-technology/common";
import { stripe } from "../../stripe";

jest.mock("../../stripe");

it("returns a 404 if order does not exist", async () => {
  const userId = global.getMongooseId(); 
  const user = global.signin(userId); 

  const orderId = global.getMongooseId();

  return request(app)  
    .post("/api/payments")
    .set("Cookie",user)
    .send({
      token: "123",
      orderId: orderId
    })
    .expect(404);
});

it("returns a 401 if order doesn't belong to the user", async () => {
  const orderId = global.getMongooseId();
  const orderOwnerId = global.getMongooseId();

  const order = Order.build({
    id: orderId,
    userId: orderOwnerId,
    status: OrderStatus.Created,
    price: 100,
    version: 0
  });

  await order.save();

  const userId = global.getMongooseId(); 
  const user = global.signin(userId); 

  return request(app)  
    .post("/api/payments")
    .set("Cookie",user)
    .send({
      token: "123",
      orderId: orderId
    })
    .expect(401);
});

it("returns a 400 if order is cancelled", async () => {
  const orderId = global.getMongooseId();
  const orderOwnerId = global.getMongooseId();

  const order = Order.build({
    id: orderId,
    userId: orderOwnerId,
    status: OrderStatus.Cancelled,
    price: 100,
    version: 1
  });

  await order.save();

  const user = global.signin(orderOwnerId); 

  return request(app)  
    .post("/api/payments")
    .set("Cookie",user)
    .send({
      token: "123",
      orderId: orderId
    })
    .expect(400);
});

it("returns a 201 with valid inputs", async () => {
  const orderId = global.getMongooseId();
  const orderOwnerId = global.getMongooseId();
  const token: string = "tok_visa";
  const price: number = 100;

  const order = Order.build({
    id: orderId,
    userId: orderOwnerId,
    status: OrderStatus.Created,
    price: price,
    version: 0
  });

  await order.save();

  const user = global.signin(orderOwnerId); 

  await request(app)  
    .post("/api/payments")
    .set("Cookie",user)
    .send({
      token: token,
      orderId: orderId
    })
    .expect(201);

  expect(stripe.charges.create as jest.Mock).toHaveBeenCalled();  
  const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];

  expect(chargeOptions.currency).toEqual("usd");  
  expect(chargeOptions.amount).toEqual(price * 100); 
  expect(chargeOptions.source).toEqual(token); 
});

