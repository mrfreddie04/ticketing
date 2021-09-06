import request from "supertest"; //lest us make fake requests to express app
import { app } from "../../app";
import { Order } from "../../models/order";
import { Payment } from "../../models/payment";
import { OrderStatus } from "@monroe-computer-technology/common";
import { stripe } from "../../stripe";

it("returns a 201 with valid inputs", async () => {
  const orderId = global.getMongooseId();
  const orderOwnerId = global.getMongooseId();
  const token: string = "tok_visa";
  const price: number = Math.ceil(Math.random()*10000);

  //1) ARRANGE - create & save order
  const order = Order.build({
    id: orderId,
    userId: orderOwnerId,
    status: OrderStatus.Created,
    price: price,
    version: 0
  });

  await order.save();

  //2) ACT - Post payment request
  const user = global.signin(orderOwnerId); 
  await request(app)  
    .post("/api/payments")
    .set("Cookie",user)
    .send({
      token: token,
      orderId: orderId
    })
    .expect(201);
  
  //3) ASSERT - examine stripe charges & try to find charge by amount - we are using random amounts to make them differ
  const response = await stripe.charges.list({
     limit: 10
    });

  const charges = response.data;
  const stripeCharge = charges.find( charge => charge.amount === price * 100); 
  
  expect(stripeCharge).toBeDefined();
  expect(stripeCharge!.amount).toEqual(price * 100);
  expect(stripeCharge!.currency).toEqual("usd");  

  const payment = await Payment.findOne({orderId: orderId, stripeId: stripeCharge!.id});
  expect(payment).not.toBeNull();
  //expect(payment!.stripeId).toEqual(stripeCharge!.id);

});
