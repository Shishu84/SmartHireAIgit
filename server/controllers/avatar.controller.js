import axios from "axios"
import fs from "fs"
import path from "path"
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import mammoth from "mammoth";
import WordExtractor from "word-extractor";
import Tesseract from "tesseract.js";
import Jimp from "jimp";
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
 * Body: { text: "...", language: "hi" }
 */
export const translateAvatarText = async (req, res) => {
  try {
    const { text, language } = req.body
    if (!text || !language) return res.status(400).json({ message: "Text and language required" })

    // If English to English, just return
    if (language === 'en') return res.status(200).json({ translated: text })

    const translatedText = await translateText(text, language)
    return res.status(200).json({ translated: translatedText })
  } catch (error) {
    return res.status(500).json({ message: "Translation failed" })
  }
}

/**
 * POST /api/avatar/ai-respond
 * Body: { transcript, language, questionContext, role, experience }
 */
export const getAvatarAIResponse = async (req, res) => {
  try {
    const { transcript, language, questionContext, role, experience } = req.body

    // 1. If Hindi, translate candidate's answer to English for AI
    let englishTranscript = transcript
    if (language === 'hi') {
      englishTranscript = await translateText(transcript, 'en')
    }

    const messages = [
      {
        role: "system",
        content: `You are an expert AI Technical Recruiter conducting an interview for a ${role} with ${experience} experience.
The candidate was just asked: "${questionContext}".
Here is their answer: "${englishTranscript}".

Your goal:
1. Provide very brief, human-like feedback on their answer.
2. Ensure your response is professional and encouraging.
3. Keep it under 2 sentences. Do not ask a follow-up question.`
      }
    ]

    const aiResponse = await askAi(messages)
    let finalResponse = aiResponse

    // 2. If interview is in Hindi, translate AI response to Hindi
    if (language === 'hi') {
      finalResponse = await translateText(finalResponse, 'hi')
    }

    return res.status(200).json({ response: finalResponse })

  } catch (error) {
    console.error("Avatar AI Error:", error)
    return res.status(500).json({ message: "AI avatar response failed" })
  }
}

/**
 * POST /api/avatar/upload-resume
 * Form-data: { resume: File }
 * Parses the resume and generates 5 personalized interview questions for the AI avatar.
 */
export const processAvatarResume = async (req, res) => {
  const filepath = req.file?.path
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Resume required" })
    }

    const fileExt = path.extname(req.file.originalname).toLowerCase()
    let resumeText = ""

    if (fileExt === '.pdf') {
      try {
        const fileBuffer = await fs.promises.readFile(filepath)
        const uint8Array = new Uint8Array(fileBuffer)
        const pdf = await pdfjsLib.getDocument({ data: uint8Array, verbosity: 0 }).promise
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum)
          const textContent = await page.getTextContent()
          resumeText += textContent.items.map(item => item.str).join(" ") + "\n"
        }
        await pdf.destroy()
        
        // Validation for scanned PDFs
        if (resumeText.trim().length < 50) {
            console.warn("PDF appears to be scanned or image-based.");
            if (filepath) fs.unlink(filepath, () => {})
            return res.status(400).json({ message: "Scanned PDF detected without a text layer. Please upload a standard text PDF, DOCX, or Image (JPG/PNG)." })
        }
      } catch (err) {
        console.error("PDF Parsing Error:", err)
      }
    } else if (fileExt === '.docx') {
      try {
        const result = await mammoth.extractRawText({ path: filepath })
        resumeText = result.value
      } catch (err) {
        console.error("DOCX Parsing Error:", err)
      }
    } else if (fileExt === '.doc') {
      try {
        const extractor = new WordExtractor()
        const extracted = await extractor.extract(filepath)
        resumeText = extracted.getBody()
      } catch (err) {
        console.error("DOC Parsing Error:", err)
      }
    } else if (['.png', '.jpg', '.jpeg'].includes(fileExt)) {
      try {
        console.log("Running direct image OCR with pre-processing...");
        
        // Image Preprocessing with Jimp
        const image = await Jimp.read(filepath);
        const processedPath = filepath + "_processed.png";
        
        await image
            .greyscale()
            .contrast(1)
            .normalize()
            .writeAsync(processedPath);

        const { data: { text } } = await Tesseract.recognize(processedPath, 'eng', { logger: () => {} });
        resumeText = (text || "").replace(/\s+/g, " ").trim();
        
        // Clean up processed image
        fs.unlink(processedPath, () => {});
      } catch (err) {
          console.error("OCR Error:", err);
      }
    } else {
      if (filepath) fs.unlink(filepath, () => {})
      return res.status(400).json({ message: "Unsupported file type. Use PDF, DOC/DOCX, JPG, or PNG." })
    }

    if (!resumeText || !resumeText.trim()) {
      if (filepath) fs.unlink(filepath, () => {})
      return res.status(400).json({ message: "Could not extract text. The file might be corrupted, password protected, or completely blank." })
    }

    // Clean up file
    fs.unlink(filepath, () => {})

    // Generate personalized context & questions
    const messages = [
      {
        role: "system",
        content: `You are an expert AI Technical Recruiter. Based on the candidate's extracted resume text, you must output a structured JSON response EXACTLY matching this schema, without markdown formatting or other text:
{
  "role": "Inferred primary job role (e.g. Frontend Developer)",
  "experience": "Inferred experience level (e.g. 3 years, Fresher)",
  "skills": ["Skill1", "Skill2", "Skill3"],
  "questions": [
    "Question 1 (Technical based on skills)",
    "Question 2 (Project based on their projects)",
    "Question 3 (Experience oriented)",
    "Question 4 (Domain specific problem solving)",
    "Question 5 (Behavioral/Leadership)"
  ]
}`
      },
      {
        role: "user",
        content: `Resume Text:\n${resumeText.substring(0, 4000)}` // Limit to ~4000 chars to save tokens
      }
    ]

    const aiResponse = await askAi(messages)
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error("AI did not return valid JSON")
    
    const parsedData = JSON.parse(jsonMatch[0])

    return res.status(200).json({ success: true, data: parsedData })

  } catch (error) {
    console.error("Avatar Resume Processing Error:", error)
    if (filepath) fs.unlink(filepath, () => {})
    return res.status(500).json({ message: `Failed to process resume: ${error.message}` })
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
