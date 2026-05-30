# SmartHireAI - System Architecture

This document provides a high-level overview of the SmartHireAI application architecture, detailing both the Client (Frontend) and Server (Backend) structures, technologies, and interactions.

## 1. High-Level Architecture Overview

SmartHireAI follows a modern Client-Server architecture:
- **Client (Frontend)**: A Single Page Application (SPA) built with React and Vite, responsible for UI, routing, and user interactions.
- **Server (Backend)**: A RESTful API built with Node.js and Express, responsible for data management, AI service integration, document processing, and real-time communication via WebSockets.
- **Database**: MongoDB (accessed via Mongoose) used for persistent data storage.

---

## 2. Client Architecture (Frontend)

The frontend is built for performance, modularity, and an engaging user experience (UI/UX).

### Technology Stack
- **Core**: React 19, Vite
- **Styling**: Tailwind CSS, Framer Motion (for animations), Lucide React & React Icons
- **State Management**: Redux Toolkit (`@reduxjs/toolkit`), React Context API
- **Routing**: React Router DOM
- **Data Fetching**: Axios
- **Real-Time Communication**: Socket.io-client
- **Document Rendering**: React Markdown, React Syntax Highlighter, jsPDF

### Directory Structure (`/client/src/`)
- **`/assets/`**: Static assets like images and fonts.
- **`/components/`**: Reusable UI components.
  - *Examples*: `Navbar.jsx`, `Footer.jsx`, `AuthModel.jsx`, `ErrorBoundary.jsx`.
  - *Interview Flow*: `Step1SetUp.jsx`, `Step2Interview.jsx`, `Step3Report.jsx`.
- **`/pages/`**: Main route components representing different views.
  - *Examples*: `Home.jsx`, `Auth.jsx`, `AiChat.jsx`, `AvatarInterview.jsx`, `UploadResume.jsx`, `InterviewHistory.jsx`.
- **`/context/`**: React Context providers for global state (e.g., Auth, Theme).
- **`/redux/`**: Redux store configuration and slices for complex state management.
- **`/utils/`**: Helper functions and utility classes.

### Frontend Workflow
1. **Routing**: Handled by `react-router-dom`. Routes are protected using `ProtectedRoute.jsx`.
2. **State**: Application state is split between local component state, Context API (for global non-frequent updates), and Redux (for complex shared state).
3. **API Integration**: Axios is used to communicate with the Node.js backend.
4. **Real-time**: Socket.IO is used in features like the AI Chat and real-time Avatar Interview to stream data without HTTP overhead.

---

## 3. Server Architecture (Backend)

The backend is a robust Node.js/Express service designed to handle authentication, file processing, AI orchestration, and database operations.

### Technology Stack
- **Core**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ORM)
- **Authentication**: JSON Web Tokens (JWT), Crypto
- **File Upload & Processing**: Multer, PDF-Parse, pdfjs-dist, Mammoth (for Word docs), Tesseract.js (for OCR)
- **Real-Time Communication**: Socket.io
- **AI Integration**: Custom services communicating with OpenRouter (`openRouter.service.js`)
- **Payments**: Razorpay

### Directory Structure (`/server/`)
- **`/config/`**: Configuration files (e.g., database connection).
- **`/controllers/`**: Contains the business logic for each route.
  - *Examples*: `auth.controller.js`, `interview.controller.js`, `avatar.controller.js`, `payment.controller.js`.
- **`/models/`**: Mongoose schemas defining the data structure in MongoDB.
  - *Examples*: `user.model.js`, `interview.model.js`, `resumeAnalysis.model.js`.
- **`/routes/`**: API endpoint definitions, mapping HTTP methods/URLs to specific controllers.
  - *Examples*: `auth.route.js`, `interview.route.js`, `avatar.route.js`.
- **`/middlewares/`**: Functions executed before the controller to validate requests.
  - *Examples*: `isAuth.js` (JWT verification), `multer.js` (file upload handling).
- **`/services/`**: Independent modules handling third-party integrations or complex logic.
  - *Examples*: `openRouter.service.js` (LLM communication), `razorpay.service.js`.
- **`/public/`**: Static files served by the backend (if any).

### Backend Workflow
1. **Request Lifecycle**: 
   - Client sends an HTTP request.
   - The request hits the Express Router (`/routes`).
   - Router passes the request through necessary middlewares (e.g., `isAuth` for protected routes, `multer` for file uploads).
   - Middleware forwards the request to the designated Controller.
   - Controller executes business logic, often interacting with Models (MongoDB) or Services (AI/Payments).
   - Controller returns a JSON response to the client.
2. **Real-time Pipeline**: For AI interviews, a WebSocket connection is established. The server streams speech-to-text, manages translation, and returns AI responses dynamically.

---

## 4. Communication & Integration

- **RESTful API**: Standard communication for CRUD operations (User profiles, fetching history, initiating payments).
- **WebSockets**: Used for the immersive AI Interview Room (`AvatarInterview.jsx`) to handle bi-directional, low-latency communication (speech text streaming, AI responses).
- **Authentication Flow**:
  1. Client sends login/signup credentials.
  2. Server validates, generates a JWT, and sends it back (usually in an HTTP-only cookie or response body).
  3. Client includes this token in subsequent protected requests.
  4. Backend `isAuth.js` middleware validates the token before proceeding.

---

## 5. Full Directory Tree Diagram

Below is the comprehensive directory structure for the SmartHireAI project:

```text
SmartHireAI/
├── client/                 # Frontend React Application
│   ├── public/
│   ├── src/
│   │   ├── assets/         # Images, icons, and static assets
│   │   ├── components/     # Reusable UI components
│   │   │   ├── AuthModel.jsx
│   │   │   ├── ErrorBoundary.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── Step1SetUp.jsx
│   │   │   ├── Step2Interview.jsx
│   │   │   ├── Step3Report.jsx
│   │   │   └── Timer.jsx
│   │   ├── context/        # React Context (Theme, Auth, etc.)
│   │   ├── pages/          # Main route pages
│   │   │   ├── About.jsx
│   │   │   ├── AiChat.jsx
│   │   │   ├── Auth.jsx
│   │   │   ├── AvatarInterview.jsx
│   │   │   ├── Contact.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── InterviewHistory.jsx
│   │   │   ├── InterviewPage.jsx
│   │   │   ├── InterviewReport.jsx
│   │   │   ├── Pricing.jsx
│   │   │   ├── PrivacyPolicy.jsx
│   │   │   ├── ResumeReport.jsx
│   │   │   ├── TermsOfService.jsx
│   │   │   └── UploadResume.jsx
│   │   ├── redux/          # Redux State Management
│   │   ├── utils/          # Helper Functions
│   │   ├── App.jsx         # Main App Component
│   │   ├── index.css       # Global Tailwind CSS styles
│   │   └── main.jsx        # App Entry Point
│   ├── .env
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/                 # Backend Node.js Application
│   ├── config/             # Environment & DB Configs
│   ├── controllers/        # Business Logic Handlers
│   │   ├── auth.controller.js
│   │   ├── avatar.controller.js
│   │   ├── chat.controller.js
│   │   ├── contact.controller.js
│   │   ├── interview.controller.js
│   │   ├── payment.controller.js
│   │   └── user.controller.js
│   ├── middlewares/        # Express Middlewares
│   │   ├── isAuth.js       # JWT Validation
│   │   └── multer.js       # File Upload Handling
│   ├── models/             # MongoDB Schemas (Mongoose)
│   │   ├── chat.model.js
│   │   ├── contact.model.js
│   │   ├── interview.model.js
│   │   ├── payment.model.js
│   │   ├── resumeAnalysis.model.js
│   │   └── user.model.js
│   ├── routes/             # API Endpoints
│   │   ├── auth.route.js
│   │   ├── avatar.route.js
│   │   ├── chat.route.js
│   │   ├── contact.route.js
│   │   ├── interview.route.js
│   │   ├── payment.route.js
│   │   └── user.route.js
│   ├── services/           # External API & Core Services
│   │   ├── openRouter.service.js
│   │   └── razorpay.service.js
│   ├── public/             # Static Assets (if any)
│   ├── test/               # Test Files
│   ├── .env
│   ├── index.js            # Server Entry Point
│   └── package.json
│
├── docs/                   # Documentation Folder
│   ├── architecture.md     # System Architecture (This File)
│   ├── coding.txt
│   ├── Final_Project_Report.md
│   └── interview_feedback_plan.md
│
├── .gitignore
└── README.md               # Main Project Details
```
