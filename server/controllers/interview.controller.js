import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

import mammoth from "mammoth";
import WordExtractor from "word-extractor";
import Tesseract from "tesseract.js";
import { Jimp } from "jimp";

import { askAi } from "../services/openRouter.service.js";
import User from "../models/user.model.js";
import Interview from "../models/interview.model.js";
import ResumeAnalysis from "../models/resumeAnalysis.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export const analyzeResume = async (req, res) => {
  const filepath = req.file?.path;

  try {
    if (!req.file) {
      return res.status(400).json({ message: "Resume required" });
    }

    const fileExt = path.extname(req.file.originalname).toLowerCase();
    let resumeText = "";

    // ── LAYER 1: Text extraction based on file type ──────────────────────────
    try {
      if (fileExt === '.pdf') {
        // Use pdfjs text extraction
        try {
          const fileBuffer = await fs.promises.readFile(filepath);
          const uint8Array = new Uint8Array(fileBuffer);
          const pdf = await pdfjsLib.getDocument({ data: uint8Array, verbosity: 0 }).promise;
          let pdfText = "";
          for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const content = await page.getTextContent();
            pdfText += content.items.map(item => item.str).join(" ") + "\n";
          }
          resumeText = pdfText.replace(/\s+/g, " ").trim();
          console.log(`pdfjs extracted ${resumeText.length} chars`);
          
          if (resumeText.length < 50) {
            console.log("PDF text layer is too small, falling back to embedded image OCR...");
            let ocrText = "";
            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
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
                                    console.error("PDF Image OCR error:", err);
                                    resolve("");
                                }
                            });
                        });
                        ocrText += imgText + "\n";
                    }
                }
            }
            resumeText = ocrText.replace(/\s+/g, " ").trim();
          }
          await pdf.destroy(); // Fix file system lock
        } catch (e) {
          console.log("pdfjs text extraction failed:", e.message);
        }

      } else if (fileExt === '.docx') {
        const result = await mammoth.extractRawText({ path: filepath });
        resumeText = (result.value || "").replace(/\s+/g, " ").trim();

      } else if (fileExt === '.doc') {
        const extractor = new WordExtractor();
        const extracted = await extractor.extract(filepath);
        resumeText = (extracted.getBody() || "").replace(/\s+/g, " ").trim();

      } else if (['.png', '.jpg', '.jpeg'].includes(fileExt)) {
        console.log("Running direct image OCR with pre-processing...");
        try {
            const image = await Jimp.read(filepath);
            const processedPath = filepath + "_processed.png";
            
            await image
                .greyscale()
                .contrast(1)
                .normalize()
                .write(processedPath);

            const { data: { text } } = await Tesseract.recognize(processedPath, 'eng', { logger: () => {} });
            resumeText = (text || "").replace(/\s+/g, " ").trim();
            
            fs.unlink(processedPath, () => {});
        } catch (err) {
            console.error("OCR Preprocessing Error:", err);
        }

      } else if (fileExt === '.txt') {
        const txtBuffer = await fs.promises.readFile(filepath);
        resumeText = txtBuffer.toString().replace(/\s+/g, " ").trim();

      } else {
        return res.status(400).json({ 
          message: "Unsupported file format. Please upload a PDF, DOC, DOCX, JPG, PNG or TXT file." 
        });
      }

    } catch (parseError) {
      console.error("Parsing error (non-fatal, continuing with empty text):", parseError.message);
    }

    console.log(`Final resumeText length: ${resumeText.length}`);
    if (!resumeText || resumeText.length < 20) {
      return res.status(400).json({ message: "Could not extract text. The file might be corrupted, password protected, or completely blank." })
    }

    // ── LAYER 2: AI Analysis ─────────────────────────────────────────────────
    const messages = [
      {
        role: "system",
        content: `You are an expert ATS (Applicant Tracking System) and resume analyst.
Analyze the provided resume text and extract structured data even if the text is messy or partially extracted from scans/images.

CRITICAL RULES:
- ALWAYS return valid JSON with ALL fields populated. Never return empty/null.
- If specific data is unclear, make your best educated inference based on context.
- atsScore should be between 40-95 for any real resume content. Only give below 40 if truly no resume content exists.
- For skills, infer from project descriptions if not explicitly listed.

Return ONLY a raw JSON object (no markdown, no backticks, no explanation):
{
  "role": "primary job title or role of candidate",
  "experience": "total years of experience e.g. '3 years' or 'Fresher'",
  "projects": ["project name or description"],
  "skills": ["skill1", "skill2"],
  "atsScore": 75,
  "summary": "2-3 sentence professional summary",
  "strengths": ["strength1", "strength2", "strength3"],
  "weakness": ["area for improvement 1", "area for improvement 2"],
  "experienceAnalysis": "1-2 sentence analysis of work history",
  "bestRole": "single best-suited job title",
  "suggestions": ["actionable tip 1", "actionable tip 2", "actionable tip 3"]
}`
      },
      {
        role: "user",
        content: resumeText.length > 20 
          ? `Please analyze this resume:\n\n${resumeText}`
          : "The resume could not be fully extracted, likely due to scan quality or complex formatting. Please provide a generic professional assessment with low ATS score and note the extraction issue."
      }
    ];

    let parsed = null;
    try {
      const aiResponse = await askAi(messages);
      console.log("Raw AI Response (first 200 chars):", aiResponse?.substring(0, 200));

      // Clean response: strip markdown code blocks
      let cleaned = (aiResponse || "").trim();
      const blockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (blockMatch) {
        cleaned = blockMatch[1];
      } else {
        // Extract first JSON object
        const objMatch = cleaned.match(/\{[\s\S]*\}/);
        if (objMatch) cleaned = objMatch[0];
      }
      // Fix trailing commas
      cleaned = cleaned.replace(/,\s*([\}\]])/g, '$1');
      parsed = JSON.parse(cleaned);
    } catch (aiErr) {
      console.error("AI analysis or JSON parse error:", aiErr.message);
    }

    // ── LAYER 3: Guaranteed fallback if AI fails ─────────────────────────────
    if (!parsed) {
      parsed = {
        role: "Professional",
        experience: "Not Specified",
        projects: ["Resume received — projects could not be automatically extracted"],
        skills: ["Communication", "Teamwork", "Problem Solving"],
        atsScore: 42,
        summary: "Resume was received successfully. Automated analysis encountered an issue with this document format. Please ensure your resume uses standard formatting for best results.",
        strengths: ["Resume submitted", "Candidate engaged in the process"],
        weakness: ["Resume format may not be ATS-friendly", "Consider a plain-text or single-column template"],
        experienceAnalysis: "Experience details could not be automatically parsed from this document.",
        bestRole: "General Professional",
        suggestions: [
          "Use a clean, single-column resume template",
          "Ensure your PDF is text-based, not an image scan",
          "List skills explicitly in a dedicated Skills section"
        ]
      };
    }

    // Safe field normalization — ensures no undefined crashes the frontend
    const safeStr = (v, fallback = "") => (typeof v === "string" ? v : fallback);
    const safeArr = (v, fallback = []) => (Array.isArray(v) ? v : fallback);
    const safeNum = (v, fallback = 50) => (typeof v === "number" ? v : Number(v) || fallback);

    // Robust file cleanup to handle file system locks
    const deleteFileWithRetry = async (filePath, retries = 5, delayMs = 1000) => {
      for (let i = 0; i < retries; i++) {
        try {
          if (fs.existsSync(filePath)) {
            await fs.promises.unlink(filePath);
          }
          break; // Success
        } catch (fsErr) {
          if (i === retries - 1) {
            console.error("Could not delete uploaded file after retries:", fsErr.message);
          } else {
            await new Promise(res => setTimeout(res, delayMs)); // Wait and retry
          }
        }
      }
    };

    if (filepath) {
      await deleteFileWithRetry(filepath);
    }

    let savedId = null;
    if (req.userId) {
      try {
        const saved = await ResumeAnalysis.create({
          userId: req.userId,
          role: safeStr(parsed.role, "Professional"),
          experience: safeStr(parsed.experience, "Not Specified"),
          atsScore: safeNum(parsed.atsScore, 50),
          summary: safeStr(parsed.summary),
          bestRole: safeStr(parsed.bestRole, "Professional"),
          skills: safeArr(parsed.skills),
          strengths: safeArr(parsed.strengths),
          weakness: safeArr(parsed.weakness),
          suggestions: safeArr(parsed.suggestions),
          experienceAnalysis: safeStr(parsed.experienceAnalysis),
          fileName: req.file ? req.file.originalname : "resume.pdf"
        });
        savedId = saved._id;
      } catch (dbErr) {
        console.error("Failed to save resume analysis to db:", dbErr.message);
      }
    }

    return res.json({
      _id: savedId,
      role: safeStr(parsed.role, "Professional"),
      experience: safeStr(parsed.experience, "Not Specified"),
      projects: safeArr(parsed.projects),
      skills: safeArr(parsed.skills),
      atsScore: safeNum(parsed.atsScore, 50),
      summary: safeStr(parsed.summary),
      strengths: safeArr(parsed.strengths),
      weakness: safeArr(parsed.weakness),
      experienceAnalysis: safeStr(parsed.experienceAnalysis),
      bestRole: safeStr(parsed.bestRole, "Professional"),
      suggestions: safeArr(parsed.suggestions),
      resumeText
    });

  } catch (error) {
    console.error("Resume analysis top-level error:", error.message);
    if (filepath) {
      try {
        if (fs.existsSync(filepath)) await fs.promises.unlink(filepath);
      } catch (_) {}
    }
    return res.status(500).json({ message: "Failed to analyze resume. Please try again." });
  }
};


export const generateQuestion = async (req, res) => {
  try {
    let { role, experience, mode, resumeText, projects, skills } = req.body

    role = role?.trim();
    experience = experience?.trim();
    mode = mode?.trim();

    if (!role || !experience || !mode) {
      return res.status(400).json({ message: "Role, Experience and Mode are required." })
    }

    const user = await User.findById(req.userId)

    if (!user) {
      return res.status(404).json({
        message: "User not found."
      });
    }

    if (user.credits < 50) {
      return res.status(400).json({
        message: "Not enough credits. Minimum 50 required."
      });
    }

    const projectText = Array.isArray(projects) && projects.length
      ? projects.join(", ")
      : "None";

    const skillsText = Array.isArray(skills) && skills.length
      ? skills.join(", ")
      : "None";

    const safeResume = resumeText?.trim() || "None";

    const userPrompt = `
    Role:${role}
    Experience:${experience}
    InterviewMode:${mode}
    Projects:${projectText}
    Skills:${skillsText},
    Resume:${safeResume}
    `;

    if (!userPrompt.trim()) {
      return res.status(400).json({
        message: "Prompt content is empty."
      });
    }

    const messages = [
      {
        role: "system",
        content: `You are a real human interviewer conducting a professional interview.
Speak in simple, natural English as if you are directly talking to the candidate.

Generate EXACTLY ONE initial interview question to start the interview.

Strict Rules:
- The question must contain between 15 and 25 words.
- It must be a single complete sentence.
- Do NOT number it.
- Do NOT add explanations or extra text.
- Keep language simple and conversational.

If InterviewMode is "HR": Ask a welcoming behavioral or introductory question (e.g., "Tell me about yourself" or "What are your career goals?").
If InterviewMode is "Technical": Ask an initial technical question based on their primary skills or projects.

Make the question based on the candidate’s role, experience, projects, skills, and resume details.`
      },
      {
        role: "user",
        content: userPrompt
      }
    ];

    const aiResponse = await askAi(messages);

    if (!aiResponse || !aiResponse.trim()) {
      return res.status(500).json({ message: "AI returned empty response." });
    }

    const firstQuestion = aiResponse.replace(/^(?:\d+[\.\)]\s*|Question\s*\d+:\s*|Q\d+:\s*|-\s*)/i, "").trim();

    if (!firstQuestion) {
      return res.status(500).json({ message: "AI failed to generate question." });
    }

    user.credits -= 50;
    await user.save();

    const interview = await Interview.create({
      userId: user._id,
      role,
      experience,
      mode,
      resumeText: safeResume,
      questions: [{
        question: firstQuestion,
        difficulty: "easy",
        timeLimit: 60,
      }]
    });

    res.json({
      interviewId: interview._id,
      creditsLeft: user.credits,
      userName: user.name,
      questions: interview.questions
    });
  } catch (error) {
    return res.status(500).json({message:`failed to create interview ${error}`})
  }
}


export const submitAnswer = async (req, res) => {
  try {
    const { interviewId, questionIndex, answer, timeTaken } = req.body

    const interview = await Interview.findById(interviewId)
    const question = interview.questions[questionIndex]

    // If no answer
    if (!answer) {
      question.score = 0;
      question.feedback = "You did not submit an answer.";
      question.answer = "";

      await interview.save();

      return res.json({
        feedback: question.feedback
      });
    }

    // If time exceeded
    if (timeTaken > question.timeLimit) {
      question.score = 0;
      question.feedback = "Time limit exceeded. Answer not evaluated.";
      question.answer = answer;

      await interview.save();

      return res.json({
        feedback: question.feedback
      });
    }


    const isLastQuestion = questionIndex >= 7; // Max 8 questions
    const minQuestionsReached = questionIndex >= 3; // Min 4 questions (index 0,1,2,3)

    const transcript = interview.questions.slice(0, questionIndex + 1).map((q, i) => `Q${i+1}: ${q.question}\nA${i+1}: ${i === questionIndex ? answer : q.answer}`).join("\n\n");

    const messages = [
      {
        role: "system",
        content: `You are a professional human interviewer evaluating a candidate's answer and deciding how to proceed in a real interview.

Evaluate naturally and fairly. Score the answer (0 to 10) on Confidence, Communication, and Correctness.

Based on the transcript, generate the NEXT question (unless you decide to finish the interview).
- The next question should logically follow up on the candidate's answer (e.g., if they mention a technology, ask about it) or move to a new topic relevant to their role (${interview.role}).
- If they gave a strong answer, increase the difficulty. If weak, ask for clarification or a simpler question.
- Maximum questions allowed is 8. You are currently evaluating question ${questionIndex + 1}.
${minQuestionsReached ? "- You have reached the minimum required questions. You may choose to finish the interview by setting isFinished to true and omitting nextQuestion if you have enough signals." : "- You MUST generate a nextQuestion."}
${isLastQuestion ? "- This is the final question. You MUST set isFinished to true and omit nextQuestion." : ""}

Return ONLY valid JSON in this format:
{
  "confidence": number,
  "communication": number,
  "correctness": number,
  "finalScore": number,
  "feedback": "short human feedback (10-15 words)",
  "isFinished": boolean,
  "nextQuestion": {
    "question": "The next interview question text (15-25 words)",
    "difficulty": "easy, medium, or hard",
    "timeLimit": 60, 90, or 120 (number)
  }
}`
      },
      {
        role: "user",
        content: `Interview Context: Role: ${interview.role}, Experience: ${interview.experience}, Mode: ${interview.mode}\n\nTranscript:\n${transcript}`
      }
    ];

    const aiResponse = await askAi(messages);

    let parsed;
    try {
      let cleanedResponse = (aiResponse || "").trim();
      const blockMatch = cleanedResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (blockMatch) {
        cleanedResponse = blockMatch[1];
      } else {
        const objMatch = cleanedResponse.match(/\{[\s\S]*\}/);
        if (objMatch) cleanedResponse = objMatch[0];
      }
      cleanedResponse = cleanedResponse.replace(/,\s*([\}\]])/g, '$1');
      parsed = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error("AI answer evaluation parse error:", parseError.message);
      parsed = {
        confidence: 5,
        communication: 5,
        correctness: 5,
        finalScore: 5,
        feedback: "Response recorded.",
        isFinished: isLastQuestion || minQuestionsReached,
        nextQuestion: (isLastQuestion || minQuestionsReached) ? null : { question: "Can you elaborate on your experience?", difficulty: "medium", timeLimit: 60 }
      };
    }

    question.answer = answer;
    question.confidence = parsed.confidence || 0;
    question.communication = parsed.communication || 0;
    question.correctness = parsed.correctness || 0;
    question.score = parsed.finalScore || 0;
    question.feedback = parsed.feedback || "Response recorded.";

    let nextQuestion = null;
    let isFinished = parsed.isFinished === true || isLastQuestion;

    if (!isFinished && parsed.nextQuestion && parsed.nextQuestion.question) {
        nextQuestion = {
            question: parsed.nextQuestion.question,
            difficulty: parsed.nextQuestion.difficulty || "medium",
            timeLimit: parsed.nextQuestion.timeLimit || 60,
        };
        interview.questions.push(nextQuestion);
    } else {
        isFinished = true;
    }

    await interview.save();

    return res.status(200).json({ 
        feedback: question.feedback,
        nextQuestion: nextQuestion,
        isFinished: isFinished
    });
}


export const finishInterview = async (req,res) => {
  try {
    const {interviewId} = req.body
    const interview = await Interview.findById(interviewId)
    if(!interview){
      return res.status(400).json({message:"failed to find Interview"})
    }

    const totalQuestions = interview.questions.length;

    let totalScore = 0;
    let totalConfidence = 0;
    let totalCommunication = 0;
    let totalCorrectness = 0;

    interview.questions.forEach((q) => {
      totalScore += q.score || 0;
      totalConfidence += q.confidence || 0;
      totalCommunication += q.communication || 0;
      totalCorrectness += q.correctness || 0;
    });

    const finalScore = totalQuestions
      ? totalScore / totalQuestions
      : 0;

    const avgConfidence = totalQuestions
      ? totalConfidence / totalQuestions
      : 0;

    const avgCommunication = totalQuestions
      ? totalCommunication / totalQuestions
      : 0;

    const avgCorrectness = totalQuestions
      ? totalCorrectness / totalQuestions
      : 0;

    interview.finalScore = finalScore;
    interview.status = "completed";

    // Dynamic AI Feedback Generation
    const chatTranscript = interview.questions.map((q, i) => `Q${i+1}: ${q.question}\nAnswer: ${q.answer || "No answer submitted."}\nScore: ${q.score}/10 | Confidence: ${q.confidence}/10 | Communication: ${q.communication}/10 | Correctness: ${q.correctness}/10\nFeedback: ${q.feedback}`).join("\n\n");
    const aiMessages = [
      { role: "system", content: `You are an elite talent acquisition expert, senior technical interviewer, and professional career coach. Analyze the candidate's complete performance in the mock interview. Evaluate their responses carefully:
- overallFeedback: 2-3 sentences summarizing general performance, structure, and pacing.
- technicalFeedback: 2 sentences focusing specifically on technical precision, correctness, concepts explained, and logic.
- behavioralFeedback: 2 sentences focusing specifically on communication clarity, confidence, structural framework (e.g., STAR method), and vocal pacing.
- strengths: An array of 2-3 key technical or behavioral strengths demonstrated.
- improvements: An array of 2-3 key growth opportunities or errors noticed in answers.
- suggestions: An array of 3 highly personalized, actionable preparation instructions.
Return ONLY a raw JSON object matching the exact structure below (no markdown wrappers, no comments):
{
  "overallFeedback": "...", "technicalFeedback": "...", "behavioralFeedback": "...",
  "strengths": ["...", "...", "..."], "improvements": ["...", "...", "..."],
  "suggestions": ["...", "...", "..."]
}` },
      { role: "user", content: `Here is the interview transcript and question-wise evaluation scores:\n\n${chatTranscript}` }
    ];
    
    try {
      const aiRes = await askAi(aiMessages);
      let cleaned = (aiRes || "").trim();
      const blockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (blockMatch) cleaned = blockMatch[1];
      const objMatch = cleaned.match(/\{[\s\S]*\}/);
      if (objMatch) cleaned = objMatch[0];
      cleaned = cleaned.replace(/,\s*([\}\]])/g, '$1');
      const parsedAi = JSON.parse(cleaned);
      if (parsedAi) {
         interview.aiFeedback = {
           overallFeedback: parsedAi.overallFeedback || "",
           technicalFeedback: parsedAi.technicalFeedback || "",
           behavioralFeedback: parsedAi.behavioralFeedback || "",
           strengths: Array.isArray(parsedAi.strengths) ? parsedAi.strengths : [],
           improvements: Array.isArray(parsedAi.improvements) ? parsedAi.improvements : [],
           suggestions: Array.isArray(parsedAi.suggestions) ? parsedAi.suggestions.map(s => ({text: s, completed: false})) : []
         };
         interview.aiRecommendation = finalScore >= 7 ? "Selected" : "Improvement Needed";
      }
    } catch (e) {
      console.error("AI feedback gen failed:", e.message);
    }

    await interview.save();

    return res.status(200).json({
      _id: interview._id,
      finalScore: Number(finalScore.toFixed(1)),
      confidence: Number(avgConfidence.toFixed(1)),
      communication: Number(avgCommunication.toFixed(1)),
      correctness: Number(avgCorrectness.toFixed(1)),
      aiFeedback: interview.aiFeedback || null,
      questionWiseScore: interview.questions.map((q) => ({
        question: q.question,
        answer: q.answer || "",
        score: q.score || 0,
        feedback: q.feedback || "",
        confidence: q.confidence || 0,
        communication: q.communication || 0,
        correctness: q.correctness || 0,
      })),
    })
  } catch (error) {
    return res.status(500).json({message:`failed to finish Interview ${error}`})
  }
}


export const getMyInterviews = async (req,res) => {
  try {
    const interviews = await Interview.find({userId:req.userId})
    .sort({ createdAt: -1 })
    .select("role experience mode finalScore status createdAt");

    return res.status(200).json(interviews)

  } catch (error) {
     return res.status(500).json({message:`failed to find currentUser Interview ${error}`})
  }
}

export const getInterviewReport = async (req,res) => {
  try {
    const interview = await Interview.findById(req.params.id)

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }


    const totalQuestions = interview.questions.length;

    let totalConfidence = 0;
    let totalCommunication = 0;
    let totalCorrectness = 0;

    interview.questions.forEach((q) => {
      totalConfidence += q.confidence || 0;
      totalCommunication += q.communication || 0;
      totalCorrectness += q.correctness || 0;
    });
    const avgConfidence = totalQuestions
      ? totalConfidence / totalQuestions
      : 0;

    const avgCommunication = totalQuestions
      ? totalCommunication / totalQuestions
      : 0;

    const avgCorrectness = totalQuestions
      ? totalCorrectness / totalQuestions
      : 0;

       return res.json({
      _id: interview._id,
      finalScore: interview.finalScore,
      aiFeedback: interview.aiFeedback,
      confidence: Number(avgConfidence.toFixed(1)),
      communication: Number(avgCommunication.toFixed(1)),
      correctness: Number(avgCorrectness.toFixed(1)),
      questionWiseScore: interview.questions.map(q => ({
        question: q.question,
        answer: q.answer || "",
        score: q.score || 0,
        feedback: q.feedback || "",
        confidence: q.confidence || 0,
        communication: q.communication || 0,
        correctness: q.correctness || 0,
      }))
    });

  } catch (error) {
    return res.status(500).json({message:`failed to find currentUser Interview report ${error}`})
  }
}

export const getMyResumes = async (req, res) => {
  try {
    const resumes = await ResumeAnalysis.find({ userId: req.userId }).sort({ createdAt: -1 });
    return res.status(200).json(resumes);
  } catch (error) {
    return res.status(500).json({ message: `failed to find currentUser Resumes ${error}` });
  }
}

export const getResumeReport = async (req, res) => {
  try {
    const resume = await ResumeAnalysis.findById(req.params.id);
    if (!resume) return res.status(404).json({ message: "Resume not found" });
    return res.json(resume);
  } catch (error) {
    return res.status(500).json({ message: `failed to find Resume report ${error}` });
  }
}

export const toggleSuggestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { suggestionId, completed } = req.body;
    const interview = await Interview.findById(id);
    if (!interview) return res.status(404).json({ message: "Interview not found" });
    
    if (interview.aiFeedback && interview.aiFeedback.suggestions) {
      const suggestion = interview.aiFeedback.suggestions.id(suggestionId);
      if (suggestion) {
        suggestion.completed = completed;
        await interview.save();
        return res.json(suggestion);
      }
    }
    return res.status(404).json({ message: "Suggestion not found" });
  } catch (error) {
    return res.status(500).json({ message: `failed to toggle suggestion ${error}` });
  }
};

export const deleteInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const interview = await Interview.findOne({ _id: id, userId: req.userId });
    if (!interview) {
      return res.status(404).json({ message: "Interview report not found or unauthorized" });
    }
    await Interview.deleteOne({ _id: id });
    return res.json({ message: "Interview report successfully deleted" });
  } catch (error) {
    return res.status(500).json({ message: `Failed to delete interview report: ${error.message}` });
  }
};

export const deleteResume = async (req, res) => {
  try {
    const { id } = req.params;
    const resume = await ResumeAnalysis.findOne({ _id: id, userId: req.userId });
    if (!resume) {
      return res.status(404).json({ message: "Resume report not found or unauthorized" });
    }
    await ResumeAnalysis.deleteOne({ _id: id });
    return res.json({ message: "Resume report successfully deleted" });
  } catch (error) {
    return res.status(500).json({ message: `Failed to delete resume report: ${error.message}` });
  }
};
