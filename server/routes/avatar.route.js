import express from "express"
import { translateAvatarText, getAvatarAIResponse, processAvatarResume } from "../controllers/avatar.controller.js"
import { upload } from "../middlewares/multer.js"

const avatarRouter = express.Router()

// Translate text between Hindi and English
avatarRouter.post("/translate", translateAvatarText)

// Get AI avatar response for a candidate's spoken answer
avatarRouter.post("/ai-respond", getAvatarAIResponse)

// Parse uploaded resume and generate dynamic questions for avatar
avatarRouter.post("/upload-resume", upload.single("resume"), processAvatarResume)

export default avatarRouter
