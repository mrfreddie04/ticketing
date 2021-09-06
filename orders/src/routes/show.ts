import express, { Request, Response } from "express";
import mongoose from "mongoose";
import { natsWrapper } from "../nats-wrapper";
import { Order } from "../models/order";
import { NotFoundError, UnauthorizedRequestError, validateRequest } from "@monroe-computer-technology/common";
import { param } from 'express-validator';

const router = express.Router();

router.get("/api/orders/:orderId",
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

    res.status(200).send(order);
  }
);

export {router as showOrderRouter};