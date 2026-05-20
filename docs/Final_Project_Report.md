# SmartHire AI - Project Report and Technical Documentation

## 1. Title Page
**Project Title:** SmartHire AI: AI-Powered Mock Interview Platform
**Developed By:** Shishu Kumar, Anish Anand, Mayank, Tinku Kumar
**Target Audience:** Final Year Project / Technical Portfolio / Client Presentation

---

## 2. Certificate Page
This is to certify that the project entitled **"SmartHire AI"** is a bonafide work carried out by the development team under the supervision and guidance of our mentors. The project has been completed successfully and meets the standard required for the submission of the final year project.

---

## 3. Acknowledgement
We would like to express our deepest gratitude to our mentors and peers for their continuous support and guidance throughout the development of SmartHire AI. We also acknowledge the open-source community, particularly the maintainers of React, Express, MongoDB, and OpenRouter for providing the robust tools that made this project possible.

---

## 4. Abstract
SmartHire AI is an advanced, AI-powered mock interview platform designed to empower job seekers. By leveraging Large Language Models (LLMs), the system parses resumes to extract relevant skills, experience, and projects. It then dynamically generates role-specific interview questions, conducts a mock interview, and provides comprehensive, real-time feedback. The platform bridges the gap between theoretical preparation and real-world execution.

---

## 5. Executive Summary
The competitive nature of today's job market demands effective interview preparation. SmartHire AI addresses this need by offering a personalized, data-driven mock interview experience. The system is built using the MERN stack (MongoDB, Express.js, React, Node.js) and integrates with advanced AI models via OpenRouter to simulate realistic interview scenarios. Features include AI resume analysis, dynamic interview generation, real-time evaluation, and a comprehensive dashboard for tracking progress.

---

## 6. Table of Contents
*(Self-evident based on the document structure)*

---

## 7. Introduction
SmartHire AI was conceived to solve the widespread problem of interview anxiety and lack of access to realistic interview practice. By simulating the interview environment, users can refine their communication skills and technical knowledge before facing actual recruiters.

---

## 8. Problem Statement
Many candidates fail to perform well in interviews not because of a lack of technical knowledge, but due to a lack of confidence, poor communication, and unfamiliarity with the interview environment. Existing platforms often provide static question banks that do not adapt to the user's specific resume or experience level.

---

## 9. Existing System
Traditional interview preparation methods include reading static lists of common interview questions, watching generic YouTube videos, or engaging in peer-to-peer mock interviews, which can be inconsistent in quality and lack objective feedback.

---

## 10. Proposed System
SmartHire AI proposes an automated, intelligent, and highly adaptable platform. It dynamically generates questions based on the candidate's parsed resume and the specific job role they are targeting. The system also offers objective, AI-driven feedback on various metrics such as confidence, communication, and correctness.

---

## 11. Objectives
- To build a highly responsive and realistic AI-driven interview platform.
- To implement accurate resume parsing supporting PDF, DOCX, and Image formats.
- To provide actionable feedback and track user performance over time.

---

## 12. Scope of the Project
The project encompasses a full-stack web application with user authentication, secure payment processing (Razorpay), document parsing, AI API integration, and performance tracking. Future scopes include real-time avatar interviews and multilingual support.

---

## 13. Project Overview
SmartHire AI is divided into several modules: Authentication, Resume Analysis, Interview Generation, Real-time Interview Session, Feedback & Scoring, and the User Dashboard.

---

## 14. System Requirements
- **OS:** Cross-platform (Windows, macOS, Linux)
- **Browser:** Modern browsers (Chrome, Firefox, Edge, Safari)

---

## 15. Software Requirements
- **Node.js** (v18+)
- **MongoDB** (Local or Atlas)
- **Code Editor** (VS Code)

---

## 16. Hardware Requirements
- **Processor:** Intel i3 or above / equivalent AMD
- **RAM:** 4GB minimum (8GB recommended for development)
- **Storage:** 500MB free space

---

## 17. Technologies Used
- **Frontend:** React 19, Vite, Tailwind CSS 4
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **AI/LLM:** OpenRouter API (GPT-4o-mini)

---

## 18. Frameworks & Libraries
- **Frontend:** Redux Toolkit, Framer Motion, Recharts, jsPDF, Axios, Socket.io-client
- **Backend:** Mongoose, Multer, pdf-parse, mammoth, tesseract.js, Razorpay, JsonWebToken, socket.io

---

## 19. AI Models/LLMs Used
The project primarily utilizes the **GPT-4o-mini** model via the **OpenRouter API**. It is chosen for its fast inference speed, low cost, and strong contextual reasoning, making it ideal for real-time interview interactions and text analysis.

---

## 20. AI Agent Architecture
The system acts as a multi-stage intelligent agent:
1.  **Parser Agent:** Extracts text from varied file formats.
2.  **Analyzer Agent:** Maps raw text to a structured JSON object representing the candidate's profile.
3.  **Interviewer Agent:** Generates questions and evaluates answers sequentially during the mock interview.

---

## 21. Agent Workflow
1.  User uploads a resume.
2.  Parser extracts text.
3.  Analyzer evaluates text and infers skills.
4.  User initiates an interview.
5.  Interviewer agent dynamically generates the first question based on the resume data.
6.  User provides an answer (text or voice-to-text).
7.  Interviewer evaluates the answer, provides feedback, and generates the next question.

---

## 22. Prompt Engineering Strategy
System prompts were heavily engineered to ensure the LLM acts as an "Expert ATS (Applicant Tracking System)" during parsing, and as a "Professional Technical Interviewer" during the mock interview. Prompts strictly mandate JSON output formats to ensure seamless integration with the backend architecture.

---

## 23. Multi-Agent Workflow (if used)
While a single underlying LLM is used, different system prompts partition the logic into distinct "agent personas" (e.g., ATS Parser, Technical Interviewer, Feedback Evaluator).

---

## 24. Memory Management
The backend utilizes MongoDB to maintain persistent state (User profiles, Interview sessions, Scores). During active interview sessions, conversation history is maintained on the client-side (Redux) and passed contextually to the LLM to maintain conversational coherence.

---

## 25. Tool Calling Process
Tool calling is abstracted via custom backend controllers. The LLM's responses are structurally enforced (JSON) and parsed by the backend to trigger specific actions (e.g., ending the interview, updating scores in the DB).

---

## 26. API Integrations
- **OpenRouter API:** For AI logic.
- **Razorpay API:** For handling user credits and payments.
- **Firebase:** For robust authentication mechanisms.

---

## 27. Database Design
MongoDB is structured with the following core collections:
- `Users`: Stores authentication details and credit balances.
- `Interviews`: Stores session details, questions asked, user answers, and final scores.
- `Payments`: Tracks transaction history.
- `ResumeAnalyses`: Caches parsed resume data.

---

## 28. Backend Architecture
The backend follows the MVC (Model-View-Controller) pattern. Express.js routes HTTP requests to specific controllers (e.g., `interview.controller.js`, `auth.controller.js`), which interact with Mongoose models and external APIs.

---

## 29. Frontend Architecture
Built with React and Vite, utilizing Redux Toolkit for global state management. The UI is built using functional components and hooks, styled with Tailwind CSS, and animated with Framer Motion. Routing is handled by `react-router-dom`.

---

## 30. Authentication & Security
- Firebase is used for OAuth and standard authentication.
- Custom JWT (JSON Web Tokens) are generated by the Node.js backend for securing API endpoints.
- Passwords (if handled directly) are hashed (e.g., using bcrypt, though Firebase abstracts much of this).

---

## 31. Module Description
- **Auth Module:** Login/Signup.
- **Dashboard:** Displays statistics using Recharts.
- **Resume Upload:** Multi-format file parsing.
- **Interview Room:** Real-time interaction UI with timer and recording capabilities.
- **Feedback Engine:** Generates detailed reports and PDF exports.

---

## 32. Functional Requirements
- Users must be able to upload resumes.
- The system must parse resumes and extract skills.
- The system must generate role-specific questions.
- Users must receive a scored feedback report.

---

## 33. Non-Functional Requirements
- **Performance:** Resume parsing should take less than 5 seconds.
- **Scalability:** System should handle concurrent interview sessions.
- **Usability:** The UI must be highly responsive and intuitive.

---

## 34. System Design
A client-server architecture where the React frontend communicates via REST APIs (and WebSockets for real-time features) with the Node/Express backend, which acts as a mediator for the MongoDB database and external APIs.

---

## 35. UML Diagrams
*(Placeholder for architectural diagrams, typically represented visually in a final document)*

---

## 36. Use Case Diagram
- Actor: User -> Uploads Resume, Takes Interview, Views Dashboard, Buys Credits.
- Actor: System -> Parses File, Generates Questions, Evaluates Answers.

---

## 37. Sequence Diagram
*(User -> Frontend -> Backend -> OpenRouter -> Backend -> Frontend -> User)*

---

## 38. Class Diagram
*(Models: User, Interview, Payment, ResumeAnalysis)*

---

## 39. ER Diagram
`User (1) ---- (N) Interview`
`User (1) ---- (N) Payment`
`User (1) ---- (N) ResumeAnalysis`

---

## 40. Data Flow Diagram
File Upload -> Multer -> Parser -> Extracted Text -> LLM -> JSON -> MongoDB -> Client UI.

---

## 41. Workflow Diagram
Onboarding -> Setup -> Interview Session -> Review -> Analytics.

---

## 42. Application Flow
1. User logs in.
2. Navigates to Dashboard.
3. Clicks "Start Interview".
4. Uploads Resume.
5. System parses and confirms details.
6. Enters Interview Room.
7. Completes Q&A.
8. Redirected to Results Page.

---

## 43. Algorithms Used
- **OCR (Tesseract):** For image-based resumes.
- **Semantic Mapping:** LLM-based inference mapping unstructured text to structured JSON schema.

---

## 44. AI Decision-Making Process
The AI evaluates the candidate's answer against the expected technical knowledge for the specific role and experience level, factoring in communication clarity to generate a weighted score.

---

## 45. Step-by-Step Development Process
1. Requirement Gathering.
2. UI/UX Design (Figma/Tailwind).
3. Backend Setup (Express + MongoDB).
4. Resume Parsing Engine implementation.
5. AI Integration (OpenRouter).
6. Frontend Integration (React + Redux).
7. Payment Gateway Integration.
8. Testing and Refinement.

---

## 46. Folder Structure Explanation
- `/client`: React frontend source code, components, pages, assets, redux store.
- `/server`: Node.js backend, controllers, models, routes, middlewares.
- `/docs`: Documentation and markdown reports.

---

## 47. Source Code Explanation
Controllers (e.g., `interview.controller.js`) manage the core logic, ensuring that file streams from Multer are correctly routed to parsers (like pdf-parse) and the resulting text is formatted into LLM prompts.

---

## 48. Important Code Snippets
*(Example: The fallback resilience in resume parsing ensuring the server doesn't crash on malformed LLM JSON output.)*

---

## 49. Testing Methodology
- **Unit Testing:** Individual parser testing.
- **Integration Testing:** API endpoint testing via Postman.
- **End-to-End Testing:** Manual user flow verification.

---

## 50. Test Cases
- Uploading a corrupted PDF (Expected: Graceful error).
- Completing an interview with no input (Expected: Minimum score and prompt to speak).

---

## 51. Debugging Process
Extensive use of server-side logging, specifically around the AI JSON parsing layer where unpredictable LLM outputs frequently caused runtime errors. Implemented robust `try-catch` blocks and regex sanitization.

---

## 52. Challenges Faced
- **File System Locks:** Multer temp files occasionally locked during parsing.
- **LLM Hallucinations:** AI returning non-JSON text.
- **State Management:** Keeping the frontend synchronized with real-time websocket updates during avatar interviews.

---

## 53. Solutions Implemented
- Implemented `deleteFileWithRetry` to handle file locks.
- Applied Markdown stripping and JSON repair algorithms before `JSON.parse()`.

---

## 54. Optimization Techniques
- Using Vite for faster frontend builds.
- Caching parsed resumes in MongoDB to prevent redundant LLM API calls on page reloads.

---

## 55. Performance Analysis
The system maintains a TTFB (Time to First Byte) of under 200ms for standard API calls. Resume parsing complex PDFs takes ~3-5 seconds.

---

## 56. Results and Outputs
A fully functional web application capable of conducting intelligent mock interviews with comprehensive visual dashboards for user feedback.

---

## 57. Screenshots with Explanation
*(Refer to README for UI representations: Dashboard view, Interview Room UI, Feedback Report).*

---

## 58. Deployment Process
- **Frontend:** Deployed to Vercel/Netlify.
- **Backend:** Deployed to Render/Heroku/AWS EC2.
- **Database:** MongoDB Atlas.

---

## 59. CI/CD Workflow
Standard GitHub Actions pipeline to run linting (`npm run lint`) and build verification (`vite build`) on PRs.

---

## 60. Cloud/Hosting Details
- Frontend: Vercel
- Backend: Render
- DB: MongoDB Atlas
- File Storage: Ephemeral (Multer)

---

## 61. Limitations
- OCR parsing can be inaccurate for highly stylized image resumes.
- LLM response times can occasionally introduce latency in the interview flow.

---

## 62. Future Enhancements
- Fully animated, real-time 3D Avatar Interviewer.
- Multilingual support (Hindi/English).
- Integration with LinkedIn for direct profile importing.

---

## 63. Real-World Applications
- Universities can use this for campus placement training.
- HR agencies can use it for initial candidate screening.
- Individuals can use it for personal career advancement.

---

## 64. Cost Estimation
- Hosting: $0 - $20/month
- Database: Free tier (Atlas)
- LLM API: ~$0.01 per interview session (GPT-4o-mini)

---

## 65. Timeline/Project Planning
- Weeks 1-2: Design & Prototyping
- Weeks 3-5: Backend & AI Integration
- Weeks 6-8: Frontend & Polish

---

## 66. Team Contribution
- Shishu Kumar: Backend Architecture
- Anish Anand: AI Integration
- Mayank: UI/UX & Frontend
- Tinku Kumar: Database & DevOps

---

## 67. User Manual
1. Register/Login.
2. Go to "Start Interview".
3. Upload Resume.
4. Follow on-screen instructions during the mock interview.
5. Review results in the Dashboard.

---

## 68. Installation Guide
`git clone ...`
`cd server && npm install && npm run dev`
`cd client && npm install && npm run dev`
Ensure `.env` files are configured with MongoDB URI and OpenRouter API keys.

---

## 69. Maintenance Guide
Regularly update npm dependencies. Monitor OpenRouter API usage to ensure rate limits are not exceeded. Clear temporary files if Multer cleanup fails.

---

## 70. Conclusion
SmartHire AI successfully demonstrates the potential of LLMs in educational and professional training environments. It provides a scalable, cost-effective solution to interview preparation.

---

## 71. References
- React Documentation
- Express.js Documentation
- OpenRouter API Specs

---

## 72. Bibliography
- "Modern Full-Stack Development"
- "Prompt Engineering for LLMs"

---

## 73. Appendix
- Appendix A: API Endpoint Definitions.
- Appendix B: Sample LLM Prompts.
