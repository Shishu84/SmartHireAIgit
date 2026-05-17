import express from "express"
import isAuth from "../middlewares/isAuth.js"
import { getCurrentUser, updateProfile } from "../controllers/user.controller.js"


const userRouter = express.Router()

userRouter.get("/current-user",isAuth,getCurrentUser)
userRouter.put("/update-profile", isAuth, updateProfile)

export default userRouter