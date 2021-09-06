import express, { Request, Response } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";
import { BadRequestError, validateRequest } from "@monroe-computer-technology/common";
import { User } from "../models/user";

const router = express.Router();

router.post("/api/users/signup", 
  [
    body("email")
      .isEmail()
      .withMessage("Email must be valid"),
    body("password")  
      .trim()
      .isLength({min:4, max:20})
      .withMessage("Password must be between 4 and 20 characters")
  ],
  validateRequest,
  async (req: Request, res: Response)=>{    
    const { email, password } = req.body;

    //check if user exists
    const existingUser = await User.findOne( {email:email} );
    if(existingUser) {
      throw new BadRequestError("Email in use");
    }
      
    //create a user 
    const user = User.build({email:email, password:password});

    //hash the password & save to db
    await user.save();

    //generate jwt

    const token = jwt.sign({
      id: user._id,
      email: user.email
    }, process.env.JWT_KEY!);

    req.session = {
      jwt: token
    };

    console.log("User added successfully", req.session.jwt);
    return res.status(201).send(user);
  }
);

export { router as signupRouter };