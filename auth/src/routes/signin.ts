import express, { Request, Response } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";
import { BadRequestError, validateRequest  } from "@monroe-computer-technology/common";
import { User } from "../models/user";
import { Password } from "../services/password";

const router = express.Router();

router.post("/api/users/signin", 
  [
    body("email")
      .isEmail()
      .withMessage("Email must be valid"),
    body("password")  
      .trim()
      .notEmpty()
      .withMessage("Password must be provided")
  ],
  validateRequest,
  async (req: Request, res: Response)=>{
    const { email, password } = req.body;

    //check if user exists
    const user = await User.findOne( {email:email} );
    if(!user) {
      throw new BadRequestError("Invalid credentials");
    }
     
    const passwordsMatch = await Password.compare(user.password, password);
    if(!passwordsMatch) {
      throw new BadRequestError("Invalid credentials");
    }

    //generate jwt
    const token = jwt.sign({
      id: user._id,
      email: user.email
    }, process.env.JWT_KEY!);

    req.session = {
      jwt: token
    };

    console.log("User signed in successfully", req.session.jwt);
    // return res.status(201).send(user);
    return res.status(200).send(user);
  }
);

export { router as signinRouter };