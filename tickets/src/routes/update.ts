import express, { Request, Response } from "express";
import { body } from "express-validator";
import { 
  requireAuth, 
  validateRequest, 
  NotFoundError, 
  UnauthorizedRequestError, 
  BadRequestError
} from "@monroe-computer-technology/common";
import { Ticket } from "../models/ticket";
import { natsWrapper } from "../nats-wrapper";
import { TicketUpdatedPublisher } from "../events/publishers/ticket-updated-publisher";

const router = express.Router();

router.put("/api/tickets/:id", 
  requireAuth,
  [
    body("title")
      .notEmpty()
      .withMessage("Title must be provided"),
    body("price")
      .notEmpty()
      .isDecimal()
      .isFloat({gt: 0})
      .withMessage("Price must be greater than 0")
  ],
  validateRequest,
  async (req: Request, res: Response)=>{
    const userId = req.currentUser!.id;

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      throw new NotFoundError();
    }

    if(ticket.userId !== userId) {
      throw new UnauthorizedRequestError();
    }

    if(ticket.orderId) {
      throw new BadRequestError("Cannot edit a reserved ticket");
    }    

    const { title, price } = req.body;
    ticket.set({
      title:title,
      price:price
    });

    await ticket.save();

    const stan = natsWrapper.client;
    const publisher: Promise<void> = new TicketUpdatedPublisher(stan).publish({
      id: ticket.id!,
      version: ticket.version,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId
    });    

    //console.log("Ticket updated successfully");

    return res.status(200).send(ticket);
    //return res.sendStatus(201);
  }
);

export { router as updateTicketRouter };