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
import ErrorBoundary from '../components/ErrorBoundary'
import logo from '../assets/logo.png'

const SOCKET_URL = 'http://localhost:8000'

function AvatarInterviewComponent() {
  const navigate = useNavigate()
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
  const [avatarGender, setAvatarGender] = useState('female')
  const [currentQ, setCurrentQ] = useState('')
  const [qIndex, setQIndex] = useState(0)
  const [pendingNextQ, setPendingNextQ] = useState('')
  const [pendingComplete, setPendingComplete] = useState(false)
  const [volumeLevel, setVolumeLevel] = useState(0)

  const [resumeFile, setResumeFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isResumeReady, setIsResumeReady] = useState(false) // true only after successful parse
  const [dynamicQuestions, setDynamicQuestions] = useState([])
  const [qaHistory, setQaHistory] = useState([])
  const qaHistoryRef = useRef([])
  useEffect(() => {
    qaHistoryRef.current = qaHistory
  }, [qaHistory])

  const [isSaving, setIsSaving] = useState(false)
  const [uploadError, setUploadError] = useState('')

  // ── Hybrid Validation ────────────────────────────────────────────────────────
  // Start is enabled when EITHER path is satisfied:
  //  Path A (Resume): resume successfully parsed (isResumeReady)
  //  Path B (Manual): both role AND experience are filled
  const isManualReady = role.trim().length > 0 && experience !== ''
  const canStart = isResumeReady || isManualReady

  const socketRef = useRef(null)
  const videoRef = useRef(null)
  const recognitionRef = useRef(null)
  const audioRef = useRef(null)
  const aiAudioCtxRef = useRef(null)
  const aiAnalyserRef = useRef(null)
  const aiDelayNodeRef = useRef(null)
  const lipSyncRafRef = useRef(null)
  const audioCtxRef = useRef(null)
  const analyserRef = useRef(null)
  const streamRef = useRef(null)
  const rafRef = useRef(null)

  // Removed hardcoded defaultFirstQuestion in favor of full AI generation

  // ── Socket.IO setup ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'active') return

    const socket = io(`${SOCKET_URL}/avatar-interview`, { withCredentials: true })
    socketRef.current = socket

    socket.on('connect', () => {
      // Delay fetching the first question to let the "Welcome" greeting finish speaking
      setTimeout(() => {
        if (dynamicQuestions.length > 0) {
          // If resume was uploaded, use the pre-generated AI question
          socket.emit('avatar:speak_question', { question: dynamicQuestions[0] })
        } else {
          // Manual Mode: ask backend to dynamically generate the first question
          socket.emit('avatar:start_interview', { role, experience })
        }
      }, 3500)
    })

    socket.on('avatar:reply', ({ text }) => {
      setAvatarReply(text)
      setMessages(prev => [...prev, { from: 'ai', text }])

      setQaHistory(prev => {
        const history = [...prev];
        if (history.length > 0) {
          history[history.length - 1].feedback = text;
        }
        return history;
      });

      speakText(text)
    })

    socket.on('avatar:speaking_start', () => setIsAISpeaking(true))
    socket.on('avatar:speaking_end', () => setIsAISpeaking(false))

    // Adaptive: next question from server
    socket.on('avatar:question_ready', ({ text }) => {
      setPendingNextQ(text)
    })

    // Dynamic completion: server signals when interview is done
    socket.on('avatar:interview_complete', () => {
      setPendingComplete(true)
    })

    return () => socket.disconnect()
  }, [phase])

  // ── Auto-play first question ──────────────────────────────────────────────────
  useEffect(() => {
    if (pendingNextQ && qIndex === 0) {
      setAvatarReply('')
      setTranscript('')
      setCurrentQ(pendingNextQ)
      setSubtitle(pendingNextQ)
      setQIndex(1)
      speakText(pendingNextQ)
      setPendingNextQ('')
    }
  }, [pendingNextQ, qIndex])

  // ── Speech Recognition ───────────────────────────────────────────────────────
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return
    const rec = new SpeechRecognition()
    rec.continuous = true
    rec.interimResults = true
    rec.lang = 'en-US'
    rec.onresult = (e) => {
      const t = Array.from(e.results).map(r => r[0].transcript).join('')
      setTranscript(t)
    }
    recognitionRef.current = rec
    return () => rec.abort()
  }, [])

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
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
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
    }).catch(() => { })
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop())
      cancelAnimationFrame(rafRef.current)
    }
  }, [isMicOn])

  // ── Fully Free Neural TTS Engine (Amazon Polly Neural) ──────────────────────
  const speakText = (text) => {
    // Stop any currently playing speech
    window.speechSynthesis.cancel()

    setIsAISpeaking(true)
    setSubtitle(text)

    try {
      const utterance = new SpeechSynthesisUtterance(text)
      
      // Try to find a matching voice based on selected gender
      const voices = window.speechSynthesis.getVoices()
      if (voices.length > 0) {
        const preferredVoice = voices.find(v => 
          v.lang.startsWith('en') && 
          (avatarGender === 'male' 
            ? (v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('guy')) 
            : (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('samantha')))
        )
        if (preferredVoice) {
          utterance.voice = preferredVoice
        }
      }
      
      utterance.rate = 1.05

      utterance.onstart = () => {
        // Simple continuous lip sync: play the video loop while speaking
        if (videoRef.current && videoRef.current.paused) {
          videoRef.current.play().catch(()=>{})
        }
      }

      utterance.onend = () => {
        setIsAISpeaking(false)
        setSubtitle('')
        if (videoRef.current) {
          videoRef.current.pause()
          videoRef.current.currentTime = 0
        }
      }

      utterance.onerror = (e) => {
        console.error("SpeechSynthesis error:", e)
        setIsAISpeaking(false)
        setSubtitle('')
        if (videoRef.current) {
          videoRef.current.pause()
        }
      }

      window.speechSynthesis.speak(utterance)
    } catch (error) {
      console.error("Native TTS failed:", error)
      setIsAISpeaking(false)
      setSubtitle('')
      if (videoRef.current) {
        videoRef.current.pause()
      }
    }
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

  // Removed getQuestionsList since all questions are strictly AI generated

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setResumeFile(file)
    setIsUploading(true)
    setIsResumeReady(false)
    setUploadError('')
    setDynamicQuestions([])

    const formData = new FormData()
    formData.append("resume", file)
    try {
      const res = await axios.post(`${ServerUrl}/api/avatar/upload-resume`, formData)
      if (res.data.success) {
        const { role: fetchedRole, experience: fetchedExp, firstQuestion } = res.data.data
        if (fetchedRole) setRole(fetchedRole)
        if (fetchedExp) setExperience(fetchedExp)
        if (firstQuestion) setDynamicQuestions([firstQuestion])
        setIsResumeReady(true)   // ✅ Path A satisfied
      } else {
        setUploadError('Resume parsing failed. Please try manual input.')
        setResumeFile(null)
      }
    } catch (error) {
      console.error("Resume upload failed", error)
      setUploadError(error.response?.data?.message || ('Failed to process resume.'))
      setResumeFile(null)
      setIsResumeReady(false)
    } finally {
      setIsUploading(false)
    }
  }

  const startSession = () => {
    if (!canStart) return
    setPhase('active')
    setQIndex(0)
    
    // Play the generic welcome greeting immediately.
    // The actual first question will be fetched from the backend AI via socket 3.5 seconds later.
    setTimeout(() => {
      speakText(`Hello! Welcome to your ${role} interview. Let's begin.`
      )
    }, 500)
  }

  const submitAnswer = () => {
    if (!transcript.trim() || !socketRef.current) return
    setMessages(prev => [...prev, { from: 'user', text: transcript }])

    // Store answer in structured history
    setQaHistory(prev => {
      const history = [...prev];
      const existing = history.find(item => item.question === currentQ);
      if (existing) {
        existing.answer = transcript;
      } else {
        history.push({ question: currentQ, answer: transcript, feedback: '' });
      }
      return history;
    });

    socketRef.current.emit('candidate:answer', {
      transcript,
      questionContext: currentQ,
      role,
      experience
    })
    setTranscript('')
    recognitionRef.current?.stop()
    setIsMicOn(false)
    setIsListening(false)
  }

  const finishAvatarInterview = async () => {
    setIsSaving(true);
    try {
      await axios.post(`${ServerUrl}/api/avatar/save-interview`, {
        qaHistory: qaHistoryRef.current,
        role,
        experience
      }, { withCredentials: true });
    } catch (error) {
      console.error("Failed to save interview:", error);
      alert("Failed to save interview results.");
    } finally {
      setIsSaving(false);
      setPhase('done');
    }
  };

  const nextQuestion = () => {
    if (pendingComplete) {
      finishAvatarInterview()
      return
    }
    if (pendingNextQ) {
      setAvatarReply('')
      setTranscript('')
      setCurrentQ(pendingNextQ)
      setSubtitle(pendingNextQ)
      setQIndex(prev => prev + 1)
      speakText(pendingNextQ)
      setPendingNextQ('')
    }
  }

  const toggleLanguage = () => {
    const newLang = 'hi'
    setLanguage(newLang)
  }

  // ── SETUP SCREEN ─────────────────────────────────────────────────────────────
  if (phase === 'setup') return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 transition-colors duration-300 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-white dark:bg-white/10 shadow-sm backdrop-blur-xl border border-gray-200 dark:border-white/20 rounded-3xl p-6 sm:p-8 text-gray-900 dark:text-white">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 overflow-hidden shadow-md border border-gray-100 dark:border-gray-800 bg-white">
            <img src={logo} alt="SmartHire.AI Logo" className="w-full h-full object-cover p-1.5" />
          </div>
          <h1 className="text-2xl font-bold">Avatar Interview</h1>
          <p className="text-gray-500 dark:text-white/60 text-sm mt-1">Real-time multilingual AI interview</p>
        </div>

        {/* Language Toggle */}
        <div className="flex items-center justify-between bg-white/60 dark:bg-white/5 shadow-sm rounded-2xl p-4 mb-6 border border-gray-200 dark:border-white/10">
          <span className="text-sm font-medium text-gray-600 dark:text-white/70">Interview Language</span>
          <button onClick={toggleLanguage}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition">
            <BsGlobe2 size={14} />
            {'English'}
          </button>
        </div>

        {/* ── PATH A: Resume Upload ───────────────────────────────────────── */}
        <div className={`mb-4 rounded-2xl border p-4 transition-all duration-300 ${
          isResumeReady
            ? 'border-green-400/60 bg-green-500/10'
            : 'border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                isResumeReady ? 'bg-green-500 text-gray-900 dark:text-white' : 'bg-white/20 text-gray-500 dark:text-white/60'
              }`}>
                {isResumeReady ? <FaCheck size={10} /> : 'A'}
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {'Resume-Based Mode'}
              </span>
            </div>
            {isResumeReady && (
              <span className="text-xs font-bold text-green-400 bg-green-400/15 px-2 py-0.5 rounded-full">
                {'✓ Ready'}
              </span>
            )}
          </div>

          <div className="relative group">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleResumeUpload}
              onClick={(e) => (e.target.value = null)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              disabled={isUploading}
            />
            <div className={`w-full border border-dashed rounded-xl px-4 py-4 flex items-center justify-center gap-3 transition-all ${
              isResumeReady
                ? 'border-green-400/50 bg-green-500/10 text-green-400'
                : 'border-gray-200 dark:border-white/20 text-gray-600 dark:text-white/70 group-hover:border-purple-400 group-hover:bg-white dark:bg-white/10 shadow-sm'
            }`}>
              {isUploading ? (
                <FaSpinner className="animate-spin text-xl" />
              ) : isResumeReady ? (
                <FaCheck className="text-xl" />
              ) : (
                <FaCloudUploadAlt className="text-2xl" />
              )}
              <span className="font-medium text-sm">
                {isUploading
                  ? ('Parsing resume...')
                  : isResumeReady
                    ? resumeFile?.name
                    : ('Click to upload PDF / DOC')}
              </span>
            </div>
          </div>

          {/* Upload error */}
          <AnimatePresence>
            {uploadError && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="text-red-400 text-xs mt-2 text-center">
                {uploadError}
              </motion.p>
            )}
          </AnimatePresence>

          {isResumeReady && role && (
            <p className="text-green-400/80 text-xs mt-2 text-center">
              {`✓ Parsed: ${role} · ${experience}`}
            </p>
          )}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-4">
          <div className="h-px bg-white dark:bg-white/10 shadow-sm flex-1" />
          <span className="text-xs text-gray-400 dark:text-white/40 uppercase font-bold tracking-widest">OR</span>
          <div className="h-px bg-white dark:bg-white/10 shadow-sm flex-1" />
        </div>

        {/* ── PATH B: Manual Input ────────────────────────────────────────── */}
        <div className={`mb-6 rounded-2xl border p-4 transition-all duration-300 ${
          isManualReady && !isResumeReady
            ? 'border-purple-400/60 bg-purple-500/10'
            : 'border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                isManualReady ? 'bg-purple-500 text-gray-900 dark:text-white' : 'bg-white/20 text-gray-500 dark:text-white/60'
              }`}>
                {isManualReady ? <FaCheck size={10} /> : 'B'}
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {'Manual Mode'}
              </span>
            </div>
            {!isManualReady && (
              <span className="text-xs text-gray-400 dark:text-white/40">
                {'Role + Level required'}
              </span>
            )}
            {isManualReady && !isResumeReady && (
              <span className="text-xs font-bold text-purple-400 bg-purple-400/15 px-2 py-0.5 rounded-full">
                {'✓ Ready'}
              </span>
            )}
          </div>

          <div className="space-y-3">
            {/* Avatar Gender */}
            <div>
              <label className="text-xs text-gray-500 dark:text-white/50 uppercase tracking-wider font-semibold mb-1 block">Avatar Voice</label>
              <div className="flex gap-3">
                <button onClick={() => setAvatarGender('female')}
                  className={`flex-1 py-2.5 rounded-xl border transition text-sm font-medium ${
                    avatarGender === 'female'
                      ? 'bg-gradient-to-r from-purple-500/40 to-pink-500/40 border-purple-400 text-gray-900 dark:text-white'
                      : 'bg-white/60 dark:bg-white/5 shadow-sm border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/50 hover:bg-white dark:bg-white/10 shadow-sm'
                  }`}>
                  {' Female'}
                </button>
                <button onClick={() => setAvatarGender('male')}
                  className={`flex-1 py-2.5 rounded-xl border transition text-sm font-medium ${
                    avatarGender === 'male'
                      ? 'bg-gradient-to-r from-purple-500/40 to-pink-500/40 border-purple-400 text-gray-900 dark:text-white'
                      : 'bg-white/60 dark:bg-white/5 shadow-sm border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/50 hover:bg-white dark:bg-white/10 shadow-sm'
                  }`}>
                  {'Male'}
                </button>
              </div>
            </div>

            {/* Job Role */}
            <div>
              <label className="text-xs text-gray-500 dark:text-white/50 uppercase tracking-wider font-semibold mb-1 flex items-center gap-1 justify-between">
                <span>{'Job Role'}</span>
                {!role.trim() && <span className="text-yellow-400/70 normal-case font-normal">Required</span>}
              </label>
              <input value={role} onChange={e => setRole(e.target.value)}
                placeholder={'e.g. Frontend Developer'}
                className={`w-full bg-white/60 dark:bg-white/5 shadow-sm border rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 outline-none focus:border-purple-400 transition ${
                  role.trim() ? 'border-purple-400/50' : 'border-gray-200 dark:border-white/10'
                }`} />
            </div>

            {/* Experience */}
            <div>
              <label className="text-xs text-gray-500 dark:text-white/50 uppercase tracking-wider font-semibold mb-1 flex items-center justify-between">
                <span>{'Experience Level'}</span>
                {!experience && <span className="text-yellow-400/70 normal-case font-normal">Required</span>}
              </label>
              <select value={experience} onChange={e => setExperience(e.target.value)}
                className={`w-full bg-white/60 dark:bg-white/5 shadow-sm border rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-purple-400 transition ${
                  experience ? 'border-purple-400/50' : 'border-gray-200 dark:border-white/10'
                }`}>
                <option value="" className="text-black">{'Select level'}</option>
                <option value="Fresher" className="text-black">Fresher</option>
                <option value="1-2 years" className="text-black">1–2 Years</option>
                <option value="3-5 years" className="text-black">3–5 Years</option>
                <option value="5+ years" className="text-black">5+ Years</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Validation hint ─────────────────────────────────────────────── */}
        <AnimatePresence>
          {!canStart && (
            <motion.p
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-gray-400 dark:text-white/40 text-xs text-center mb-4">
              {'Upload a resume  OR  fill Job Role + Experience to continue'}
            </motion.p>
          )}
        </AnimatePresence>

        {/* ── Start Button ────────────────────────────────────────────────── */}
        <button onClick={startSession} disabled={!canStart || isUploading}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 py-4 rounded-2xl font-bold text-gray-900 dark:text-white hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center justify-center gap-2">
          {'Start Interview'} <BsArrowRight />
        </button>
      </motion.div>
    </div>
  )

  // ── DONE SCREEN ──────────────────────────────────────────────────────────────
  if (phase === 'done') return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 transition-colors duration-300 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="text-center text-gray-900 dark:text-white max-w-md w-full">
        <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">🎉</div>
        <h2 className="text-3xl font-bold mb-3">{'Interview Complete!'}</h2>
        <p className="text-gray-500 dark:text-white/60 mb-8">
          {'Great job! You answered all questions.'}
          <span className="block mt-3 text-gray-900 dark:text-white font-semibold text-lg">Total Questions: {qIndex}</span>
        </p>

        <div className="flex flex-col gap-3">
          <button onClick={() => navigate('/history')}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-4 rounded-2xl font-bold hover:opacity-90 transition">
            {'Go to Dashboard'}
          </button>

          <button onClick={() => { setPhase('setup'); setMessages([]); setQIndex(0); setPendingNextQ(''); setPendingComplete(false); }}
            className="w-full bg-white dark:bg-white/10 shadow-sm backdrop-blur border border-gray-200 dark:border-white/20 px-8 py-4 rounded-2xl font-bold hover:bg-white/20 transition">
            {'Start New Interview'}
          </button>
        </div>
      </motion.div>
    </div>
  )

  // ── ACTIVE INTERVIEW ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 transition-colors duration-300 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl min-h-[85vh] flex flex-col lg:flex-row gap-4">

        {/* Left: Avatar Panel */}
        <div className="lg:w-[38%] flex flex-col gap-4">
          {/* Avatar Video */}
          <div className="relative bg-gray-100/80 dark:bg-black/40 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl overflow-hidden">
            <video ref={videoRef} src={avatarGender === 'female' ? femaleVideo : maleVideo} muted playsInline preload="auto" loop
              className="w-full h-auto object-cover" />
            {isAISpeaking && (
              <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-white/90 dark:bg-black/60 backdrop-blur px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-gray-900 dark:text-white text-xs font-medium">{'AI Speaking'}</span>
              </div>
            )}
            {/* Language Badge */}
            <button onClick={toggleLanguage}
              className="absolute top-3 right-3 bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1.5 rounded-full text-gray-900 dark:text-white text-xs font-bold flex items-center gap-1 hover:opacity-90 transition">
              <BsGlobe2 size={12} /> {'EN'}
            </button>
          </div>

          {/* Subtitle */}
          <AnimatePresence>
            {subtitle && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="bg-white/90 dark:bg-black/60 backdrop-blur border border-gray-200 dark:border-white/10 rounded-2xl p-4">
                <p className="text-gray-900 dark:text-white text-sm text-center leading-relaxed">{subtitle}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress */}
          <div className="bg-white/60 dark:bg-white/5 shadow-sm backdrop-blur border border-gray-200 dark:border-white/10 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <span className="text-xl font-bold text-gray-900 dark:text-white">{qIndex || 1}</span>
              </div>
              <div>
                <p className="text-gray-900 dark:text-white font-bold">Current Question</p>
                <p className="text-gray-400 dark:text-white/40 text-xs">AI is evaluating dynamically</p>
              </div>
            </div>
            <div className="flex gap-1.5 mr-2">
              {[...Array(3)].map((_, i) => (
                <span key={i} className="w-2 h-2 bg-green-400 rounded-full animate-ping" style={{ animationDelay: `${i * 0.2}s`, animationDuration: '1.5s' }} />
              ))}
            </div>
          </div>
        </div>

        {/* Right: Chat + Controls */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Header */}
          <div className="bg-white/60 dark:bg-white/5 shadow-sm backdrop-blur border border-gray-200 dark:border-white/10 rounded-2xl px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-gray-900 dark:text-white font-bold text-lg">SmartHireAI Avatar Interview</h2>
              <p className="text-gray-400 dark:text-white/40 text-sm">{role} · {experience}</p>
            </div>
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
          </div>

          {/* Current Question */}
          <AnimatePresence mode="wait">
            <motion.div key={qIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="bg-white/60 dark:bg-white/5 shadow-sm backdrop-blur border border-purple-400/30 rounded-2xl p-6">
              <p className="text-xs text-purple-300 uppercase tracking-wider font-semibold mb-2">
                {`Question ${qIndex || 1}`}
              </p>
              <p className="text-gray-900 dark:text-white text-lg font-medium leading-relaxed">{currentQ}</p>
            </motion.div>
          </AnimatePresence>

          {/* Message History */}
          <div className="flex-1 bg-white/50 dark:bg-black/20 backdrop-blur border border-white/5 rounded-2xl p-4 overflow-y-auto space-y-3 max-h-60">
            {messages.length === 0 && (
              <p className="text-gray-400 dark:text-white/20 text-sm text-center mt-4">
                {'Your conversation will appear here.'}
              </p>
            )}
            {messages.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${m.from === 'user'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-gray-900 dark:text-white rounded-br-sm'
                    : 'bg-white dark:bg-white/10 shadow-sm text-white/80 rounded-bl-sm'
                  }`}>
                  {m.text}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Transcript area */}
          <div className="relative bg-white/60 dark:bg-white/5 shadow-sm backdrop-blur border border-gray-200 dark:border-white/10 rounded-2xl p-4">
            <textarea
              value={transcript}
              onChange={e => setTranscript(e.target.value)}
              placeholder={'Speak or type your answer here...'}
              rows={3}
              className="w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/20 resize-none outline-none text-sm"
            />
          </div>

          {/* Controls */}
          {!avatarReply ? (
            <div className="flex items-center gap-3">
              {/* Mic Button */}
              <motion.button whileTap={{ scale: 0.9 }} onClick={toggleMic}
                className={`w-14 h-14 flex items-center justify-center rounded-2xl border transition-all ${isMicOn
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500 border-transparent text-gray-900 dark:text-white shadow-lg shadow-purple-500/30'
                    : 'bg-white/60 dark:bg-white/5 shadow-sm border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/50 hover:border-gray-200 dark:border-white/20'
                  }`}>
                {isMicOn ? <FaMicrophone size={20} /> : <FaMicrophoneSlash size={20} />}
              </motion.button>

              {/* Volume bars */}
              {isMicOn && (
                <div className="flex gap-1 items-center h-14 px-4 bg-white/60 dark:bg-white/5 shadow-sm rounded-2xl border border-gray-200 dark:border-white/10">
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
                className="flex-1 h-14 bg-gradient-to-r from-purple-500 to-pink-500 text-gray-900 dark:text-white font-bold rounded-2xl hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center justify-center gap-2">
                {'Submit Answer'} <BsArrowRight />
              </motion.button>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white/60 dark:bg-white/5 shadow-sm backdrop-blur border border-green-400/20 rounded-2xl p-5">
              <p className="text-xs text-green-400 uppercase tracking-wider font-semibold mb-2">
                {'AI Feedback'}
              </p>
              <p className="text-white/80 text-sm leading-relaxed mb-4">{avatarReply}</p>
              <button onClick={nextQuestion}
                disabled={isSaving || (!pendingNextQ && !pendingComplete)}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 py-3 rounded-xl font-bold text-gray-900 dark:text-white hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-50">
                {isSaving ? (
                  <><FaSpinner className="animate-spin" /> {'Saving...'}</>
                ) : (
                  <>
                    {pendingComplete
                      ? ('Finish Interview')
                      : ('Next Question')
                    } <BsArrowRight />
                  </>
                )}
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

// 4. Add React Error Boundary Wrapper
export default function AvatarInterview() {
  return (
    <ErrorBoundary>
      <AvatarInterviewComponent />
    </ErrorBoundary>
  )
}
