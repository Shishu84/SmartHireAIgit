import axios from "axios"
import fs from "fs"
import path from "path"
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import mammoth from "mammoth";
import WordExtractor from "word-extractor";
import Tesseract from "tesseract.js";
import { Jimp } from "jimp";
import { askAi } from "../services/openRouter.service.js"
import Interview from "../models/interview.model.js"

// ─── HTTP Routes ──────────────────────────────────────────────────────────────

/**
 * POST /api/avatar/ai-respond
 * Body: { transcript, questionContext, role, experience }
 */
export const getAvatarAIResponse = async (req, res) => {
  try {
    const { transcript, questionContext, role, experience } = req.body

    const messages = [
      {
        role: "system",
        content: `You are an expert AI Technical Recruiter conducting an interview for a ${role} with ${experience} experience.
The candidate was just asked: "${questionContext}".
Here is their answer: "${transcript}".

Your goal:
1. Provide very brief, human-like feedback on their answer.
2. Ensure your response is professional and encouraging.
3. Keep it under 2 sentences. Do not ask a follow-up question.`
      }
    ]

    const aiResponse = await askAi(messages)
    return res.status(200).json({ response: aiResponse })

  } catch (error) {
    console.error("Avatar AI Error:", error)
    return res.status(500).json({ message: "AI avatar response failed" })
  }
}

/**
 * POST /api/avatar/save-interview
 * Body: { qaHistory, role, experience }
 */
export const saveAvatarInterview = async (req, res) => {
  try {
    const { qaHistory, role, experience } = req.body
    if (!qaHistory || qaHistory.length === 0) {
      return res.status(400).json({ message: "Interview data is empty" })
    }

    const chatTranscript = qaHistory.map((q, i) => `Q${i+1}: ${q.question}\nAnswer: ${q.answer || "No answer submitted."}\nAI Quick Reply: ${q.feedback}`).join("\n\n");

    const aiMessages = [
      {
        role: "system",
        content: `You are an expert technical interviewer and career coach. Evaluate the candidate's interview performance based on their transcript.
CRITICAL INSTRUCTIONS:
1. Analyze each answer independently.
2. Generate unique and realistic scores based strictly on answer quality.
3. Calculate confidence, communication, and correctness dynamically for each individual answer.
4. Avoid repeated or static values; vary the scores logically depending on how well each question was answered (0-10).
5. If an answer is missing or very poor, give low scores (0-4).

Return ONLY a valid raw JSON object exactly matching this structure (no markdown wrappers, no extra text):
{
  "questions": [
    {
      "score": number,
      "confidence": number,
      "communication": number,
      "correctness": number
    }
  ],
  "aiFeedback": {
    "overallFeedback": "2-3 sentences summarizing general performance",
    "technicalFeedback": "2 sentences focusing on technical precision",
    "behavioralFeedback": "2 sentences focusing on communication clarity and confidence",
    "strengths": ["...", "...", "..."],
    "improvements": ["...", "...", "..."],
    "suggestions": ["...", "...", "..."]
  }
}
The 'questions' array must have exactly ${qaHistory.length} items, one for each question in order. Each score must be an integer from 0 to 10.`
      },
      {
        role: "user",
        content: `Here is the interview transcript:\n\n${chatTranscript}`
      }
    ];

    let parsedAi = null;
    try {
      const aiResponse = await askAi(aiMessages);
      let cleaned = (aiResponse || "").trim();
      const blockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (blockMatch) cleaned = blockMatch[1];
      const objMatch = cleaned.match(/\{[\s\S]*\}/);
      if (objMatch) cleaned = objMatch[0];
      cleaned = cleaned.replace(/,\s*([\}\]])/g, '$1');
      parsedAi = JSON.parse(cleaned);
    } catch (err) {
      console.error("Failed to parse AI evaluation:", err);
    }

    let totalScore = 0;
    const questions = qaHistory.map((qa, index) => {
        const qEval = parsedAi?.questions?.[index] || { score: 5, confidence: 5, communication: 5, correctness: 5 };
        totalScore += qEval.score || 0;
        return {
            question: qa.question,
            answer: qa.answer,
            feedback: qa.feedback || "",
            score: qEval.score || 0,
            confidence: qEval.confidence || 0,
            communication: qEval.communication || 0,
            correctness: qEval.correctness || 0,
            difficulty: "medium",
            timeLimit: 60
        };
    });

    const finalScore = questions.length > 0 ? (totalScore / questions.length) : 0;

    let aiFeedback = {
        overallFeedback: "The candidate completed the interview.",
        technicalFeedback: "Technical skills were demonstrated.",
        behavioralFeedback: "Professional conduct was observed.",
        strengths: ["Completed the interview"],
        improvements: ["Provide more detailed answers"],
        suggestions: []
    };

    if (parsedAi && parsedAi.aiFeedback) {
        aiFeedback = {
            overallFeedback: parsedAi.aiFeedback.overallFeedback || aiFeedback.overallFeedback,
            technicalFeedback: parsedAi.aiFeedback.technicalFeedback || aiFeedback.technicalFeedback,
            behavioralFeedback: parsedAi.aiFeedback.behavioralFeedback || aiFeedback.behavioralFeedback,
            strengths: Array.isArray(parsedAi.aiFeedback.strengths) ? parsedAi.aiFeedback.strengths : [],
            improvements: Array.isArray(parsedAi.aiFeedback.improvements) ? parsedAi.aiFeedback.improvements : [],
            suggestions: Array.isArray(parsedAi.aiFeedback.suggestions) ? parsedAi.aiFeedback.suggestions.map(s => ({text: s, completed: false})) : []
        };
    }

    const interview = await Interview.create({
        userId: req.userId,
        role: role || "Candidate",
        experience: experience || "Not Specified",
        mode: "Technical",
        status: "completed",
        questions: questions,
        finalScore: Number(finalScore.toFixed(1)),
        aiRecommendation: finalScore >= 7 ? "Selected" : "Improvement Needed",
        aiFeedback: aiFeedback
    });

    return res.status(200).json({ message: "Interview saved successfully", interviewId: interview._id })

  } catch (error) {
    console.error("Save Avatar Interview Error:", error)
    return res.status(500).json({ message: "Failed to save avatar interview" })
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
          try {
            const page = await pdf.getPage(pageNum)
            const textContent = await page.getTextContent()
            resumeText += textContent.items.map(item => item.str).join(" ") + "\n"
          } catch (e) {
            // Silently skip unreadable text layers
          }
        }
        
        // Automatic extraction strategy optimization: Fallback to OCR if text is minimal
        if (resumeText.trim().length < 50) {
            let ocrText = "";
            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                try {
                  const page = await pdf.getPage(pageNum);
                  const ops = await page.getOperatorList();
                  for (let i = 0; i < ops.fnArray.length; i++) {
                      if (ops.fnArray[i] === pdfjsLib.OPS.paintImageXObject) {
                          const imgKey = ops.argsArray[i][0];
                          const imgText = await new Promise((resolve) => {
                              page.objs.get(imgKey, async (img) => {
                                  try {
                                      if (!img) return resolve("");
                                      const pixels = img.width * img.height;
                                      const rgbaBuffer = Buffer.alloc(pixels * 4);
                                      const imgData = img.data;

                                      if (imgData.length === pixels * 3) {
                                          for (let p = 0, j = 0; p < imgData.length; p += 3, j += 4) {
                                              rgbaBuffer[j] = imgData[p];
                                              rgbaBuffer[j + 1] = imgData[p + 1];
                                              rgbaBuffer[j + 2] = imgData[p + 2];
                                              rgbaBuffer[j + 3] = 255;
                                          }
                                      } else if (imgData.length === pixels * 4) {
                                          for (let p = 0; p < imgData.length; p++) rgbaBuffer[p] = imgData[p];
                                      } else {
                                          for (let p = 0, j = 0; p < imgData.length; p++, j += 4) {
                                              rgbaBuffer[j] = imgData[p];
                                              rgbaBuffer[j + 1] = imgData[p];
                                              rgbaBuffer[j + 2] = imgData[p];
                                              rgbaBuffer[j + 3] = 255;
                                          }
                                      }

                                      const jImage = new Jimp({ width: img.width, height: img.height, data: rgbaBuffer });
                                      const tempPath = filepath + `_page${pageNum}_img.png`;
                                      
                                      await jImage.greyscale().contrast(1).normalize().write(tempPath);
                                      const { data: { text } } = await Tesseract.recognize(tempPath, 'eng', { logger: () => {} });
                                      fs.unlink(tempPath, () => {});
                                      resolve(text);
                                  } catch (err) {
                                      resolve(""); // Seamless continuation on internal processing errors
                                  }
                              });
                          });
                          ocrText += imgText + "\n";
                      }
                  }
                } catch (e) {
                  // Seamless continuation
                }
            }
            resumeText = ocrText.replace(/\s+/g, " ").trim();
        }
        await pdf.destroy()
      } catch (err) {
        // Silently caught to prevent internal error exposure
      }
    } else if (fileExt === '.docx') {
      try {
        const result = await mammoth.extractRawText({ path: filepath })
        resumeText = result.value
      } catch (err) {
        // Silently caught
      }
    } else if (fileExt === '.doc') {
      try {
        const extractor = new WordExtractor()
        const extracted = await extractor.extract(filepath)
        resumeText = extracted.getBody()
      } catch (err) {
        // Silently caught
      }
    } else if (['.png', '.jpg', '.jpeg'].includes(fileExt)) {
      try {
        const image = await Jimp.read(filepath);
        const processedPath = filepath + "_processed.png";
        
        await image.greyscale().contrast(1).normalize().write(processedPath);
        const { data: { text } } = await Tesseract.recognize(processedPath, 'eng', { logger: () => {} });
        resumeText = (text || "").replace(/\s+/g, " ").trim();
        
        fs.unlink(processedPath, () => {});
      } catch (err) {
        // Silently caught
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

    // Generate personalized context & first question only
    const messages = [
      {
        role: "system",
        content: `You are an expert AI Technical Recruiter. Analyze the candidate's resume and output a structured JSON response EXACTLY matching this schema (no markdown, no extra text):
{
  "role": "Inferred primary job role (e.g. Frontend Developer)",
  "experience": "Inferred experience level (e.g. 3 years, Fresher)",
  "skills": ["Skill1", "Skill2", "Skill3"],
  "projects": ["Project name or brief description"],
  "firstQuestion": "A single, natural, conversational opening interview question based on their role and primary skill (15-25 words)"
}`
      },
      {
        role: "user",
        content: `Resume Text:\n${resumeText.substring(0, 4000)}`
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

    // Per-socket interview state: track transcript history for adaptive follow-ups
    const sessionState = {
      questionCount: 0,
      transcript: [] // Array of { question, answer }
    };

    // Client sends a transcribed answer
    socket.on("candidate:answer", async ({ transcript, questionContext, role, experience }) => {
      if (!transcript?.trim()) return

      try {
        // Store in session history
        sessionState.questionCount += 1;
        sessionState.transcript.push({ question: questionContext, answer: transcript });

        const minQuestions = 5;
        const maxQuestions = 15;
        const qCount = sessionState.questionCount;
        const isLastQuestion = qCount >= maxQuestions;
        const minReached = qCount >= minQuestions;

        // Build conversation transcript for AI context
        const conversationHistory = sessionState.transcript
          .map((t, i) => `Q${i+1}: ${t.question}\nA${i+1}: ${t.answer}`)
          .join("\n\n");

        // Step 2: Generate AI feedback AND decide on next question
        const messages = [
          {
            role: "system",
            content: `You are an expert AI Technical Recruiter conducting an adaptive interview for a ${role || "Software Engineer"} with ${experience || "some"} experience.

Your goal is to conduct a realistic, balanced, and professional interview. You must evaluate the candidate across these REQUIRED areas:
1. Introduction & Background
2. Core Technical Knowledge
3. Problem Solving & Scenarios
4. Project Experience
5. Communication & Culture Fit

RULES FOR CONTINUING VS FINISHING:
- Minimum questions required: ${minQuestions}. Maximum limit: ${maxQuestions}. Currently on question ${qCount}.
- DO NOT end the interview before question ${minQuestions}.
- You must dynamically decide to set "isFinished": true ONLY IF:
   1. You have asked at least ${minQuestions} questions (${minReached}).
   2. You have successfully covered ALL required evaluation areas.
   3. Your "evaluationConfidence" in making a final hiring decision is high (e.g., > 85%).
- If the candidate gives short or poor answers, ask follow-ups or switch topics to gather enough data. DO NOT end early just because they struggle.
- If you reach question ${maxQuestions} (${isLastQuestion}), you MUST end the interview ("isFinished": true).

INSTRUCTIONS FOR NEXT QUESTION (if not finished):
- Ensure a natural conversational flow. 
- Use smooth transitions (e.g., "Let's discuss a technical aspect..." or "Moving on to your project experience...").
- Generate a dynamic, adaptive question based on their previous answers or an uncovered topic.
- Keep the next question between 15-25 words.
- Vary difficulty progressively.

Always respond in English.

Return ONLY a valid JSON object strictly matching this format:
{
  "feedback": "1-2 sentence human-like feedback on their latest answer in English",
  "evaluationConfidence": number (0-100),
  "coveredTopics": ["List of required areas adequately covered so far"],
  "isFinished": boolean (true ONLY if min questions met AND all areas covered AND confidence is high, OR if max questions reached),
  "nextQuestion": "The next adaptive question (omit if isFinished is true)"
}`
          },
          {
            role: "user",
            content: `Interview transcript so far:\n${conversationHistory}`
          }
        ]

        socket.emit("avatar:speaking_start")
        const aiReply = await askAi(messages)

        // Parse AI response
        let parsed = { feedback: "Thank you for your answer.", isFinished: isLastQuestion, nextQuestion: null };
        try {
          let cleaned = (aiReply || "").trim();
          const blockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
          if (blockMatch) cleaned = blockMatch[1];
          const objMatch = cleaned.match(/\{[\s\S]*\}/);
          if (objMatch) cleaned = objMatch[0];
          cleaned = cleaned.replace(/,\s*([\}\]])/g, '$1');
          parsed = JSON.parse(cleaned);
        } catch (e) {
          console.error("[Avatar Socket] AI parse error:", e.message);
        }

        // Emit feedback
        socket.emit("avatar:reply", { text: parsed.feedback || "Thank you for your answer." })
        socket.emit("avatar:speaking_end")

        // Emit next question or interview complete
        if (parsed.isFinished || !parsed.nextQuestion) {
          socket.emit("avatar:interview_complete", { message: "Interview complete" });
        } else {
          socket.emit("avatar:question_ready", { text: parsed.nextQuestion });
        }

      } catch (err) {
        console.error("[Avatar Socket] Error:", err.message)
        socket.emit("avatar:error", { message: "AI response failed. Please try again." })
      }
    })

    // Client sends a question to be spoken
    socket.on("avatar:speak_question", async ({ question }) => {
      try {
        socket.emit("avatar:question_ready", { text: question })
      } catch (err) {
        socket.emit("avatar:question_ready", { text: question })
      }
    })

    socket.on("avatar:start_interview", async ({ role, experience }) => {
      try {
        const messages = [
          {
            role: "system",
            content: `You are an expert AI Technical Recruiter. Generate a single, natural, and highly relevant opening interview question for a candidate applying for the role of "${role}" with "${experience}" experience. Keep it conversational, welcoming, and between 15-25 words.`
          }
        ];
        const aiReply = await askAi(messages);
        let firstQuestion = (aiReply || "Tell me about yourself and your background.").trim();
        
        // Remove quotes if the AI wrapped it
        firstQuestion = firstQuestion.replace(/^["']|["']$/g, '');
        
        socket.emit("avatar:question_ready", { text: firstQuestion });
      } catch (err) {
        console.error("[Avatar Socket] Failed to generate start question:", err);
        socket.emit("avatar:question_ready", { 
          text: 'Tell me about yourself and your background.'
        });
      }
    });

    socket.on("disconnect", () => {
      console.log(`[Avatar Socket] Client disconnected: ${socket.id}`)
    })
  })
}
