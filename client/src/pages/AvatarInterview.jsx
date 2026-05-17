import React, { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { motion, AnimatePresence } from 'motion/react'
import { FaMicrophone, FaMicrophoneSlash, FaCloudUploadAlt, FaSpinner, FaCheck } from 'react-icons/fa'
import { BsGlobe2, BsArrowRight } from 'react-icons/bs'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import maleVideo from '../assets/videos/male-ai.mp4'
import femaleVideo from '../assets/videos/female-ai.mp4'
import { ServerUrl } from '../App'

const SOCKET_URL = 'http://localhost:8000'

export default function AvatarInterview() {
  const navigate = useNavigate()
  const [language, setLanguage] = useState('en')
  const [phase, setPhase] = useState('setup') // setup | active | done
  const [isMicOn, setIsMicOn] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [avatarReply, setAvatarReply] = useState('')
  const [isAISpeaking, setIsAISpeaking] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [messages, setMessages] = useState([])
  const [role, setRole] = useState('')
  const [experience, setExperience] = useState('')
  const [currentQ, setCurrentQ] = useState('')
  const [qIndex, setQIndex] = useState(0)
  const [volumeLevel, setVolumeLevel] = useState(0)

  const [resumeFile, setResumeFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [dynamicQuestions, setDynamicQuestions] = useState([])

  const socketRef = useRef(null)
  const videoRef = useRef(null)
  const recognitionRef = useRef(null)
  const synthRef = useRef(window.speechSynthesis)
  const audioCtxRef = useRef(null)
  const analyserRef = useRef(null)
  const streamRef = useRef(null)
  const rafRef = useRef(null)
  
  const sampleQuestions = {
    en: [
      'Tell me about yourself and your background.',
      'What is your greatest professional strength?',
      'Describe a challenging project you worked on.',
      'How do you handle tight deadlines?',
      'Where do you see yourself in 5 years?',
    ],
    hi: [
      'अपने बारे में और अपनी पृष्ठभूमि के बारे में बताइए।',
      'आपकी सबसे बड़ी पेशेवर ताकत क्या है?',
      'किसी चुनौतीपूर्ण प्रोजेक्ट का वर्णन करें जिस पर आपने काम किया।',
      'आप कड़ी समयसीमाओं को कैसे संभालते हैं?',
      'आप खुद को 5 साल में कहाँ देखते हैं?',
    ],
  }
  
  // ── Socket.IO setup ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'active') return

    const socket = io(`${SOCKET_URL}/avatar-interview`, { withCredentials: true })
    socketRef.current = socket

    socket.on('avatar:reply', ({ text }) => {
      setAvatarReply(text)
      setMessages(prev => [...prev, { from: 'ai', text }])
      speakText(text)
    })

    socket.on('avatar:speaking_start', () => setIsAISpeaking(true))
    socket.on('avatar:speaking_end', () => setIsAISpeaking(false))

    socket.on('avatar:question_ready', ({ text }) => {
      setCurrentQ(text)
      setSubtitle(text)
      speakText(text)
    })

    return () => socket.disconnect()
  }, [phase])

  // ── Speech Recognition ───────────────────────────────────────────────────────
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return
    const rec = new SpeechRecognition()
    rec.continuous = true
    rec.interimResults = true
    rec.lang = language === 'hi' ? 'hi-IN' : 'en-US'
    rec.onresult = (e) => {
      const t = Array.from(e.results).map(r => r[0].transcript).join('')
      setTranscript(t)
    }
    recognitionRef.current = rec
    return () => rec.abort()
  }, [language])

  // ── Audio Visualizer ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isMicOn) {
      streamRef.current?.getTracks().forEach(t => t.stop())
      if (audioCtxRef.current?.state !== 'closed') audioCtxRef.current?.close()
      cancelAnimationFrame(rafRef.current)
      setVolumeLevel(0)
      return
    }
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      streamRef.current = stream
      const ctx = new AudioContext()
      audioCtxRef.current = ctx
      const analyser = ctx.createAnalyser()
      analyserRef.current = analyser
      ctx.createMediaStreamSource(stream).connect(analyser)
      const data = new Uint8Array(analyser.frequencyBinCount)
      const tick = () => {
        analyser.getByteFrequencyData(data)
        setVolumeLevel(data.reduce((a, b) => a + b, 0) / data.length)
        rafRef.current = requestAnimationFrame(tick)
      }
      tick()
    }).catch(() => {})
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop())
      cancelAnimationFrame(rafRef.current)
    }
  }, [isMicOn])

  // ── TTS ──────────────────────────────────────────────────────────────────────
  const speakText = (text) => {
    synthRef.current.cancel()
    const utt = new SpeechSynthesisUtterance(text)
    utt.lang = language === 'hi' ? 'hi-IN' : 'en-US'
    utt.rate = 0.92
    utt.pitch = 1.05
    utt.onstart = () => {
      setIsAISpeaking(true)
      setSubtitle(text)
      videoRef.current?.play()
    }
    utt.onend = () => {
      setIsAISpeaking(false)
      setSubtitle('')
      videoRef.current?.pause()
      if (videoRef.current) videoRef.current.currentTime = 0
    }
    synthRef.current.speak(utt)
  }

  const toggleMic = () => {
    if (isMicOn) {
      recognitionRef.current?.stop()
      setIsListening(false)
    } else {
      recognitionRef.current?.start()
      setIsListening(true)
    }
    setIsMicOn(prev => !prev)
  }

  const getQuestionsList = () => {
    return dynamicQuestions.length > 0 ? dynamicQuestions : sampleQuestions[language]
  }

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setResumeFile(file)
    setIsUploading(true)
    setDynamicQuestions([])

    const formData = new FormData()
    formData.append("resume", file)
    try {
      const res = await axios.post(`${ServerUrl}/api/avatar/upload-resume`, formData)
      if (res.data.success) {
        const { role: fetchedRole, experience: fetchedExp, questions } = res.data.data
        if (fetchedRole) setRole(fetchedRole)
        if (fetchedExp) setExperience(fetchedExp)
        if (questions && questions.length > 0) {
          setDynamicQuestions(questions)
        }
      }
    } catch (error) {
      console.error("Resume upload failed", error)
      const errorMsg = error.response?.data?.message || (language === 'en' ? "Failed to process resume." : "रेज़्यूमे प्रोसेस करने में विफल।")
      alert(errorMsg)
    } finally {
      setIsUploading(false)
    }
  }

  const startSession = () => {
    if (!role || !experience) return
    setPhase('active')
    setQIndex(0)
    setTimeout(() => {
      const qs = getQuestionsList()
      const q = qs[0]
      setCurrentQ(q)
      speakText(language === 'en'
        ? `Hello! Welcome to your ${role} interview. Let's begin.`
        : `नमस्ते! आपके ${role} साक्षात्कार में आपका स्वागत है। शुरू करते हैं।`
      )
      setTimeout(() => speakText(q), 3500)
    }, 500)
  }

  const submitAnswer = () => {
    if (!transcript.trim() || !socketRef.current) return
    setMessages(prev => [...prev, { from: 'user', text: transcript }])
    socketRef.current.emit('candidate:answer', {
      transcript,
      language,
      questionContext: currentQ,
      role,
      experience
    })
    setTranscript('')
    recognitionRef.current?.stop()
    setIsMicOn(false)
    setIsListening(false)
  }

  const nextQuestion = () => {
    const qs = getQuestionsList()
    const next = qIndex + 1
    if (next >= qs.length) { setPhase('done'); return }
    setQIndex(next)
    setAvatarReply('')
    setTranscript('')
    const q = qs[next]
    setCurrentQ(q)
    speakText(q)
  }

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'hi' : 'en'
    setLanguage(newLang)
  }

  // ── SETUP SCREEN ─────────────────────────────────────────────────────────────
  if (phase === 'setup') return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-white">

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BsGlobe2 size={28} />
          </div>
          <h1 className="text-2xl font-bold">Avatar Interview</h1>
          <p className="text-white/60 text-sm mt-1">Real-time multilingual AI interview</p>
        </div>

        {/* Language Toggle */}
        <div className="flex items-center justify-between bg-white/5 rounded-2xl p-4 mb-6 border border-white/10">
          <span className="text-sm font-medium text-white/70">Interview Language</span>
          <button onClick={toggleLanguage}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition">
            <BsGlobe2 size={14} />
            {language === 'en' ? 'English' : 'हिंदी'}
          </button>
        </div>

        {/* Resume Upload Module */}
        <div className="mb-6">
          <label className="text-xs text-white/50 uppercase tracking-wider font-semibold mb-2 block">
            {language === 'en' ? 'Upload Resume (Optional)' : 'रेज़्यूमे अपलोड करें (वैकल्पिक)'}
          </label>
          <div className="relative group">
            <input 
              type="file" 
              accept=".pdf,.doc,.docx"
              onChange={handleResumeUpload}
              onClick={(e) => (e.target.value = null)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              disabled={isUploading}
            />
            <div className={`w-full bg-white/5 border border-dashed rounded-xl px-4 py-4 flex items-center justify-center gap-3 transition-all ${resumeFile ? 'border-green-400/50 text-green-400' : 'border-white/20 text-white/70 group-hover:border-purple-400 group-hover:bg-white/10'}`}>
              {isUploading ? (
                <FaSpinner className="animate-spin text-xl" />
              ) : resumeFile ? (
                <FaCheck className="text-xl" />
              ) : (
                <FaCloudUploadAlt className="text-2xl" />
              )}
              <span className="font-medium text-sm">
                {isUploading ? (language === 'en' ? 'Parsing...' : 'प्रोसेसिंग...') 
                  : resumeFile ? resumeFile.name 
                  : (language === 'en' ? 'Click or drag PDF/DOC here' : 'पीडीएफ/डॉक यहाँ अपलोड करें')}
              </span>
            </div>
          </div>
          {resumeFile && !isUploading && (
            <p className="text-green-400/80 text-xs mt-2 text-center">
              {language === 'en' ? 'Resume parsed! Questions generated dynamically.' : 'रेज़्यूमे प्रोसेस हो गया! प्रश्न तैयार हैं।'}
            </p>
          )}
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="h-px bg-white/10 flex-1"></div>
          <span className="text-xs text-white/40 uppercase font-semibold">OR Enter Manually</span>
          <div className="h-px bg-white/10 flex-1"></div>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="text-xs text-white/50 uppercase tracking-wider font-semibold mb-1 block">Job Role</label>
            <input value={role} onChange={e => setRole(e.target.value)}
              placeholder={language === 'en' ? 'e.g. Frontend Developer' : 'जैसे: फ्रंटेंड डेवलपर'}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 outline-none focus:border-purple-400 transition" />
          </div>
          <div>
            <label className="text-xs text-white/50 uppercase tracking-wider font-semibold mb-1 block">Experience</label>
            <select value={experience} onChange={e => setExperience(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-400 transition">
              <option value="" className="text-black">{language === 'en' ? 'Select level' : 'स्तर चुनें'}</option>
              <option value="Fresher" className="text-black">Fresher</option>
              <option value="1-2 years" className="text-black">1–2 Years</option>
              <option value="3-5 years" className="text-black">3–5 Years</option>
              <option value="5+ years" className="text-black">5+ Years</option>
            </select>
          </div>
        </div>

        <button onClick={startSession} disabled={!role || !experience}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 py-4 rounded-2xl font-bold text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center gap-2">
          {language === 'en' ? 'Start Interview' : 'साक्षात्कार शुरू करें'} <BsArrowRight />
        </button>
      </motion.div>
    </div>
  )

  // ── DONE SCREEN ──────────────────────────────────────────────────────────────
  if (phase === 'done') return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="text-center text-white max-w-md w-full">
        <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">🎉</div>
        <h2 className="text-3xl font-bold mb-3">{language === 'en' ? 'Interview Complete!' : 'साक्षात्कार पूर्ण!'}</h2>
        <p className="text-white/60 mb-8">{language === 'en' ? 'Great job! You answered all questions.' : 'बहुत अच्छा! आपने सभी प्रश्नों के उत्तर दिए।'}</p>
        
        <div className="flex flex-col gap-3">
          <button onClick={() => navigate('/history')}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-4 rounded-2xl font-bold hover:opacity-90 transition">
            {language === 'en' ? 'Go to Dashboard' : 'डैशबोर्ड पर जाएँ'}
          </button>
          
          <button onClick={() => { setPhase('setup'); setMessages([]); setQIndex(0) }}
            className="w-full bg-white/10 backdrop-blur border border-white/20 px-8 py-4 rounded-2xl font-bold hover:bg-white/20 transition">
            {language === 'en' ? 'Start New Interview' : 'नया साक्षात्कार शुरू करें'}
          </button>
        </div>
      </motion.div>
    </div>
  )

  // ── ACTIVE INTERVIEW ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl min-h-[85vh] flex flex-col lg:flex-row gap-4">

        {/* Left: Avatar Panel */}
        <div className="lg:w-[38%] flex flex-col gap-4">
          {/* Avatar Video */}
          <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
            <video ref={videoRef} src={femaleVideo} muted playsInline preload="auto" loop
              className="w-full h-auto object-cover" />
            {isAISpeaking && (
              <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-white text-xs font-medium">{language === 'en' ? 'AI Speaking' : 'AI बोल रही है'}</span>
              </div>
            )}
            {/* Language Badge */}
            <button onClick={toggleLanguage}
              className="absolute top-3 right-3 bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1.5 rounded-full text-white text-xs font-bold flex items-center gap-1 hover:opacity-90 transition">
              <BsGlobe2 size={12} /> {language === 'en' ? 'EN' : 'हिं'}
            </button>
          </div>

          {/* Subtitle */}
          <AnimatePresence>
            {subtitle && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="bg-black/60 backdrop-blur border border-white/10 rounded-2xl p-4">
                <p className="text-white text-sm text-center leading-relaxed">{subtitle}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress */}
          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-4 flex justify-between items-center">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{qIndex + 1}</p>
              <p className="text-white/40 text-xs uppercase tracking-wider">{language === 'en' ? 'Current' : 'वर्तमान'}</p>
            </div>
            <div className="h-1 flex-1 mx-4 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                style={{ width: `${((qIndex + 1) / sampleQuestions[language].length) * 100}%` }} />
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white/40">{sampleQuestions[language].length}</p>
              <p className="text-white/40 text-xs uppercase tracking-wider">{language === 'en' ? 'Total' : 'कुल'}</p>
            </div>
          </div>
        </div>

        {/* Right: Chat + Controls */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Header */}
          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-white font-bold text-lg">SmartHireAI Avatar Interview</h2>
              <p className="text-white/40 text-sm">{role} · {experience}</p>
            </div>
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
          </div>

          {/* Current Question */}
          <AnimatePresence mode="wait">
            <motion.div key={qIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="bg-white/5 backdrop-blur border border-purple-400/30 rounded-2xl p-6">
              <p className="text-xs text-purple-300 uppercase tracking-wider font-semibold mb-2">
                {language === 'en' ? `Question ${qIndex + 1}` : `प्रश्न ${qIndex + 1}`}
              </p>
              <p className="text-white text-lg font-medium leading-relaxed">{currentQ}</p>
            </motion.div>
          </AnimatePresence>

          {/* Message History */}
          <div className="flex-1 bg-black/20 backdrop-blur border border-white/5 rounded-2xl p-4 overflow-y-auto space-y-3 max-h-60">
            {messages.length === 0 && (
              <p className="text-white/20 text-sm text-center mt-4">
                {language === 'en' ? 'Your conversation will appear here.' : 'आपकी बातचीत यहाँ दिखाई देगी।'}
              </p>
            )}
            {messages.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  m.from === 'user'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-br-sm'
                    : 'bg-white/10 text-white/80 rounded-bl-sm'
                }`}>
                  {m.text}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Transcript area */}
          <div className="relative bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-4">
            <textarea
              value={transcript}
              onChange={e => setTranscript(e.target.value)}
              placeholder={language === 'en'
                ? 'Speak or type your answer here...'
                : 'अपना उत्तर बोलें या यहाँ टाइप करें...'}
              rows={3}
              className="w-full bg-transparent text-white placeholder-white/20 resize-none outline-none text-sm"
            />
          </div>

          {/* Controls */}
          {!avatarReply ? (
            <div className="flex items-center gap-3">
              {/* Mic Button */}
              <motion.button whileTap={{ scale: 0.9 }} onClick={toggleMic}
                className={`w-14 h-14 flex items-center justify-center rounded-2xl border transition-all ${
                  isMicOn
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500 border-transparent text-white shadow-lg shadow-purple-500/30'
                    : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20'
                }`}>
                {isMicOn ? <FaMicrophone size={20} /> : <FaMicrophoneSlash size={20} />}
              </motion.button>

              {/* Volume bars */}
              {isMicOn && (
                <div className="flex gap-1 items-center h-14 px-4 bg-white/5 rounded-2xl border border-white/10">
                  {[...Array(6)].map((_, i) => (
                    <motion.div key={i}
                      animate={{ height: Math.max(4, (volumeLevel / 255) * 36 * (Math.random() * 0.5 + 0.75)) }}
                      className="w-1.5 bg-gradient-to-t from-purple-500 to-pink-400 rounded-full"
                      transition={{ type: 'tween', duration: 0.08 }}
                    />
                  ))}
                </div>
              )}

              <motion.button whileTap={{ scale: 0.97 }} onClick={submitAnswer}
                disabled={!transcript.trim() || isAISpeaking}
                className="flex-1 h-14 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-2xl hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center justify-center gap-2">
                {language === 'en' ? 'Submit Answer' : 'उत्तर जमा करें'} <BsArrowRight />
              </motion.button>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 backdrop-blur border border-green-400/20 rounded-2xl p-5">
              <p className="text-xs text-green-400 uppercase tracking-wider font-semibold mb-2">
                {language === 'en' ? 'AI Feedback' : 'AI प्रतिक्रिया'}
              </p>
              <p className="text-white/80 text-sm leading-relaxed mb-4">{avatarReply}</p>
              <button onClick={nextQuestion}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 py-3 rounded-xl font-bold text-white hover:opacity-90 transition flex items-center justify-center gap-2">
                {qIndex + 1 >= sampleQuestions[language].length
                  ? (language === 'en' ? 'Finish Interview' : 'साक्षात्कार समाप्त करें')
                  : (language === 'en' ? 'Next Question' : 'अगला प्रश्न')
                } <BsArrowRight />
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
