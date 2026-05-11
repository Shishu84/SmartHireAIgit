import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant", "system"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one persistent chat thread per user
    },
    // Stored profile/resume context for personalisation
    profile: {
      role: { type: String, default: "" },
      experience: { type: String, default: "" },
      skills: { type: [String], default: [] },
      resumeSummary: { type: String, default: "" },
    },
    messages: [messageSchema],
  },
  { timestamps: true }
);

const Chat = mongoose.models.Chat || mongoose.model("Chat", chatSchema);
export default Chat;
