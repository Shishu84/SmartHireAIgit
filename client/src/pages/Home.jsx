import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from "motion/react";
import {
  BsRobot,
  BsMic,
  BsClock,
  BsBarChart,
  BsFileEarmarkText,
  BsArrowRight,
  BsLightning,
  BsShield,
  BsStar
} from "react-icons/bs";
import { HiSparkles } from "react-icons/hi";
import { useNavigate } from 'react-router-dom';
import AuthModel from '../components/AuthModel';
import hrImg from "../assets/HR.png";
import techImg from "../assets/tech.png";
import confidenceImg from "../assets/confi.png";
import creditImg from "../assets/credit.png";
import evalImg from "../assets/ai-ans.png";
import resumeImg from "../assets/resume.png";
import pdfImg from "../assets/pdf.png";
import analyticsImg from "../assets/history.png";

const sectionAnim = { initial: { opacity: 0, y: 40 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.2 }, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } };

function Home() {
  const { userData } = useSelector((state) => state.user);
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate();

  const guardedNav = (path) => {
    if (!userData) { setShowAuth(true); return; }
    navigate(path);
  };

  return (
    <div className='flex flex-col w-full text-gray-900 dark:text-gray-100 transition-colors duration-300'>

      {/* ─────────────── HERO SECTION ─────────────── */}
      <section className='relative overflow-hidden'>
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-purple-400/10 dark:bg-purple-500/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-cyan-400/10 dark:bg-cyan-500/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-300/5 dark:bg-purple-400/3 rounded-full blur-[100px]" />
        </div>

        <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-28 pb-20 sm:pb-32'>
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='flex justify-center mb-8'
          >
            <div className='animate-float glass dark:glass-dark px-5 py-2.5 rounded-full flex items-center gap-2.5 shadow-lg shadow-purple-500/30'>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse-ring" />
              <span className='text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 tracking-wide'>Authentic AI Interview Practice</span>
              <HiSparkles size={14} className="text-purple-500" />
            </div>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className='text-center mb-8'
          >
            <h1 className='text-4xl sm:text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight max-w-5xl mx-auto'>
              <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                Elevate Your
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-600 via-purple-500 to-teal-500 dark:from-purple-400 dark:via-purple-300 dark:to-teal-400 bg-clip-text text-transparent">
                Interview Confidence
              </span>
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className='text-gray-500 dark:text-gray-400 text-center max-w-2xl mx-auto text-base sm:text-lg leading-relaxed mb-10 px-4'
          >
            Experience realistic, role-specific mock interviews powered by AI. Get actionable feedback on your communication, technical accuracy, and presentation to help you succeed in your next real interview.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className='flex flex-col sm:flex-row justify-center gap-4 px-6 mb-16'
          >
            <motion.button
              onClick={() => guardedNav("/avatar-interview")}
              whileHover={{ scale: 1.04, boxShadow: "0 20px 40px -12px rgba(16,185,129,0.3)" }}
              whileTap={{ scale: 0.97 }}
              className='group bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white px-8 py-4 rounded-2xl font-semibold text-base shadow-lg shadow-purple-500/30 transition-all w-full sm:w-auto flex items-center justify-center gap-3'
            >
              <BsLightning size={18} />
              Start Practice Session
              <BsArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </motion.button>
            <motion.button
              onClick={() => guardedNav("/history")}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className='glass dark:glass-dark px-8 py-4 rounded-2xl font-semibold text-base text-gray-700 dark:text-gray-200 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all w-full sm:w-auto'
            >
              View Dashboard
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* ─────────────── HOW IT WORKS ─────────────── */}
      <section className='py-20 sm:py-32 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-7xl mx-auto'>
          <motion.div {...sectionAnim} className='text-center mb-16'>
            <div className='inline-flex items-center gap-2 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-4'>
              <BsStar size={12} /> The Workflow
            </div>
            <h2 className='text-3xl sm:text-5xl font-extrabold tracking-tight dark:text-white'>
              Structured <span className="text-purple-600 dark:text-purple-400">Preparation</span>
            </h2>
            <p className='text-gray-500 dark:text-gray-400 mt-4 max-w-lg mx-auto text-sm sm:text-base'>A straightforward process designed to maximize your learning and readiness.</p>
          </motion.div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8'>
            {[
              { icon: <BsRobot size={26} />, step: "01", title: "Select Role & Resume", desc: "Upload your resume and choose the specific job title you are targeting to ensure relevant technical questions.", color: "from-purple-500 to-teal-500" },
              { icon: <BsMic size={26} />, step: "02", title: "Interactive AI Session", desc: "Engage in a live, voice-enabled conversation where the AI listens, understands context, and asks follow-up questions.", color: "from-cyan-500 to-blue-500" },
              { icon: <BsClock size={26} />, step: "03", title: "Actionable Insights", desc: "Receive an immediate, detailed breakdown highlighting your strengths and areas needing improvement before your actual interview.", color: "from-violet-500 to-purple-500" }
            ].map((item, index) => (
              <motion.div key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                whileHover={{ y: -8 }}
                className='group relative bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-8 sm:p-10 shadow-sm hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-500'
              >
                {/* Step number watermark */}
                <div className='absolute top-6 right-8 text-7xl font-black text-gray-100 dark:text-slate-800/60 select-none transition-colors group-hover:text-purple-50 dark:group-hover:text-purple-900/20'>
                  {item.step}
                </div>

                <div className={`relative w-14 h-14 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center text-white shadow-lg mb-6`}>
                  {item.icon}
                </div>

                <h3 className='relative font-bold text-xl mb-3 dark:text-white'>{item.title}</h3>
                <p className='relative text-gray-500 dark:text-gray-400 text-sm leading-relaxed'>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────── AI CAPABILITIES (Bento Grid) ─────────────── */}
      <section className='py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900/50 transition-colors'>
        <div className='max-w-7xl mx-auto'>
          <motion.div {...sectionAnim} className='text-center mb-16'>
            <div className='inline-flex items-center gap-2 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-4'>
              <HiSparkles size={12} /> Platform Features
            </div>
            <h2 className='text-3xl sm:text-5xl font-extrabold tracking-tight dark:text-white'>
              Engineered for <span className="text-purple-600 dark:text-purple-400">Growth</span>
            </h2>
            <p className='text-gray-500 dark:text-gray-400 mt-4 max-w-lg mx-auto text-sm sm:text-base'>Tools and analytics designed entirely around candidate improvement and feedback.</p>
          </motion.div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8'>
            {[
              { image: evalImg, icon: <BsBarChart size={20} />, title: "Contextual Evaluation", desc: "Provides analysis on your responses, evaluating technical depth, clarity, and relevance to the prompted question.", accent: "purple" },
              { image: resumeImg, icon: <BsFileEarmarkText size={20} />, title: "Dynamic Resume Parsing", desc: "Extracts your listed projects and experiences to formulate customized, realistic interview scenarios.", accent: "cyan" },
              { image: pdfImg, icon: <BsFileEarmarkText size={20} />, title: "Comprehensive Exporting", desc: "Download your complete interview transcript alongside AI-generated improvement notes in a clean PDF format.", accent: "violet" },
              { image: analyticsImg, icon: <BsBarChart size={20} />, title: "Performance Dashboard", desc: "Review your past interview attempts, analyze recurring feedback, and track your ongoing preparation journey.", accent: "amber" }
            ].map((item, index) => (
              <motion.div key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -6 }}
                className='group bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-500 overflow-hidden'
              >
                <div className='flex flex-col sm:flex-row items-center gap-6 sm:gap-8'>
                  <div className='w-full sm:w-[45%] flex justify-center'>
                    <div className='relative'>
                      <div className={`absolute inset-0 bg-${item.accent}-400/10 dark:bg-${item.accent}-400/5 rounded-3xl blur-2xl scale-75 group-hover:scale-100 transition-transform duration-500`} />
                      <img src={item.image} alt={item.title} className='relative w-40 sm:w-full h-auto object-contain max-h-48 sm:max-h-56 transition-transform duration-500 group-hover:scale-105' />
                    </div>
                  </div>
                  <div className='w-full sm:w-[55%] text-center sm:text-left'>
                    <div className='bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 mx-auto sm:mx-0 shadow-sm'>
                      {item.icon}
                    </div>
                    <h3 className='font-bold text-lg sm:text-xl mb-2 dark:text-white'>{item.title}</h3>
                    <p className='text-gray-500 dark:text-gray-400 text-sm leading-relaxed'>{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────── INTERVIEW MODES ─────────────── */}
      <section className='py-20 sm:py-32 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-7xl mx-auto'>
          <motion.div {...sectionAnim} className='text-center mb-16'>
            <div className='inline-flex items-center gap-2 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-4'>
              <BsShield size={12} /> Practice Types
            </div>
            <h2 className='text-3xl sm:text-5xl font-extrabold tracking-tight dark:text-white'>
              Versatile <span className="text-purple-600 dark:text-purple-400">Scenarios</span>
            </h2>
            <p className='text-gray-500 dark:text-gray-400 mt-4 max-w-lg mx-auto text-sm sm:text-base'>Different formats to ensure you are ready for any type of conversational evaluation.</p>
          </motion.div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8'>
            {[
              { img: hrImg, title: "Behavioral & HR", desc: "Focuses on culture fit, past experiences, conflict resolution, and teamwork questions.", tag: "Culture Fit" },
              { img: techImg, title: "Technical Expertise", desc: "Tests knowledge on specific programming languages, frameworks, or domain methodologies.", tag: "Domain Skills" },
              { img: confidenceImg, title: "Communication Analysis", desc: "Evaluates the clarity, structure, and delivery of your verbal responses during the session.", tag: "Delivery" },
              { img: creditImg, title: "Flexible Access", desc: "Simple credit-based system to utilize AI generation and analysis resources when you need them.", tag: "Usage" }
            ].map((mode, index) => (
              <motion.div key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -6 }}
                className="group bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-500"
              >
                <div className='flex items-center justify-between gap-4'>
                  <div className="flex-1 min-w-0">
                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30 px-2.5 py-1 rounded-lg mb-3">{mode.tag}</span>
                    <h3 className="font-bold text-lg sm:text-xl mb-2 dark:text-white">{mode.title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{mode.desc}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <div className='relative'>
                      <img src={mode.img} alt={mode.title} className="w-20 h-20 sm:w-28 sm:h-28 object-contain transition-transform duration-500 group-hover:scale-110" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────── CTA BANNER ─────────────── */}
      <section className='px-4 sm:px-6 lg:px-8 pb-20 sm:pb-32'>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className='relative max-w-7xl mx-auto overflow-hidden rounded-[2rem] sm:rounded-[2.5rem]'
        >
          {/* Background */}
          <div className='absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-purple-950 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950' />
          <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.15),transparent_60%)]' />
          <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(6,182,212,0.1),transparent_60%)]' />

          {/* Grid pattern overlay */}
          <div className='absolute inset-0 opacity-[0.03]' style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />

          <div className='relative z-10 py-16 sm:py-24 px-8 sm:px-16 text-center'>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className='text-3xl sm:text-5xl font-extrabold text-white mb-5 tracking-tight leading-tight'>
                Take the pressure out of<br className='hidden sm:block' /> your preparation.
              </h2>
              <p className='text-gray-400 mb-10 text-sm sm:text-lg max-w-xl mx-auto leading-relaxed'>
                Start practicing with realistic scenarios, receive actionable insights, and build the confidence you need.
              </p>
              <motion.button
                onClick={() => guardedNav("/avatar-interview")}
                whileHover={{ scale: 1.05, boxShadow: "0 20px 60px -12px rgba(16,185,129,0.4)" }}
                whileTap={{ scale: 0.95 }}
                className='group relative overflow-hidden bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white px-10 sm:px-14 py-4 sm:py-5 rounded-2xl font-bold text-base sm:text-lg shadow-2xl shadow-purple-500/30 transition-all w-full sm:w-auto'
              >
                <span className='animate-shimmer absolute inset-0 rounded-2xl' />
                <span className='relative flex items-center justify-center gap-3'>
                  Try a Mock Interview
                  <BsArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </span>
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}
    </div>
  )
}

export default Home
