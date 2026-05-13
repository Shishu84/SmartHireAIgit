import express from "express"
import { translateEndpoint, aiAvatarRespond } from "../controllers/avatar.controller.js"

const avatarRouter = express.Router()

// Translate text between Hindi and English
avatarRouter.post("/translate", translateEndpoint)

// Get AI avatar response for a candidate's spoken answer
avatarRouter.post("/ai-respond", aiAvatarRespond)

export default avatarRouter
