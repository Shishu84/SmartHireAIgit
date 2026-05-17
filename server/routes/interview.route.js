import express from "express"
import isAuth from "../middlewares/isAuth.js"
import { upload } from "../middlewares/multer.js"
import { analyzeResume, finishInterview, generateQuestion, getInterviewReport, getMyInterviews, submitAnswer, getMyResumes, getResumeReport, toggleSuggestion } from "../controllers/interview.controller.js"




const interviewRouter = express.Router()

interviewRouter.post("/resume", isAuth, upload.single("resume"), analyzeResume)
interviewRouter.post("/generate-questions",isAuth,generateQuestion)
interviewRouter.post("/submit-answer",isAuth,submitAnswer)
interviewRouter.post("/finish",isAuth,finishInterview)

interviewRouter.get("/get-interview",isAuth,getMyInterviews)
interviewRouter.get("/report/:id",isAuth,getInterviewReport)
interviewRouter.patch("/:id/suggestion", isAuth, toggleSuggestion)

interviewRouter.get("/resume/history", isAuth, getMyResumes)
interviewRouter.get("/resume/report/:id", isAuth, getResumeReport)

export default interviewRouter