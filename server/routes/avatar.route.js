import express from "express"
import { getAvatarAIResponse, processAvatarResume, saveAvatarInterview } from "../controllers/avatar.controller.js"
import { upload } from "../middlewares/multer.js"
import isAuth from "../middlewares/isAuth.js"

const avatarRouter = express.Router()


// Get AI avatar response for a candidate's spoken answer
avatarRouter.post("/ai-respond", getAvatarAIResponse)

// Parse uploaded resume and generate dynamic questions for avatar
avatarRouter.post("/upload-resume", upload.single("resume"), processAvatarResume)

// Save avatar interview to database
avatarRouter.post("/save-interview", isAuth, saveAvatarInterview)

export default avatarRouter
