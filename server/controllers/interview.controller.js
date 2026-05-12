import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

import mammoth from "mammoth";
import WordExtractor from "word-extractor";
import Tesseract from "tesseract.js";

import { askAi } from "../services/openRouter.service.js";
import User from "../models/user.model.js";
import Interview from "../models/interview.model.js";

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
          await pdf.destroy(); // Fix file system lock
          resumeText = pdfText.replace(/\s+/g, " ").trim();
          console.log(`pdfjs extracted ${resumeText.length} chars`);
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
        console.log("Running direct image OCR...");
        const { data: { text } } = await Tesseract.recognize(filepath, 'eng', { logger: () => {} });
        resumeText = (text || "").replace(/\s+/g, " ").trim();

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

    return res.json({
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
        content: `
You are a real human interviewer conducting a professional interview.

Speak in simple, natural English as if you are directly talking to the candidate.

Generate exactly 5 interview questions.

Strict Rules:
- Each question must contain between 15 and 25 words.
- Each question must be a single complete sentence.
- Do NOT number them.
- Do NOT add explanations.
- Do NOT add extra text before or after.
- One question per line only.
- Keep language simple and conversational.
- Questions must feel practical and realistic.

Difficulty progression:
Question 1 → easy  
Question 2 → easy  
Question 3 → medium  
Question 4 → medium  
Question 5 → hard  

Make questions based on the candidate’s role, experience,interviewMode, projects, skills, and resume details.
`
      }
      ,
      {
        role: "user",
        content: userPrompt
      }
    ];


    const aiResponse = await askAi(messages)

    if (!aiResponse || !aiResponse.trim()) {
           
      return res.status(500).json({
        message: "AI returned empty response."
      });

    }

    const questionsArray = aiResponse
      .split("\n")
      .map(q => q.replace(/^(?:\d+[\.\)]\s*|Question\s*\d+:\s*|Q\d+:\s*|-\s*)/i, "").trim())
      .filter(q => q.length > 0)
      .slice(0, 5);

    if (questionsArray.length === 0) {
      
      return res.status(500).json({
        message: "AI failed to generate questions."
      });
    }

    user.credits -= 50;
    await user.save();

    const interview = await Interview.create({
      userId: user._id,
      role,
      experience,
      mode,
      resumeText: safeResume,
      questions: questionsArray.map((q, index) => ({
        question: q,
        difficulty: ["easy", "easy", "medium", "medium", "hard"][index],
        timeLimit: [60, 60, 90, 90, 120][index],
      }))
    })

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


    const messages = [
      {
        role: "system",
        content: `
You are a professional human interviewer evaluating a candidate's answer in a real interview.

Evaluate naturally and fairly, like a real person would.

Score the answer in these areas (0 to 10):

1. Confidence – Does the answer sound clear, confident, and well-presented?
2. Communication – Is the language simple, clear, and easy to understand?
3. Correctness – Is the answer accurate, relevant, and complete?

Rules:
- Be realistic and unbiased.
- Do not give random high scores.
- If the answer is weak, score low.
- If the answer is strong and detailed, score high.
- Consider clarity, structure, and relevance.

Calculate:
finalScore = average of confidence, communication, and correctness (rounded to nearest whole number).

Feedback Rules:
- Write natural human feedback.
- 10 to 15 words only.
- Sound like real interview feedback.
- Can suggest improvement if needed.
- Do NOT repeat the question.
- Do NOT explain scoring.
- Keep tone professional and honest.

Return ONLY valid JSON in this format:

{
  "confidence": number,
  "communication": number,
  "correctness": number,
  "finalScore": number,
  "feedback": "short human feedback"
}
`
      }
      ,
      {
        role: "user",
        content: `
Question: ${question.question}
Answer: ${answer}
`
      }
    ];


    const aiResponse = await askAi(messages)


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
        confidence: 50,
        communication: 50,
        correctness: 50,
        finalScore: 50,
        feedback: "We could not fully process this answer due to an AI format issue, but your response has been recorded."
      };
    }

    question.answer = answer;
    question.confidence = parsed.confidence;
    question.communication = parsed.communication;
    question.correctness = parsed.correctness;
    question.score = parsed.finalScore;
    question.feedback = parsed.feedback;
    await interview.save();


    return res.status(200).json({feedback :parsed.feedback})
  } catch (error) {
    return res.status(500).json({message:`failed to submit answer ${error}`})

  }
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

    await interview.save();

    return res.status(200).json({
       finalScore: Number(finalScore.toFixed(1)),
      confidence: Number(avgConfidence.toFixed(1)),
      communication: Number(avgCommunication.toFixed(1)),
      correctness: Number(avgCorrectness.toFixed(1)),
      questionWiseScore: interview.questions.map((q) => ({
        question: q.question,
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
      finalScore: interview.finalScore,
      confidence: Number(avgConfidence.toFixed(1)),
      communication: Number(avgCommunication.toFixed(1)),
      correctness: Number(avgCorrectness.toFixed(1)),
      questionWiseScore: interview.questions
    });

  } catch (error) {
    return res.status(500).json({message:`failed to find currentUser Interview report ${error}`})
  }
}




