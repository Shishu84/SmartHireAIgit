# SmartHire AI 🚀

SmartHire AI is an advanced, AI-powered mock interview platform designed to help candidates prepare for their dream jobs. By leveraging cutting-edge LLMs and real-time evaluation, SmartHire AI provides a realistic interview experience, detailed feedback, and performance analytics.

![SmartHire AI Overview](client/src/assets/img1.png)

## ✨ Key Features

- **📄 AI Resume Analysis**: Automatically extract skills, experience, and projects from your resume (PDF) to tailor the interview.
- **🤖 Realistic AI Interviews**: Experience dynamic, role-specific questions generated in real-time based on your profile and experience level.
- **📊 Detailed Performance Reports**: Get comprehensive feedback on your answers, focusing on **Confidence**, **Communication**, and **Correctness**.
- **📈 Interview Analytics**: Track your progress over time with a historical view of all your past interviews and scores.
- **💳 Credits System**: Manage your interview attempts with a built-in credit system, integrated with **Razorpay** for seamless top-ups.
- **📄 PDF Export**: Download your interview reports as professional PDFs for offline review.
- **🔐 Secure Authentication**: Integrated with Firebase for secure and easy user authentication.

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Charts**: [Recharts](https://recharts.org/)
- **PDF Generation**: [jsPDF](https://github.com/parallax/jsPDF)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (via [Mongoose](https://mongoosejs.com/))
- **AI Engine**: [OpenRouter](https://openrouter.ai/) (using GPT-4o-mini)
- **File Handling**: [Multer](https://github.com/expressjs/multer)
- **Payments**: [Razorpay](https://razorpay.com/)

---

## 📂 Project Structure

```text
SmartHireAI/
├── client/                # React Frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page views (Home, Interview, Pricing, etc.)
│   │   ├── redux/         # Global state management
│   │   └── utils/         # Helper functions
│   └── public/            # Static assets
└── server/                # Node.js Backend
    ├── config/            # Database and other configurations
    ├── controllers/       # Route logic & AI orchestration
    ├── models/            # Mongoose schemas
    ├── routes/            # API endpoints
    ├── services/          # External API integrations (OpenRouter)
    └── middlewares/       # Auth and file upload middlewares
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB account (Atlas or Local)
- OpenRouter API Key
- Razorpay Key (for payments)
- Firebase Project (for Auth)

### 1. Clone the repository
```bash
git clone https://github.com/Shishu84/SmartHireAI.git
cd SmartHireAI
```

### 2. Setup Server
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory:
```env
PORT=8000
MONGODB_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
OPENROUTER_API_KEY=your_openrouter_api_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
```
Run the server:
```bash
npm run dev
```

### 3. Setup Client
```bash
cd ../client
npm install
```
Create a `.env` file in the `client` directory:
```env
VITE_FIREBASE_APIKEY=your_firebase_api_key
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```
Run the client:
```bash
npm run dev
```

---

## 💡 Usage

1. **Sign Up/Login**: Create an account using the Auth page.
2. **Dashboard**: View your current credits and past interview history.
3. **Start Interview**: Upload your resume, select your role and experience level.
4. **Interview Session**: Answer 5 AI-generated questions. Each question has a time limit and difficulty level.
5. **Get Feedback**: After finishing, view a detailed breakdown of your performance with AI-driven insights.
6. **Top up**: If you run out of credits, visit the pricing page to add more via Razorpay.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the ISC License. See `LICENSE` for more information (if applicable).

---
+## 👥 Team Members
+
+*   **Shishu Kumar** ([@Shishu84](https://github.com/Shishu84)) - Lead Developer
+*   **[Anish Anand]** ([@username](https://github.com/username)) - [Role/Contribution]
+*   **[Mayank]** ([@mayank4020](https://github.com/mayank4020)) - [Role/Contribution]
+*   **[Tinku kumar]** ([@](https://github.com/username)) - [Role/Contribution]

+---
+Developed with ❤️ by the SmartHire AI Team

