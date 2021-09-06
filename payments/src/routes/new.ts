import express, { Request, Response } from "express";
import { 
  validateRequest, 
  NotFoundError, 
  BadRequestError, 
  UnauthorizedRequestError,
  OrderStatus 
} from "@monroe-computer-technology/common";
import { body } from "express-validator";
import mongoose from "mongoose";
import { Order } from "../models/order";
import { Payment } from "../models/payment";
import { stripe } from "../stripe";
import { PaymentCreatedPublisher } from "../events/publishers/payment-created-publisher";
import { natsWrapper }  from "../nats-wrapper";
//import Stripe from "stripe";


const router = express.Router();

router.post("/api/payments", 
  [
    body("orderId")
      .notEmpty()
      //mongoose.Types.ObjectId.isValid(input) - another way to check id
      .custom((input:string) => mongoose.isValidObjectId(input))
      .withMessage("OrderId must be provided"),
    body("token")
      .notEmpty()
      .withMessage("Token must be provided")
  ],
  validateRequest,  
  async (req: Request,res: Response) => {
    const { token, orderId } = req.body;

    const order = await Order.findById(orderId);

    if(!order) {
      throw new NotFoundError();
    }   

    if(order.userId !== req.currentUser!.id) {
      throw new UnauthorizedRequestError();
    }       

    if(order.status === OrderStatus.Cancelled) {
      throw new BadRequestError("Cannot pay for a cancelled order");
    }

    const charge = await stripe.charges.create({
      currency: 'usd',
      amount: order.price * 100,
      source: token,
    });

    const payment = Payment.build({
      orderId: order.id,
      stripeId: charge.id
    });

    await payment.save();

    const publisher = new PaymentCreatedPublisher(natsWrapper.client);
    await publisher.publish({
      id: payment.id,
      orderId: payment.orderId,
      stripeId: payment.stripeId
    });

    res.status(201).send({ id: payment.id, stripeId: payment.stripeId });
  }
);    

export {router as createChargeRouter};