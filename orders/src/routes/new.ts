import express, { Request, Response } from "express";
import mongoose from "mongoose";
import { validateRequest, NotFoundError, BadRequestError, OrderCreatedEventData } from "@monroe-computer-technology/common";
import { body } from "express-validator";
import { natsWrapper } from "../nats-wrapper";
import { Ticket } from "../models/ticket";
import { Order, OrderStatus } from "../models/order";
import { OrderCreatedPublisher } from "../events/publishers/order-created-publisher";

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 15 * 60;

router.post("/api/orders/",
  [
    body("ticketId")
      .notEmpty()
      //mongoose.Types.ObjectId.isValid(input) - another way to check id
      .custom((input:string) => mongoose.isValidObjectId(input))
      .withMessage("TicketId must be provided")
  ],
  validateRequest,  
  async (req: Request,res: Response) => {
    const { ticketId } = req.body;
    const user =  req.currentUser;

    //Find the ticket (in the db) the user is trying to purchase
    const ticket = await Ticket.findById(ticketId);
    if(!ticket) {
      throw new NotFoundError();
    }
    
    //Make sure the ticket is not already reserved
    const isReserved = await ticket.isReserved();
    if(isReserved) {
      throw new BadRequestError("Ticket is already reserved/sold");
    }

    //Calculate expiration date
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);
    
    //Create order
    const order = Order.build({
      userId: user!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket: ticket
    });

    await order.save();

    //Publish order:created event    
    const orderCreatedEventData:  OrderCreatedEventData = {
      id: order.id,
      version: order.version,
      status: order.status,
      expiresAt: order.expiresAt.toISOString(),
      userId: order.userId,
      ticket: {
        id: ticket.id,
        price: ticket.price
      }
    };

    const publisher = new OrderCreatedPublisher(natsWrapper.client);
    await publisher.publish(orderCreatedEventData);
    // await new OrderCreatedPublisher(client).publish();

    res.status(201).send(order);
  }
);

export {router as newOrderRouter};