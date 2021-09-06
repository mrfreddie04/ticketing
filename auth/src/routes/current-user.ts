import express from "express";
import { currentUser } from "@monroe-computer-technology/common";

const router = express.Router();

router.get("/api/users/currentuser", 
  currentUser,
  (req,res)=>{
    console.log("Current User:", req.currentUser?.id);
    return res.status(201).send({currentUser: req.currentUser || null});
  }
);

export { router as currentUserRouter };