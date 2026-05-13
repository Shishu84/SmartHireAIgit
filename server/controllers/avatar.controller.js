import axios from "axios"
import { askAi } from "../services/openRouter.service.js"

// ─── Google Translate (free/unofficial endpoint) ─────────────────────────────
async function translateText(text, targetLang) {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
    const response = await axios.get(url)
    const translated = response.data[0].map(item => item[0]).join("")
    return translated || text
  } catch (err) {
    console.error("Translation error:", err.message)
    return text // fallback: return original
  }
}

// ─── HTTP Routes ──────────────────────────────────────────────────────────────

/**
 * POST /api/avatar/translate
 * Body: { text, targetLang }
 */
export const translateEndpoint = async (req, res) => {
  try {
    const { text, targetLang } = req.body
    if (!text || !targetLang) {
      return res.status(400).json({ message: "text and targetLang are required" })
    }
    const translated = await translateText(text, targetLang)
    return res.json({ translated })
  } catch (err) {
    return res.status(500).json({ message: "Translation failed" })
  }
}

/**
 * POST /api/avatar/ai-respond
 * Body: { transcript, role, experience, questionContext, language }
 * Asks AI to respond to candidate's spoken answer, returns reply in target language
 */
export const aiAvatarRespond = async (req, res) => {
  try {
    const { transcript, role, experience, questionContext, language = "en" } = req.body

    if (!transcript) {
      return res.status(400).json({ message: "transcript is required" })
    }

    const langLabel = language === "hi" ? "Hindi" : "English"

    const messages = [
      {
        role: "system",
        content: `You are a professional AI interviewer conducting a ${role} interview for a candidate with ${experience} experience.
Respond to the candidate's answer with brief, encouraging, and professional feedback in 1-2 sentences.
Always respond in ${langLabel}.
Keep the tone warm but professional. Do not re-state the question.`
      },
      {
        role: "user",
        content: `Candidate answered: "${transcript}"\nContext: ${questionContext || "General interview question"}`
      }
    ]

    const aiReply = await askAi(messages)

    // If user selected Hindi but AI might reply in English, translate
    let finalReply = aiReply
    if (language === "hi") {
      finalReply = await translateText(aiReply, "hi")
    }

    return res.json({ reply: finalReply })
  } catch (err) {
    return res.status(500).json({ message: "AI avatar response failed" })
  }
}

// ─── Socket.IO Real-Time Avatar Interview ─────────────────────────────────────
export function registerAvatarSocket(namespace) {
  namespace.on("connection", (socket) => {
    console.log(`[Avatar Socket] Client connected: ${socket.id}`)

    // Client sends a transcribed answer and language preference
    socket.on("candidate:answer", async ({ transcript, language, questionContext, role, experience }) => {
      if (!transcript?.trim()) return

      try {
        const langLabel = language === "hi" ? "Hindi" : "English"

        // Step 1: If candidate spoke in Hindi, translate to English for AI processing
        let processedTranscript = transcript
        if (language === "hi") {
          processedTranscript = await translateText(transcript, "en")
          socket.emit("avatar:translated_transcript", { english: processedTranscript })
        }

        // Step 2: Generate AI feedback
        const messages = [
          {
            role: "system",
            content: `You are a professional AI interviewer conducting a ${role || "Software Engineer"} interview for a candidate with ${experience || "2 years"} experience.
Give brief, constructive feedback on the candidate's answer in 1-2 sentences.
Always respond in ${langLabel}.
Be warm, professional, and specific. Do not repeat the question.`
          },
          {
            role: "user",
            content: `Candidate answered: "${processedTranscript}"\nContext: ${questionContext || "General interview"}`
          }
        ]

        // Stream the response back to client
        socket.emit("avatar:speaking_start")

        const aiReply = await askAi(messages)

        // Step 3: Translate AI reply to Hindi if needed
        let finalReply = aiReply
        if (language === "hi") {
          finalReply = await translateText(aiReply, "hi")
        }

        socket.emit("avatar:reply", { text: finalReply, language })
        socket.emit("avatar:speaking_end")

      } catch (err) {
        console.error("[Avatar Socket] Error:", err.message)
        socket.emit("avatar:error", { message: "AI response failed. Please try again." })
      }
    })

    // Client sends a question to be spoken (for multilingual question delivery)
    socket.on("avatar:speak_question", async ({ question, language }) => {
      try {
        let finalQuestion = question
        if (language === "hi") {
          finalQuestion = await translateText(question, "hi")
        }
        socket.emit("avatar:question_ready", { text: finalQuestion, language })
      } catch (err) {
        socket.emit("avatar:question_ready", { text: question, language: "en" })
      }
    })

    socket.on("disconnect", () => {
      console.log(`[Avatar Socket] Client disconnected: ${socket.id}`)
    })
  })
}
