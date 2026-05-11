import express from "express";
import { sendMessage, getChatHistory, clearHistory, updateProfile } from "../controllers/chat.controller.js";
import isAuth from "../middlewares/isAuth.js";

const chatRouter = express.Router();

chatRouter.use(isAuth); 

chatRouter.post("/send", sendMessage);
chatRouter.get("/history", getChatHistory);
chatRouter.delete("/clear", clearHistory);
chatRouter.post("/profile", updateProfile);

export default chatRouter;
