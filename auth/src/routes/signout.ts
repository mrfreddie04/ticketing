import express from "express";

const router = express.Router();

router.post("/api/users/signout", (req,res)=>{
  req.session = null;

  console.log("User signed out successfully");
  res.status(204).send({});
});

export { router as signoutRouter };