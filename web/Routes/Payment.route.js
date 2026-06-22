import { Router } from "express";
import { getPayment, createSubscription } from "../Controllers/Payment.Controller.js";

const paymentRouter = Router();

paymentRouter.get("/getPayment", getPayment);
paymentRouter.post("/createSubscription", createSubscription);

export default paymentRouter;