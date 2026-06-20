import { Router } from "express";
import { getPayment } from "../Controllers/Payment.Controller.js";

const paymentRouter = Router();

paymentRouter.get("/getPayment", getPayment);

export default paymentRouter;