import { Router } from "express";
import { createOrUpdateThreshold, getThreshold } from "../Controllers/Threshold.Controller.js";

export const thresholdRouter = Router();

thresholdRouter.post("/create-update-threshold", createOrUpdateThreshold);
thresholdRouter.get('/thresholds/:storeId', getThreshold);