import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { motion } from "motion/react";
import {
  BsRobot,
  BsMic,
  BsClock,
  BsBarChart,
  BsFileEarmarkText
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

function Home() {
  const { userData } = useSelector((state) => state.user)
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate()

  const guardedNav = (path) => {
    if (!userData) { setShowAuth(true); return; }
    navigate(path);
  }

  return (
    <div className='min-h-screen bg-[#f3f3f3] dark:bg-slate-900 flex flex-col transition-colors duration-300 text-gray-900 dark:text-gray-100'>

      <div className='flex-1 px-4 sm:px-6 py-12 sm:py-20'>
        <div className='max-w-6xl mx-auto'>

          {/* Badge */}
          <div className='flex justify-center mb-6'>
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
              className='animate-float bg-gray-100 text-gray-600 text-xs sm:text-sm px-4 py-2 rounded-full flex items-center gap-2 shadow-sm'
            >
              <HiSparkles size={16} className="text-green-600" />
              AI Powered Smart Interview Platform
            </motion.div>
          </div>

          {/* Hero */}
          <div className='text-center mb-16 sm:mb-28'>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className='text-3xl sm:text-4xl md:text-6xl font-semibold leading-tight max-w-4xl mx-auto px-2 dark:text-white'>
              Practice Interviews with{" "}
              <span className='inline-block mt-1 sm:mt-0'>
                <span className='bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 px-4 sm:px-5 py-1 rounded-full'>
                  AI Intelligence
                </span>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className='text-gray-500 dark:text-gray-400 mt-5 max-w-xl mx-auto text-base sm:text-lg px-4'>
              Role-based mock interviews with smart follow-ups,
              adaptive difficulty and real-time performance evaluation.
            </motion.p>

            <div className='flex flex-col sm:flex-row justify-center gap-3 mt-8 px-6'>
              <motion.button
                onClick={() => guardedNav("/avatar-interview")}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className='bg-black text-white dark:bg-white dark:text-black px-8 py-3 rounded-full hover:opacity-90 transition shadow-md w-full sm:w-auto'>
                Start Interview
              </motion.button>
              <motion.button
                onClick={() => guardedNav("/history")}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className='border border-gray-300 dark:border-gray-600 px-8 py-3 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition w-full sm:w-auto'>
                View History
              </motion.button>
            </div>
          </div>

          {/* Steps Section */}
          <div className='flex flex-col sm:flex-row justify-center items-center gap-8 sm:gap-10 mb-20 sm:mb-28 px-4'>
            {[
              { icon: <BsRobot size={24} />, step: "STEP 1", title: "Role & Experience Selection", desc: "AI adjusts difficulty based on selected job role." },
              { icon: <BsMic size={24} />, step: "STEP 2", title: "Smart Voice Interview", desc: "Dynamic follow-up questions based on your answers." },
              { icon: <BsClock size={24} />, step: "STEP 3", title: "Timer Based Simulation", desc: "Real interview pressure with time tracking." }
            ].map((item, index) => (
              <motion.div key={index}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 + index * 0.2 }}
                whileHover={{ scale: 1.04 }}
                className={`
                  relative bg-white dark:bg-slate-800 rounded-3xl border-2 border-green-100 dark:border-slate-700 
                  hover:border-green-500 p-8 sm:p-10 w-full sm:w-72 shadow-md hover:shadow-2xl 
                  transition-all duration-300
                  ${index === 0 ? "sm:rotate-[-4deg]" : ""}
                  ${index === 1 ? "sm:rotate-[3deg] sm:-mt-6 shadow-xl" : ""}
                  ${index === 2 ? "sm:rotate-[-3deg]" : ""}
                `}>
                <div className='absolute -top-8 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 border-2 border-green-500 text-green-600 dark:text-green-400 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg'>
                  {item.icon}
                </div>
                <div className='pt-10 text-center'>
                  <div className='text-xs text-green-600 dark:text-green-400 font-semibold mb-2 tracking-wider'>{item.step}</div>
                  <h3 className='font-semibold mb-3 text-base sm:text-lg dark:text-white'>{item.title}</h3>
                  <p className='text-sm text-gray-500 dark:text-gray-400 leading-relaxed'>{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* AI Capabilities */}
          <div className='mb-20 sm:mb-32'>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className='text-2xl sm:text-4xl font-semibold text-center mb-10 sm:mb-16 dark:text-white'>
              Advanced AI <span className="text-green-600 dark:text-green-400">Capabilities</span>
            </motion.h2>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10'>
              {[
                { image: evalImg, icon: <BsBarChart size={20} />, title: "AI Answer Evaluation", desc: "Scores communication, technical accuracy and confidence." },
                { image: resumeImg, icon: <BsFileEarmarkText size={20} />, title: "Resume Based Interview", desc: "Project-specific questions based on uploaded resume." },
                { image: pdfImg, icon: <BsFileEarmarkText size={20} />, title: "Downloadable PDF Report", desc: "Detailed strengths, weaknesses and improvement insights." },
                { image: analyticsImg, icon: <BsBarChart size={20} />, title: "History & Analytics", desc: "Track progress with performance graphs and topic analysis." }
              ].map((item, index) => (
                <motion.div key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className='card-glow bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-3xl p-6 sm:p-8 shadow-sm transition-all'>
                  <div className='flex flex-col sm:flex-row items-center gap-6 sm:gap-8'>
                    <div className='w-full sm:w-1/2 flex justify-center'>
                      <img src={item.image} alt={item.title} className='w-40 sm:w-full h-auto object-contain max-h-48 sm:max-h-64' />
                    </div>
                    <div className='w-full sm:w-1/2 text-center sm:text-left'>
                      <div className='bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto sm:mx-0'>
                        {item.icon}
                      </div>
                      <h3 className='font-semibold mb-2 text-lg sm:text-xl dark:text-white'>{item.title}</h3>
                      <p className='text-gray-500 dark:text-gray-400 text-sm leading-relaxed'>{item.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Interview Modes */}
          <div className='mb-20 sm:mb-32'>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className='text-2xl sm:text-4xl font-semibold text-center mb-10 sm:mb-16 dark:text-white'>
              Multiple Interview <span className="text-green-600 dark:text-green-400">Modes</span>
            </motion.h2>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10'>
              {[
                { img: hrImg, title: "HR Interview Mode", desc: "Behavioral and communication based evaluation." },
                { img: techImg, title: "Technical Mode", desc: "Deep technical questioning based on selected role." },
                { img: confidenceImg, title: "Confidence Detection", desc: "Basic tone and voice analysis insights." },
                { img: creditImg, title: "Credits System", desc: "Unlock premium interview sessions easily." }
              ].map((mode, index) => (
                <motion.div key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -6 }}
                  className="card-glow bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-3xl p-6 sm:p-8 shadow-sm transition-all">
                  <div className='flex items-center justify-between gap-4'>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg sm:text-xl mb-2 dark:text-white">{mode.title}</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{mode.desc}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <img src={mode.img} alt={mode.title} className="w-20 h-20 sm:w-28 sm:h-28 object-contain" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTA Banner */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className='relative overflow-hidden bg-black dark:bg-slate-800 border border-transparent dark:border-slate-700 text-white rounded-3xl p-8 sm:p-12 text-center mb-10'>
            {/* Subtle animated gradient overlay */}
            <div className='absolute inset-0 bg-gradient-to-r from-emerald-900/20 via-transparent to-emerald-900/20 animate-gradient-x pointer-events-none rounded-3xl' />
            <div className='relative z-10'>
              <h2 className='text-2xl sm:text-4xl font-semibold mb-4'>Ready to ace your next interview?</h2>
              <p className='text-gray-400 mb-8 text-sm sm:text-base max-w-lg mx-auto'>
                Join thousands of candidates improving their interview skills with AI-powered coaching.
              </p>
              <motion.button
                onClick={() => guardedNav("/avatar-interview")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className='relative overflow-hidden bg-white text-black px-8 sm:px-10 py-3 rounded-full font-semibold hover:bg-gray-100 transition w-full sm:w-auto btn-press'>
                <span className='animate-shimmer absolute inset-0 rounded-full' />
                <span className='relative'>Start Free Practice</span>
              </motion.button>
            </div>
          </motion.div>

        </div>
      </div>

      {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}
    </div>
  )
}

export default Home
