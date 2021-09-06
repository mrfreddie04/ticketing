import express, { Request, Response } from "express";
import { NotFoundError } from "@monroe-computer-technology/common";
import { Ticket } from "../models/ticket";

const router = express.Router();

// router.get("/api/tickets/:id", async (req: Request, res: Response)=>{
//   const ticId = req.params.id;
//   let ticket; 

//   try {
//     ticket = await Ticket.findById(ticId);
//     if(ticket) {
//       return res.send(ticket);
//     }
//   } catch(e) {
//   }
  
//   throw new NotFoundError();
// });

router.get('/api/tickets/:id', async (req: Request, res: Response) => {
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    throw new NotFoundError();
  }

  res.send(ticket);
});

export { router as showTicketRouter };  