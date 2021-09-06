import express, { Request, Response } from "express";
import mongoose from "mongoose";
import { 
  NotFoundError, 
  UnauthorizedRequestError, 
  BadRequestError,
  validateRequest, 
  OrderCancelledEventData 
} from "@monroe-computer-technology/common";
import { param } from 'express-validator';
import { natsWrapper } from "../nats-wrapper";
import { Order, OrderStatus } from "../models/order";
import { OrderCancelledPublisher } from "../events/publishers/order-cancelled-publisher";

const router = express.Router();

router.delete("/api/orders/:orderId",
[
  param("orderId")
    .notEmpty()
    //mongoose.Types.ObjectId.isValid(input) - another way to check id
    .custom((input:string) => mongoose.isValidObjectId(input))
    .withMessage("OrderId must be provided")
],
validateRequest,  
async (req: Request,res: Response) => {
  const user = req.currentUser;
  const orderId  = req.params.orderId;

  const order = await Order.findById(orderId)
    .populate("ticket");

  if(!order)  {
    throw new NotFoundError();
  }

  if(order.userId !== user!.id) {
    throw new UnauthorizedRequestError();
  }

  if(order.status === OrderStatus.Complete) {
    throw new BadRequestError("Order already paid for");
  }

  order.set({
    status: OrderStatus.Cancelled
  });

  await order.save();

  //Publish order:created event    
  const orderCancelledEventData:  OrderCancelledEventData = {
    id: order.id,
    version: order.version,
    ticket: {
      id: order.ticket.id
    }
  };

  const publisher = new OrderCancelledPublisher(natsWrapper.client);
  await publisher.publish(orderCancelledEventData);  

  res.status(204).send(order);
}
);

export {router as deleteOrderRouter};