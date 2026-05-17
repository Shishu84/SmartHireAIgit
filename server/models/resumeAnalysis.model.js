import mongoose from "mongoose";

const resumeAnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  role: { type: String, required: true },
  experience: { type: String, default: "" },
  atsScore: { type: Number, required: true },
  summary: { type: String, default: "" },
  bestRole: { type: String, default: "" },
  skills: { type: [String], default: [] },
  strengths: { type: [String], default: [] },
  weakness: { type: [String], default: [] },
  suggestions: { type: [String], default: [] },
  experienceAnalysis: { type: String, default: "" },
  fileName: { type: String, default: "resume.pdf" }
}, { timestamps: true });

const ResumeAnalysis = mongoose.model("ResumeAnalysis", resumeAnalysisSchema);
export default ResumeAnalysis;
