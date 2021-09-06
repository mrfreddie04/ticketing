import express from "express";
import "express-async-errors";
import cookieSession from "cookie-session";
import { json } from "body-parser";
import { errorHandler, NotFoundError, currentUser, requireAuth  } from "@monroe-computer-technology/common";

import { newOrderRouter } from "./routes/new";
import { showOrderRouter } from "./routes/show";
import { indexOrderRouter } from "./routes/index";
import { deleteOrderRouter } from "./routes/delete";

const app = express();

app.set("trust proxy", true);

app.use(json());

app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== "test"
  })
);
//after cookie-seccion - it has to set req.session, which is examined by currentUser
app.use(currentUser);
app.use(requireAuth);

app.use(newOrderRouter);
app.use(showOrderRouter);
app.use(indexOrderRouter);
app.use(deleteOrderRouter);

app.all("*", async () => {
  throw new NotFoundError(); 
  //next(new NotFoundError());
});

app.use(errorHandler);

export { app };