import express from "express";
import { submitContactForm, getStats } from "../controllers/contact.controller.js";

const contactRouter = express.Router();

contactRouter.get("/stats", getStats);
contactRouter.post("/", submitContactForm);

export default contactRouter;
