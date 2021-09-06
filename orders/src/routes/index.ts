import express, { Request, Response } from "express";
import { natsWrapper } from "../nats-wrapper";
import { Order } from "../models/order";

const router = express.Router();

router.get("/api/orders",
  async (req: Request,res: Response) => {
    const user = req.currentUser;

    const orders = await Order.find({userId: user!.id})
      .populate("ticket");

    res.status(200).send(orders);
  }
);

export {router as indexOrderRouter};