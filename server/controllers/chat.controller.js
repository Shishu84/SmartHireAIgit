import Chat from "../models/chat.model.js";
import User from "../models/user.model.js";
import { askAi, askAiStream } from "../services/openRouter.service.js";

const SYSTEM_PROMPT = `You are SmartHireAI, a state-of-the-art Career Intelligence System. You act as a Personal Recruiter, Interview Coach, and Career Mentor. 

CORE MISSION:
Help the user achieve their dream career through data-driven guidance, persistent memory, and expert-level reasoning.

INTELLIGENT CAPABILITIES:
1. REASONING: Before answering, mentally analyze the user's intent, current skill level, and historical context.
2. ROADMAPS: When asked for career paths, generate structured, multi-phase roadmaps with specific technologies and milestones.
3. INTERVIEW COACHING: Conduct mock interviews by asking one focused question at a time and providing critical, high-quality feedback.
4. TECHNICAL TUTORING: Explain complex topics (DSA, System Design, AI) using analogies and clear code blocks.
5. CAREER WRITING: Generate high-impact resumes, cover letters, cold emails, and LinkedIn summaries tailored to the target role.

OUTPUT STYLE:
- Use professional, senior-level English.
- Use Markdown (headings, bold text, bullet points, code blocks) for maximum clarity.
- Be proactive: If a user asks for a skill, suggest the next logical step in their career roadmap.
- Be honest: Give critical feedback if a user's answer or resume is weak.

MEMORY & PERSONALIZATION:
You have access to the user's profile and historical interview performance. Use this to track improvements and personalize all advice. Never ask the user for information they have already provided or that is in their profile.`;

// ── Send a new message & get AI reply (STREAMING) ────────────────────────────
export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message is required." });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    const Interview = (await import("../models/interview.model.js")).default;
    const pastInterviews = await Interview.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(3)
      .select("role finalScore createdAt");

    let chat = await Chat.findOne({ userId: req.userId });
    if (!chat) {
      chat = await Chat.create({ userId: req.userId, messages: [] });
    }

    chat.messages.push({ role: "user", content: message.trim() });

    const profileContext = buildEnhancedContext(chat.profile, user, pastInterviews);
    const recentMessages = chat.messages.slice(-20);

    const aiMessages = [
      { role: "system", content: SYSTEM_PROMPT + profileContext },
      ...recentMessages.map((m) => ({ role: m.role, content: m.content })),
    ];

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let fullAiReply = "";
    
    fullAiReply = await askAiStream(aiMessages, (chunk) => {
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    });

    chat.messages.push({ role: "assistant", content: fullAiReply });
    await chat.save();

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    console.error("sendMessage error:", error);
    if (!res.headersSent) {
        return res.status(500).json({ message: `Failed to send message: ${error.message}` });
    }
    res.end();
  }
};

// ── Load chat history ────────────────────────────────────────────────────────
export const getChatHistory = async (req, res) => {
  try {
    let chat = await Chat.findOne({ userId: req.userId });
    if (!chat) {
        chat = await Chat.create({ userId: req.userId, messages: [] });
    }
    return res.status(200).json({
      messages: chat.messages,
      profile: chat.profile,
    });
  } catch (error) {
    return res.status(500).json({ message: `Failed to load history: ${error.message}` });
  }
};

// ── Clear chat history ───────────────────────────────────────────────────────
export const clearHistory = async (req, res) => {
  try {
    const chat = await Chat.findOne({ userId: req.userId });
    if (chat) {
      chat.messages = [];
      await chat.save();
    }
    return res.status(200).json({ message: "Chat history cleared." });
  } catch (error) {
    return res.status(500).json({ message: `Failed to clear history: ${error.message}` });
  }
};

// ── Update user profile context ──────────────────────────────────────────────
export const updateProfile = async (req, res) => {
  try {
    const { role, experience, skills, resumeSummary } = req.body;

    let chat = await Chat.findOne({ userId: req.userId });
    if (!chat) {
      chat = await Chat.create({ userId: req.userId, messages: [] });
    }

    if (role !== undefined) chat.profile.role = role;
    if (experience !== undefined) chat.profile.experience = experience;
    if (skills !== undefined) chat.profile.skills = skills;
    if (resumeSummary !== undefined) chat.profile.resumeSummary = resumeSummary;

    await chat.save();
    return res.status(200).json({ message: "Profile updated.", profile: chat.profile });
  } catch (error) {
    return res.status(500).json({ message: `Failed to update profile: ${error.message}` });
  }
};

// ── Helper: build an intelligent context string for the AI agent ──────────────
function buildEnhancedContext(profile, user, interviews) {
  const parts = [`\n\n--- AI KNOWLEDGE BASE: USER CONTEXT ---`];
  parts.push(`User Name: ${user.name}`);
  parts.push(`User Email: ${user.email}`);
  
  if (profile) {
    if (profile.role) parts.push(`Target Career Role: ${profile.role}`);
    if (profile.experience) parts.push(`Experience Level: ${profile.experience}`);
    if (profile.skills?.length) parts.push(`Known Skills: ${profile.skills.join(", ")}`);
    if (profile.resumeSummary) parts.push(`Resume Data: ${profile.resumeSummary}`);
  }

  if (interviews && interviews.length > 0) {
    parts.push(`Recent Interview Performance:`);
    interviews.forEach((inv, i) => {
      parts.push(`  ${i+1}. Role: ${inv.role} | Score: ${inv.finalScore}/10 | Date: ${new Date(inv.createdAt).toLocaleDateString()}`);
    });
    parts.push(`Note: If a score is low, offer targeted advice to improve those specific skills.`);
  }

  parts.push(`Current System Credits: ${user.credits}`);
  parts.push(`--- END OF CONTEXT ---`);

  return parts.join("\n");
}
