import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

import mammoth from "mammoth";
import WordExtractor from "word-extractor";
import Tesseract from "tesseract.js";
import { Jimp } from "jimp";

import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { askAi } from "../services/openRouter.service.js";
import User from "../models/user.model.js";
import Interview from "../models/interview.model.js";

export const analyzeResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Resume required" });
    }
    const filepath = req.file.path
    const fileExt = path.extname(req.file.originalname).toLowerCase();

    let resumeText = "";

    try {
        if (fileExt === '.pdf') {
            const fileBuffer = await fs.promises.readFile(filepath);
            try {
                const parsedPdf = await pdfParse(fileBuffer);
                resumeText = parsedPdf.text.replace(/\s+/g, " ").trim();
            } catch (err) {
                console.log("pdf-parse error, falling back to empty string for OCR...", err.message);
            }

            // 3. If extracted text is very low: Convert PDF pages to images -> Run OCR
            if (!resumeText || resumeText.length < 50) {
                console.log("PDF text low. Running OCR...");
                const uint8Array = new Uint8Array(fileBuffer);
                const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;
                let ocrText = "";
                for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                    const page = await pdf.getPage(pageNum);
                    const operatorList = await page.getOperatorList();
                    
                    for (let i = 0; i < operatorList.fnArray.length; i++) {
                        if (operatorList.fnArray[i] === pdfjsLib.OPS.paintImageXObject) {
                            const imgName = operatorList.argsArray[i][0];
                            try {
                                const img = await page.objs.get(imgName);
                                if (img && img.data && img.width && img.height) {
                                    let jimpData;
                                    if (img.data.length === img.width * img.height * 3) {
                                        jimpData = Buffer.alloc(img.width * img.height * 4);
                                        for (let j = 0; j < img.width * img.height; j++) {
                                            jimpData[j * 4] = img.data[j * 3];
                                            jimpData[j * 4 + 1] = img.data[j * 3 + 1];
                                            jimpData[j * 4 + 2] = img.data[j * 3 + 2];
                                            jimpData[j * 4 + 3] = 255;
                                        }
                                    } else {
                                        jimpData = Buffer.from(img.data);
                                    }
                                    const jimpImage = await new Promise((resolve, reject) => {
                                        new Jimp({ data: jimpData, width: img.width, height: img.height }, (err, image) => {
                                            if (err) reject(err); else resolve(image);
                                        });
                                    });
                                    const pngBuffer = await jimpImage.getBufferAsync("image/png");
                                    const { data: { text } } = await Tesseract.recognize(pngBuffer, 'eng');
                                    ocrText += text + "\n";
                                }
                            } catch (e) { console.error("OCR parsing error:", e.message); }
                        }
                    }
                }
                resumeText = ocrText.replace(/\s+/g, " ").trim();
            }
        } else if (fileExt === '.docx') {
            const result = await mammoth.extractRawText({ path: filepath });
            resumeText = result.value.replace(/\s+/g, " ").trim();
        } else if (fileExt === '.doc') {
            const extractor = new WordExtractor();
            const extracted = await extractor.extract(filepath);
            resumeText = extracted.getBody().replace(/\s+/g, " ").trim();
        } else if (['.png', '.jpg', '.jpeg'].includes(fileExt)) {
            console.log("Running direct image OCR...");
            const { data: { text } } = await Tesseract.recognize(filepath, 'eng');
            resumeText = text.replace(/\s+/g, " ").trim();
        } else if (fileExt === '.txt') {
            const txtBuffer = await fs.promises.readFile(filepath);
            resumeText = txtBuffer.toString().replace(/\s+/g, " ").trim();
        } else {
            throw new Error("Unsupported file format. Please upload a PDF, DOC, DOCX, JPG, PNG or TXT file.");
        }

    } catch (parseError) {
        if (req.file && fs.existsSync(filepath)) { fs.unlinkSync(filepath); }
        return res.status(400).json({ message: parseError.message || "Failed to parse document." });
    }

    const messages = [
      {
        role: "system",
        content: `
You are an expert ATS (Applicant Tracking System).
Your task is to extract structured data ONLY from the provided resume text.
Even if the text is messy, out of order, or missing sections due to parsing complex layouts (like graphics, tables, or scans), DO YOUR BEST to piece together the candidate's profile.
If it is clearly a resume, NEVER return an empty object or a 0 score. ALWAYS attempt to score and extract partial information.
Do NOT hallucinate or make up any information. If a field is truly missing, leave it as an empty string or empty array.

Return strictly valid JSON without any markdown formatting or backticks.
The JSON must have this exact structure:
{
  "role": "string (the candidate's primary job title or role)",
  "experience": "string (total years of experience, e.g., '3 years' or 'Fresher')",
  "projects": ["array of strings (names or short descriptions of projects worked on)"],
  "skills": ["array of strings (technical and soft skills)"],
  "atsScore": "number (0 to 100 representing ATS match/quality)",
  "summary": "string (brief 2-3 sentence professional summary of the candidate)",
  "strengths": ["array of strings (top 2-3 strengths of the candidate)"],
  "weakness": ["array of strings (identify 2-3 missing skills or areas of improvement based on typical industry standards for their role)"],
  "experienceAnalysis": "string (1-2 sentence analysis of their work history and impact)",
  "bestRole": "string (the single best-suited job title for this candidate based on their resume)",
  "suggestions": ["array of strings (2-3 actionable tips to improve the resume impact)"]
}
`
      },
      {
        role: "user",
        content: resumeText || "No text could be extracted from the resume."
      }
    ];


    const aiResponse = await askAi(messages)

    let cleanedResponse = aiResponse;
    const jsonMatch = cleanedResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
        cleanedResponse = jsonMatch[1];
    } else {
        const fallbackMatch = cleanedResponse.match(/\{[\s\S]*\}/);
        if (fallbackMatch) {
            cleanedResponse = fallbackMatch[0];
        } else {
            cleanedResponse = cleanedResponse.trim();
        }
    }

    const parsed = JSON.parse(cleanedResponse);

    fs.unlinkSync(filepath)


    res.json({
      role: parsed.role,
      experience: parsed.experience,
      projects: parsed.projects,
      skills: parsed.skills,
      atsScore: parsed.atsScore,
      summary: parsed.summary,
      strengths: parsed.strengths,
      weakness: parsed.weakness,
      experienceAnalysis: parsed.experienceAnalysis,
      bestRole: parsed.bestRole,
      suggestions: parsed.suggestions,
      resumeText
    });

  } catch (error) {
    console.error(error);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({ message: error.message });
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
      .map(q => q.trim())
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


    const parsed = JSON.parse(aiResponse);

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




