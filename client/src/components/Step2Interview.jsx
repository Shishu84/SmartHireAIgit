import React from 'react'
import maleVideo from "../assets/videos/male-ai.mp4"
import femaleVideo from "../assets/videos/female-ai.mp4"
import Timer from './Timer'
import { motion } from "motion/react"
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import { useState } from 'react'
import { useRef } from 'react'
import { useEffect } from 'react'
import axios from "axios"
import { ServerUrl } from '../App'
import { BsArrowRight, BsPauseFill, BsPlayFill, BsArrowRepeat } from 'react-icons/bs'

function Step2Interview({ interviewData, onFinish }) {
  const { interviewId, userName } = interviewData;
  const [dynamicQuestions, setDynamicQuestions] = useState(interviewData.questions || []);
  const [isInterviewFinished, setIsInterviewFinished] = useState(false);
  const [interviewPhase, setInterviewPhase] = useState('entry'); // 'entry', 'check', 'active'
  const [entryCountdown, setEntryCountdown] = useState(5);
  const [systemChecks, setSystemChecks] = useState({ mic: 'pending', error: '' }); // 'pending', 'passed', 'failed'
  const [isPaused, setIsPaused] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle', 'saving', 'saved'
  const [voiceGender, setVoiceGender] = useState("female");
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isAIPlaying, setIsAIPlaying] = useState(false);
  const videoRef = useRef(null);
  const [subtitle, setSubtitle] = useState("");
  const [isMicOn, setIsMicOn] = useState(false);
  const [isIntroPhase, setIsIntroPhase] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [answer, setAnswer] = useState("");
  const recognitionRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [volumeLevel, setVolumeLevel] = useState(0);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaStreamRef = useRef(null);

  const currentQuestion = dynamicQuestions ? dynamicQuestions[currentIndex] : null;
  // Phase 1: Entry Countdown
  useEffect(() => {
    if (interviewPhase === 'entry') {
      const timer = setInterval(() => {
        setEntryCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setInterviewPhase('check');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [interviewPhase]);

  // Phase 2: System Checks
  useEffect(() => {
    if (interviewPhase === 'check') {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
         setSystemChecks({ mic: 'failed', error: 'Your browser does not support audio capture.' });
         return;
      }
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          setSystemChecks({ mic: 'passed', error: '' });
          stream.getTracks().forEach(track => track.stop());
        })
        .catch((err) => {
          setSystemChecks({ mic: 'failed', error: err.message || 'Permission denied' });
        });
    }
  }, [interviewPhase]);

  // Audio Visualizer Logic
  useEffect(() => {
    let animationFrameId;

    const startAudioVisualizer = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioContextRef.current = audioContext;
        
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;
        
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        
        const updateVolume = () => {
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const average = sum / dataArray.length;
          setVolumeLevel(average);
          animationFrameId = requestAnimationFrame(updateVolume);
        };
        
        updateVolume();
      } catch (err) {
        console.error("Mic access denied for visualizer", err);
      }
    };

    if (isMicOn && interviewPhase === 'active') {
      startAudioVisualizer();
    } else {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      setVolumeLevel(0);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isMicOn, interviewPhase]);

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;

      const femaleVoice = voices.find(v => v.name.toLowerCase().includes("zira") || v.name.toLowerCase().includes("samantha") || v.name.toLowerCase().includes("female"));
      if (femaleVoice) { setSelectedVoice(femaleVoice); setVoiceGender("female"); return; }

      const maleVoice = voices.find(v => v.name.toLowerCase().includes("david") || v.name.toLowerCase().includes("mark") || v.name.toLowerCase().includes("male"));
      if (maleVoice) { setSelectedVoice(maleVoice); setVoiceGender("male"); return; }

      setSelectedVoice(voices[0]); setVoiceGender("female");
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const videoSource = voiceGender === "male" ? maleVideo : femaleVideo;

  /* ---------------- SPEAK FUNCTION ---------------- */
  const speakText = (text) => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis || !selectedVoice) {
        resolve();
        return;
      }
      window.speechSynthesis.cancel();
      const humanText = text.replace(/,/g, ", ... ").replace(/\./g, ". ... ");
      const utterance = new SpeechSynthesisUtterance(humanText);
      utterance.voice = selectedVoice;
      utterance.rate = 0.92;
      utterance.pitch = 1.05;
      utterance.volume = 1;

      utterance.onstart = () => {
        setIsAIPlaying(true);
        stopMic();
        const playPromise = videoRef.current?.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            // Ignore AbortError caused by pause() interrupting play()
          });
        }
      };

      utterance.onend = () => {
        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
        }
        setIsAIPlaying(false);
        if (isMicOn) startMic();
        setTimeout(() => { setSubtitle(""); resolve(); }, 300);
      };

      setSubtitle(text);
      window.speechSynthesis.speak(utterance);
    });
  };

  useEffect(() => {
    if (!selectedVoice || interviewPhase !== 'active') return;

    const runIntro = async () => {
      if (isIntroPhase) {
        await speakText(`Hi ${userName}, it's great to meet you today. I hope you're feeling confident and ready.`);
        await speakText("I'll ask you a few questions. Just answer naturally, and take your time. Let's begin.");
        setIsIntroPhase(false);
      } else if (currentQuestion) {
        await new Promise(r => setTimeout(r, 800));
        if (isInterviewFinished) {
            // It won't reach here usually, but just in case
        } else if (currentIndex > 0 && currentIndex === dynamicQuestions.length - 1 && !isInterviewFinished) {
          await speakText("Alright, let's proceed.");
        }
        await speakText(currentQuestion.question);
        if (isMicOn) startMic();
      }
    };
    runIntro();
  }, [selectedVoice, isIntroPhase, currentIndex, interviewPhase]);

  useEffect(() => {
    if (isIntroPhase || interviewPhase !== 'active' || !currentQuestion || isPaused) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isIntroPhase, currentIndex, interviewPhase, isPaused]);

  useEffect(() => {
    if (!isIntroPhase && currentQuestion && interviewPhase === 'active') {
      setTimeLeft(currentQuestion.timeLimit || 60);
    }
  }, [currentIndex, interviewPhase]);

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) return;
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      setAnswer((prev) => prev + " " + transcript);
    };
    recognitionRef.current = recognition;
  }, []);

  const startMic = () => {
    if (recognitionRef.current && !isAIPlaying && interviewPhase === 'active') {
      try { recognitionRef.current.start(); } catch { }
    }
  };

  const stopMic = () => {
    if (recognitionRef.current) { recognitionRef.current.stop(); }
  };

  const toggleMic = () => {
    if (isMicOn) { stopMic(); } else { startMic(); }
    setIsMicOn(!isMicOn);
  };

  const togglePause = () => {
    if (isPaused) {
      setIsPaused(false);
      if (isMicOn) startMic();
    } else {
      setIsPaused(true);
      stopMic();
    }
  };

  const repeatQuestion = () => {
    if (currentQuestion && !isAIPlaying) {
      speakText(currentQuestion.question);
    }
  };

  const submitAnswer = async () => {
    if (isSubmitting) return;
    stopMic();
    setIsSubmitting(true);
    try {
      const result = await axios.post(ServerUrl + "/api/interview/submit-answer", {
        interviewId,
        questionIndex: currentIndex,
        answer,
        timeTaken: currentQuestion.timeLimit - timeLeft,
      }, { withCredentials: true });
      setFeedback(result.data.feedback);
      speakText(result.data.feedback);
      
      if (result.data.nextQuestion) {
          setDynamicQuestions(prev => [...prev, result.data.nextQuestion]);
      }
      if (result.data.isFinished) {
          setIsInterviewFinished(true);
      }
      
      setIsSubmitting(false);
    } catch (error) {
      console.log(error);
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    setAnswer("");
    setFeedback("");
    if (isInterviewFinished || currentIndex + 1 >= dynamicQuestions.length) {
      finishInterview();
      return;
    }
    await speakText("Alright, let's move to the next question.");
    setCurrentIndex(currentIndex + 1);
    setTimeout(() => { if (isMicOn) startMic(); }, 500);
  };

  const finishInterview = async () => {
    stopMic();
    setIsMicOn(false);
    try {
      const result = await axios.post(ServerUrl + "/api/interview/finish", { interviewId }, { withCredentials: true });
      onFinish(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (isIntroPhase || interviewPhase !== 'active' || !currentQuestion || isPaused) return;
    if (timeLeft === 0 && !isSubmitting && !feedback) {
      submitAnswer();
    }
  }, [timeLeft, interviewPhase, isPaused]);

  // Phase 7 & 8: Auto-save responses to prevent data loss
  useEffect(() => {
    if (answer && interviewPhase === 'active') {
      setSaveStatus('saving');
      const handler = setTimeout(() => {
        localStorage.setItem(`interview_${interviewId}_q${currentIndex}`, answer);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      }, 800);
      return () => clearTimeout(handler);
    }
  }, [answer, interviewPhase, interviewId, currentIndex]);

  // Load drafted answer if available
  useEffect(() => {
    if (interviewPhase === 'active') {
      const savedAnswer = localStorage.getItem(`interview_${interviewId}_q${currentIndex}`);
      if (savedAnswer && !answer) {
        setAnswer(savedAnswer);
      }
    }
  }, [currentIndex, interviewPhase, interviewId]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current.abort();
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  if (interviewPhase === 'entry') {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className='max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-200 p-8 text-center'
        >
          <div className='w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mx-auto mb-6'>
            <FaMicrophone size={24} />
          </div>
          <h2 className='text-2xl font-bold text-gray-900 mb-2'>Your interview is about to begin</h2>
          <p className='text-gray-500 mb-8'>Role: {interviewData.role}</p>
          <div className='relative w-24 h-24 mx-auto flex items-center justify-center bg-gray-50 rounded-full border-4 border-gray-100'>
            <span className='text-4xl font-bold text-black'>{entryCountdown}</span>
          </div>
          <p className='text-sm text-gray-400 mt-6'>Please prepare yourself in a quiet environment.</p>
        </motion.div>
      </div>
    );
  }

  if (interviewPhase === 'check') {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className='max-w-lg w-full bg-white rounded-3xl shadow-xl border border-gray-200 p-8'
        >
          <h2 className='text-2xl font-bold text-gray-900 mb-6 text-center'>System Check</h2>
          <div className='space-y-4 mb-8'>
            <div className='flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100'>
              <div className='flex items-center gap-3'>
                <FaMicrophone className='text-gray-400' />
                <span className='font-medium text-gray-700'>Microphone Access</span>
              </div>
              {systemChecks.mic === 'pending' && <span className='text-gray-500 text-sm animate-pulse'>Checking...</span>}
              {systemChecks.mic === 'passed' && <span className='text-green-500 text-sm font-semibold'>Passed</span>}
              {systemChecks.mic === 'failed' && <span className='text-red-500 text-sm font-semibold'>Denied</span>}
            </div>
            {systemChecks.mic === 'failed' && (
              <div className='text-xs text-red-600 bg-red-50 p-4 rounded-xl border border-red-200'>
                <p className='font-bold text-sm mb-1'>Microphone Access Denied</p>
                <p className='mb-2'>Error: {systemChecks.error}</p>
                <p className='font-medium'>Please click the lock icon in your browser's address bar, allow microphone permissions, and refresh the page to continue.</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setInterviewPhase('active')}
            disabled={systemChecks.mic !== 'passed'}
            className='w-full bg-black text-white py-4 rounded-xl font-semibold hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all'
          >
            I am ready to start
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4 sm:p-6'>
      <div className='w-full max-w-6xl min-h-[85vh] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col lg:flex-row overflow-hidden'>

        {/* video section */}
        <div className='w-full lg:w-[35%] bg-white flex flex-col items-center p-6 space-y-6 border-r border-gray-200'>
          <div className='w-full max-w-md rounded-2xl overflow-hidden shadow-sm border border-gray-100'>
            <video
              src={videoSource}
              key={videoSource}
              ref={videoRef}
              muted
              playsInline
              preload="auto"
              className="w-full h-auto object-cover"
            />
          </div>

          {/* subtitle */}
          {subtitle && (
            <div className='w-full max-w-md bg-black text-white rounded-xl p-4 shadow-sm'>
              <p className='text-sm sm:text-base font-medium text-center leading-relaxed'>{subtitle}</p>
            </div>
          )}

          {/* timer Area */}
          <div className='w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-5'>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-gray-500 font-medium'>Interview Status</span>
              {isAIPlaying && <span className='text-sm font-semibold text-green-500 flex items-center gap-2'>
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> AI Speaking
              </span>}
            </div>

            <div className="h-px bg-gray-100"></div>

            <div className='flex justify-center'>
              <Timer timeLeft={timeLeft} totalTime={currentQuestion?.timeLimit} />
            </div>

            <div className="h-px bg-gray-100"></div>

            <div className='grid grid-cols-2 gap-6 text-center'>
              <div>
                <span className='text-2xl font-bold text-black'>{currentIndex + 1}</span>
                <span className='text-xs text-gray-400 block mt-1 uppercase tracking-wider'>Current</span>
              </div>
              <div>
                <span className='text-2xl font-bold text-gray-400'>
                  {isInterviewFinished ? dynamicQuestions.length : "∞"}
                </span>
                <span className='text-xs text-gray-400 block mt-1 uppercase tracking-wider'>Total</span>
              </div>
            </div>
          </div>
        </div>

        {/* Text section */}
        <div className='flex-1 flex flex-col p-6 sm:p-8 md:p-10 relative bg-gray-50/50'>
          <h2 className='text-xl sm:text-2xl font-bold text-black mb-8 flex items-center gap-3'>
            <div className="bg-black text-white p-2 rounded-lg"><FaMicrophone size={14} /></div>
            SmartHireAI Interview
          </h2>

          {!isIntroPhase && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className='relative mb-8 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm'
            >
              <div className='flex justify-between items-center mb-4'>
                <div className='inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold'>
                  Question {currentIndex + 1} {isInterviewFinished ? `of ${dynamicQuestions.length}` : ''}
                </div>

                <div className='flex gap-2'>
                  <button onClick={repeatQuestion} disabled={isAIPlaying || isPaused} title="Repeat Question" className='p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition disabled:opacity-50'>
                    <BsArrowRepeat size={18} />
                  </button>
                  <button onClick={togglePause} title={isPaused ? "Resume Interview" : "Pause Interview"} className={`p-2 rounded-lg transition ${isPaused ? 'bg-black text-white' : 'text-gray-500 hover:text-black hover:bg-gray-100'}`}>
                    {isPaused ? <BsPlayFill size={18} /> : <BsPauseFill size={18} />}
                  </button>
                </div>
              </div>
              <div className={`text-lg sm:text-xl font-bold text-gray-900 leading-relaxed ${isPaused ? 'blur-sm opacity-50 select-none' : ''}`}>
                {isPaused ? "Interview Paused" : currentQuestion?.question}
              </div>
            </motion.div>
          )}

          <div className="relative flex-1 flex flex-col mb-2">
            <textarea
              placeholder="Type your answer here or use the microphone..."
              onChange={(e) => setAnswer(e.target.value)}
              value={answer}
              className="flex-1 w-full bg-white p-5 sm:p-6 rounded-2xl resize-none outline-none border border-gray-200 focus:border-black focus:ring-1 focus:ring-black transition shadow-sm text-gray-800 text-base"
            />
            <div className="absolute bottom-4 right-6 text-xs font-semibold pointer-events-none">
              {saveStatus === 'saving' && <span className="text-gray-400 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse"></span> Saving...</span>}
              {saveStatus === 'saved' && <span className="text-green-500 flex items-center gap-1">Draft Saved</span>}
            </div>
          </div>

          {!feedback ? (
            <div className='flex items-center gap-4 mt-6'>
                <div className='flex items-center gap-2'>
                  <motion.button
                    onClick={toggleMic}
                    whileTap={{ scale: 0.9 }}
                    className={`w-14 h-14 flex items-center justify-center rounded-2xl shadow-sm transition-colors border ${isMicOn ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                    title={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
                  >
                    {isMicOn ? <FaMicrophone size={20} /> : <FaMicrophoneSlash size={20} />}
                  </motion.button>
                  
                  {isMicOn && (
                    <div className="flex gap-1 items-center h-14 px-4 bg-gray-100 rounded-2xl border border-gray-200" title="Audio Visualizer">
                      {[...Array(6)].map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{ height: Math.max(4, (volumeLevel / 255) * 32 * (Math.random() * 0.5 + 0.5)) }}
                          className="w-1.5 bg-green-500 rounded-full"
                          transition={{ type: "tween", duration: 0.1 }}
                        />
                      ))}
                    </div>
                  )}
                </div>

              <motion.button
                onClick={submitAnswer}
                disabled={isSubmitting}
                whileTap={{ scale: 0.95 }}
                className='flex-1 bg-black text-white py-4 rounded-2xl shadow-sm hover:bg-gray-800 transition font-semibold disabled:bg-gray-300 disabled:text-gray-500 flex justify-center items-center gap-2'
              >
                {isSubmitting ? (
                  <>Processing Response <span className="animate-pulse">...</span></>
                ) : "Submit Answer"}
              </motion.button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className='mt-6 bg-white border border-gray-200 p-6 rounded-2xl shadow-sm'
            >
              <h4 className='text-xs uppercase tracking-wider text-gray-400 font-bold mb-2'>Interviewer Feedback</h4>
              <p className='text-gray-800 font-medium mb-6 leading-relaxed'>{feedback}</p>

              <button
                onClick={handleNext}
                className='w-full bg-black text-white py-4 rounded-2xl shadow-sm hover:bg-gray-800 transition flex items-center justify-center gap-2 font-semibold'
              >
                Next Question <BsArrowRight size={18} />
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Step2Interview

