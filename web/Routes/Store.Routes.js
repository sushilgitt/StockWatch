import { Router } from "express";
import { getShop } from "../Controllers/Store.Controller.js";

export const storeRouter = Router();

storeRouter.get("/get-store", getShop);