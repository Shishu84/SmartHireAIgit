import express from "express"
import http from "http"
import { Server } from "socket.io"
import dotenv from "dotenv"
import connectDb from "./config/connectDb.js"
import cookieParser from "cookie-parser"
dotenv.config()
import cors from "cors"
import authRouter from "./routes/auth.route.js"
import userRouter from "./routes/user.route.js"
import interviewRouter from "./routes/interview.route.js"
import paymentRouter from "./routes/payment.route.js"
import chatRouter from "./routes/chat.route.js"
import avatarRouter from "./routes/avatar.route.js"
import { registerAvatarSocket } from "./controllers/avatar.controller.js"

const app = express()
const server = http.createServer(app)

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174"
]

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
})

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}))

app.use(express.json())
app.use(cookieParser())

app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/interview", interviewRouter)
app.use("/api/payment", paymentRouter)
app.use("/api/chat", chatRouter)
app.use("/api/avatar", avatarRouter)

// Socket.IO real-time avatar interview namespace
const avatarNs = io.of("/avatar-interview")
registerAvatarSocket(avatarNs)

const PORT = process.env.PORT || 6000
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  connectDb()
})
