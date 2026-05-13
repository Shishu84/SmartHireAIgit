# SmartHire AI 🚀

SmartHire AI is a state-of-the-art, AI-powered mock interview platform designed to empower job seekers by providing a realistic, data-driven interview preparation experience. Leveraging advanced Large Language Models (LLMs), SmartHire AI offers personalized interview sessions, real-time feedback, and comprehensive performance analytics to help you land your dream job.

![SmartHire AI Overview](client/src/assets/img1.png)

---

## 🌟 Overview

In today's competitive job market, preparation is key. **SmartHire AI** bridges the gap between traditional study and real-world interviews. Our platform analyzes your unique profile—extracted directly from your resume—to generate role-specific, challenging questions. Whether you are a fresh graduate or a seasoned professional, SmartHire AI provides the tools to refine your communication, boost your confidence, and master the technical nuances of your field.

---

## ✨ Key Features

- **📄 AI Resume Analysis**: Intelligently parses PDF, Word, and Image-based resumes to extract skills, experience, and projects using OCR (Tesseract.js) and specialized extractors.
- **🤖 Dynamic AI Interviews**: Experience high-fidelity, role-specific interview sessions with questions tailored to your experience level and domain.
- **🧑‍💻 Real-Time Avatar Interviews** *(Roadmap)*: Animated, lip-synced AI avatar powered by Three.js/Ready Player Me with real-time speech and gestures.
- **🌐 Multilingual Support (Hindi ↔ English)** *(Roadmap)*: Seamless bilingual interviewing using Whisper STT, Google Translate, and Azure TTS.
- **📊 Professional Feedback Reports**: Receive a detailed breakdown of your performance, focusing on key metrics like **Confidence**, **Communication**, and **Correctness**.
- **📈 Progress Tracking**: Monitor your growth over time with a centralized dashboard showcasing historical scores and interview trends.
- **💳 Integrated Credit System**: Manage interview attempts through a secure credit system, powered by **Razorpay** for seamless transactions.
- **📄 PDF Export**: Generate and download professional PDF reports of your interview results for offline review or sharing.
- **🔐 Secure Authentication**: Robust user management and authentication powered by **Firebase** and **JWT**.

---

## 🏗️ Architecture & Tech Stack

SmartHire AI is built using a modern MERN-like stack, optimized for performance and scalability.

### Frontend
- **Framework**: [React 19](https://react.dev/) with [Vite](https://vitejs.dev/)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Visualizations**: [Recharts](https://recharts.org/) for performance analytics.
- **Utilities**: [jsPDF](https://github.com/parallax/jsPDF) for report generation, [Axios](https://axios-http.com/) for API communication.

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/) ORM.
- **AI Integration**: [OpenRouter](https://openrouter.ai/) (GPT-4o-mini) for intelligent question generation and evaluation.
- **Parsing Engines**: [Tesseract.js](https://tesseract.projectnaptha.com/) (OCR), [Mammoth](https://github.com/mwilliamson/mammoth.js) (Docx), [pdf-parse](https://www.npmjs.com/package/pdf-parse).
- **Security**: [JSON Web Tokens (JWT)](https://jwt.io/) & [Cookie-parser](https://github.com/expressjs/cookie-parser).

---

## 🧠 Extended Architecture: Real-Time Avatar Interviews *(Roadmap)*

This section documents the planned extension to transform SmartHire AI into a fully immersive, real-time, multilingual avatar interview platform.

### 1. 🖥️ Frontend (React + Vite) Enhancements

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| Live Video/Audio | **WebRTC** | Peer-to-peer candidate ↔ avatar streaming |
| Avatar Rendering | **Three.js** / **Ready Player Me** / **DeepBrain AI** | 3D avatar display with real-time animation |
| Language Toggle | **react-i18next** | Seamless Hindi ↔ English UI switching |
| Real-Time Events | **Socket.IO Client** | Speech recognition, translation, and avatar sync |
| Gestures & Transitions | **Framer Motion** | Smooth avatar gesture animations |

### 2. ⚙️ Backend (Node.js + Express) New API Routes

```
POST /api/speech-to-text   → Hindi/English transcription (Whisper API / Google STT)
POST /api/translate         → Hindi ↔ English translation (Google Translate API)
POST /api/text-to-speech    → Natural voice generation (Azure TTS / Amazon Polly)
POST /api/avatar-sync       → Map audio to visemes for real-time lip sync
WS   /socket.io             → Low-latency bidirectional communication
```

> [!NOTE]
> All streaming sessions are protected by the existing JWT authentication system, extended to cover WebRTC session handshakes.

### 3. 🤖 AI Service Layer

```
Candidate Speech (Hindi/English)
        │
        ▼
┌───────────────────┐
│  Speech-to-Text   │  (Whisper API / Google STT)
│  (STT Engine)     │
└───────┬───────────┘
        │  Text Transcript
        ▼
┌───────────────────┐
│  Translation      │  (Google Translate API)
│  Engine           │
└───────┬───────────┘
        │  Translated Text
        ▼
┌───────────────────┐
│  Text-to-Speech   │  (Azure TTS / Amazon Polly)
│  (TTS Engine)     │
└───────┬───────────┘
        │  Audio Stream + Viseme Data
        ▼
┌───────────────────┐
│  Avatar Engine    │  (Three.js / Ready Player Me SDK)
│  (Lip Sync)       │
└───────────────────┘
        │  Animated Avatar
        ▼
   React Frontend
```

### 4. 🗄️ Database Schema Extensions (MongoDB)

The existing Mongoose schemas will be extended with the following fields:

```javascript
// InterviewSession Schema — new fields
{
  transcript: [
    {
      speaker:  { type: String, enum: ['candidate', 'ai'] },
      original: { type: String },   // Original spoken language
      translated: { type: String }, // Translated text
      language: { type: String },   // 'hi' | 'en'
      timestamp: { type: Date }
    }
  ],
  languagePreference: { type: String, default: 'en' }, // 'hi' | 'en'
  avatarConfig: {
    avatarId:   { type: String },
    voiceStyle: { type: String },
    theme:      { type: String }
  }
}
```

### 5. 📡 Streaming Infrastructure

- **WebRTC (P2P)**: Direct candidate ↔ interviewer avatar video streams.
- **Media Server** *(Optional)*: [Janus](https://janus.conf.meetecho.com/) or [Kurento](https://www.kurento.org/) for multi-party sessions or session recording.
- **CDN/Edge Delivery**: Global low-latency streaming for scalability.

### 🔄 End-to-End Workflow

```
1.  Candidate speaks in Hindi
         │
2.  STT → text (Hindi)
         │
3.  Translate → English text sent to AI evaluator
         │
4.  AI generates English response
         │
5.  Translate → Hindi text
         │
6.  TTS → Hindi audio + lip-sync viseme data
         │
7.  Avatar Engine → animated, lip-synced avatar speaks in Hindi
         │
8.  React frontend renders avatar with synced audio/video
```

### 🧩 Integration Map with Existing SmartHireAI Features

| Existing Feature | Enhancement |
| :--- | :--- |
| Dynamic AI Interviews | Add real-time avatar + full multilingual pipeline |
| Professional Feedback Reports | Include session transcript + translation accuracy metrics |
| Progress Tracking | Track language usage patterns and avatar engagement scores |
| Secure Authentication (JWT + Firebase) | Extended to authenticate live WebRTC video sessions |

---

## 🚀 Installation & Setup

Follow these steps to get a local copy up and running.

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: A running MongoDB instance (Local or Atlas)
- **API Keys**: OpenRouter, Razorpay, and Firebase credentials.

### 1. Clone the Repository
```bash
git clone https://github.com/Shishu84/SmartHireAI.git
cd SmartHireAI
```

### 2. Backend Configuration
Navigate to the `server` directory and install dependencies:
```bash
cd server
npm install
```
Create a `.env` file in the `server` folder:
```env
PORT=8000
MONGODB_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
OPENROUTER_API_KEY=your_openrouter_api_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
```
Start the development server:
```bash
npm run dev
```

### 3. Frontend Configuration
Navigate to the `client` directory and install dependencies:
```bash
cd ../client
npm install
```
Create a `.env` file in the `client` folder:
```env
VITE_FIREBASE_APIKEY=your_firebase_api_key
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```
Start the frontend application:
```bash
npm run dev
```

---

## 💡 Usage Guide

1. **Onboarding**: Create an account or log in via Google/Email.
2. **Setup**: Navigate to the "Start Interview" section and upload your resume.
3. **Customization**: Select your target job role and experience level (Entry, Mid, Senior).
4. **The Interview**: Answer the AI-generated questions. Be mindful of the timer!
5. **Review**: Once completed, the AI will analyze your responses and generate a comprehensive score.
6. **Analytics**: Check your profile to see how your scores improve over time.

---

## ⚙️ Configuration

| Variable | Description | Source |
| :--- | :--- | :--- |
| `MONGODB_URL` | Connection string for MongoDB | [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) |
| `OPENROUTER_API_KEY` | API Key for LLM access | [OpenRouter](https://openrouter.ai/) |
| `RAZORPAY_KEY_ID` | Public key for payment gateway | [Razorpay Dashboard](https://dashboard.razorpay.com/) |
| `JWT_SECRET` | Secret key for signing tokens | User Defined |
| `VITE_FIREBASE_APIKEY` | Firebase Client API Key | [Firebase Console](https://console.firebase.google.com/) |

---

## 📸 Screenshots & Demos

> [!NOTE]
> Add your project screenshots or a link to a video demo here to showcase the UI.

- **Dashboard**: `[Link or Image]`
- **Interview Room**: `[Link or Image]`
- **Analysis Report**: `[Link or Image]`

---

## 🤝 Contributing

We welcome contributions from the community! To contribute:

1. **Fork** the repository.
2. **Create** a new branch: `git checkout -b feature/your-feature-name`.
3. **Commit** your changes: `git commit -m 'Add some feature'`.
4. **Push** to the branch: `git push origin feature/your-feature-name`.
5. **Open** a Pull Request.

Please ensure your code follows the project's coding standards and includes appropriate tests.

---

## 📄 License

This project is licensed under the **ISC License**. See the `package.json` for details.

---

## 🙏 Acknowledgments

- **OpenRouter** for providing access to cutting-edge AI models.
- **Tailwind CSS** for the beautiful utility-first styling.
- **Lucide React** & **React Icons** for the sleek iconography.
- **Framer Motion** for the fluid animations.

---

## 👥 Meet the Team

*   **Shishu Kumar** ([@Shishu84](https://github.com/Shishu84)) - Lead Developer & Backend Architect
*   **Anish Anand** ([@AnishAnand05](https://github.com/AnishAnand05)) - AI Model Integration Specialist
*   **Mayank** ([@mayank4020](https://github.com/mayank4020)) - UI/UX Designer & Frontend Developer
*   **Tinku Kumar** ([@tinku-05](https://github.com/tinku-05)) - Database Management & DevOps

---
Developed with ❤️ by the **SmartHire AI Team**
