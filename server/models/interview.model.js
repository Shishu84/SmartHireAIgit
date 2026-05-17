import mongoose from "mongoose";

const questionsSchema = new mongoose.Schema({
  question: String,
  difficulty: String,
  timeLimit: Number,
  answer: String,
  feedback: String,
  score: { type: Number, default: 0 },
  confidence: { type: Number, default: 0 },
  communication: { type: Number, default: 0 },
  correctness: { type: Number, default: 0 },
})


const interviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  role: {
    type: String,
    required: true
  },
  experience: {
    type: String,
    required: true
  },
  mode: {
    type: String,
    enum: ["HR", "Technical"],
    required: true
  },
  resumeText: {
    type: String
  },
  questions: [questionsSchema],

  finalScore: { type: Number, default: 0 },

  status: {
    type: String,
    enum: ["Incompleted", "completed"],
    default: "Incompleted",
  },
  aiRecommendation: {
    type: String,
    enum: ["Selected", "Improvement Needed"],
    default: "Improvement Needed"
  },
  codingScore: { type: Number, default: 0 },
  aiFeedback: {
    overallFeedback: { type: String, default: "" },
    technicalFeedback: { type: String, default: "" },
    behavioralFeedback: { type: String, default: "" },
    strengths: { type: [String], default: [] },
    improvements: { type: [String], default: [] },
    suggestions: [
      {
        text: { type: String, required: true },
        completed: { type: Boolean, default: false }
      }
    ]
  }
}, { timestamps: true })

const Interview = mongoose.model("Interview", interviewSchema)


export default Interview