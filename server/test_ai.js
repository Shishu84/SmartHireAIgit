import { askAi } from "./services/openRouter.service.js";
import dotenv from "dotenv";
dotenv.config();

const messages = [
  {
    role: "system",
    content: `
You are an expert ATS (Applicant Tracking System).
Your task is to extract structured data ONLY from the provided resume text.
Do NOT hallucinate or make up any information. If a field is not present in the resume or if the resume text is empty, leave it as an empty string or empty array.

Return strictly valid JSON without any markdown formatting or backticks.
The JSON must have this exact structure:
{
  "role": "string (the candidate's primary job title or role)",
  "experience": "string (total years of experience, e.g., '3 years' or 'Fresher')",
  "projects": ["array of strings (names or short descriptions of projects worked on)"],
  "skills": ["array of strings (technical and soft skills)"]
}
`
  },
  {
    role: "user",
    content: "No text could be extracted from the resume."
  }
];

async function test() {
    try {
        console.log("Asking AI...");
        const response = await askAi(messages);
        console.log("Raw Response:", response);
        
        let cleanedResponse = response;
        const jsonMatch = cleanedResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
            cleanedResponse = jsonMatch[1];
        } else {
            cleanedResponse = cleanedResponse.trim();
        }
        
        console.log("Cleaned:", cleanedResponse);
        const parsed = JSON.parse(cleanedResponse);
        console.log("Parsed Successfully:", parsed);
    } catch (e) {
        console.error("Error:", e);
    }
}
test();
