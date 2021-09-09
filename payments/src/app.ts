import express from "express";
import "express-async-errors";
import cookieSession from "cookie-session";
import { json } from "body-parser";
import { errorHandler, NotFoundError, currentUser, requireAuth  } from "@monroe-computer-technology/common";

import { createChargeRouter } from "./routes/new";
// import { showTicketRouter } from "./routes/show";
// import { indexTicketRouter } from "./routes/index";
// import { updateTicketRouter } from "./routes/update";

const app = express();

app.set("trust proxy", true);

app.use(json());

app.use(
  cookieSession({
    signed: false,
    secure: false //process.env.NODE_ENV !== "test"
  })
);
//after cookie-seccion - it has to set req.session, which is examined by currentUser
app.use(currentUser);
app.use(requireAuth);

app.use(createChargeRouter);
// app.use(showTicketRouter);
// app.use(indexTicketRouter);
// app.use(updateTicketRouter);

app.all("*", async () => {
  throw new NotFoundError(); 
  //next(new NotFoundError());
});

app.use(errorHandler);

export { app };