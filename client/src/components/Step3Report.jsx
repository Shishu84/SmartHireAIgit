import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaCheckCircle, FaExclamationCircle, FaStar, FaCode, FaCommentDots, FaTasks } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from "motion/react";
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../context/ThemeContext';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axios from 'axios';
import { ServerUrl } from '../App';

function Step3Report({ report }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-lg">Loading Report...</p>
      </div>
    );
  }

  const {
    _id,
    finalScore = 0,
    confidence = 0,
    communication = 0,
    correctness = 0,
    questionWiseScore = [],
    aiFeedback = null
  } = report;

  // Checklist state
  const [suggestions, setSuggestions] = useState(aiFeedback?.suggestions || []);

  const toggleChecklist = async (suggestionId, currentStatus) => {
    // Optimistic UI Update
    setSuggestions(prev => prev.map(s => s._id === suggestionId ? { ...s, completed: !currentStatus } : s));
    
    if (!_id) return; // if local test

    try {
      await axios.patch(`${ServerUrl}/api/interview/${_id}/suggestion`, {
        suggestionId,
        completed: !currentStatus
      }, { withCredentials: true });
    } catch (error) {
      console.log("Failed to sync checklist", error);
      // Revert if failed
      setSuggestions(prev => prev.map(s => s._id === suggestionId ? { ...s, completed: currentStatus } : s));
    }
  };

  const questionScoreData = (questionWiseScore || []).map((scoreObj, index) => ({
    name: `Q${index + 1}`,
    score: scoreObj?.score || 0
  }));

  const downloadPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    let currentY = 25;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(16, 185, 129); // emerald
    doc.text("AI Interview Feedback Report", pageWidth / 2, currentY, { align: "center" });
    
    currentY += 15;
    doc.setFontSize(14);
    doc.setTextColor(50);
    doc.text(`Final Score: ${finalScore}/10`, 14, currentY);
    doc.text(`Confidence: ${confidence}/10`, 14, currentY + 8);
    doc.text(`Communication: ${communication}/10`, 14, currentY + 16);
    
    currentY += 30;

    if (aiFeedback) {
        autoTable(doc, {
            startY: currentY,
            head: [['Feedback Category', 'Details']],
            body: [
                ['Overall', aiFeedback.overallFeedback || 'N/A'],
                ['Technical', aiFeedback.technicalFeedback || 'N/A'],
                ['Behavioral', aiFeedback.behavioralFeedback || 'N/A'],
                ['Strengths', (aiFeedback.strengths || []).join('\n')],
                ['Improvements', (aiFeedback.improvements || []).join('\n')]
            ],
            theme: 'grid',
            headStyles: { fillColor: [16, 185, 129] }
        });
    }

    doc.save(`Interview_Feedback_${new Date().getTime()}.pdf`);
  };

  return (
    <div className='min-h-screen bg-linear-to-br from-gray-50 to-emerald-50 dark:from-slate-900 dark:to-slate-800 py-10 px-4 transition-colors duration-300'>
      <div className='max-w-6xl mx-auto space-y-8'>
        
        {/* Header */}
        <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
          <div className='flex items-center gap-4'>
            <button onClick={() => navigate("/history")} className='p-3 rounded-full bg-white dark:bg-gray-800 shadow hover:shadow-md transition text-gray-600 dark:text-gray-300'>
              <FaArrowLeft />
            </button>
            <div>
              <h1 className='text-3xl font-bold text-gray-800 dark:text-white'>AI Mock Interview Feedback Center</h1>
              <p className='text-gray-500 dark:text-gray-400 mt-1'>Comprehensive analytics and customized roadmap.</p>
            </div>
          </div>
          <button onClick={downloadPDF} className='bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-md hover:bg-emerald-700 transition'>
            Download PDF Report
          </button>
        </div>

        {/* Top Analytics Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col items-center justify-center text-center">
            <h3 className="text-gray-500 dark:text-gray-400 font-medium mb-4">Final Score</h3>
            <div className="w-32 h-32 mb-4">
              <CircularProgressbar 
                value={(finalScore/10)*100} 
                text={`${finalScore}/10`}
                styles={buildStyles({
                  pathColor: finalScore >= 7 ? '#10b981' : '#f59e0b',
                  textColor: theme === 'dark' ? '#f9fafb' : '#1f2937',
                  trailColor: theme === 'dark' ? '#374151' : '#f3f4f6',
                  pathTransitionDuration: 1.5
                })}
              />
            </div>
            <p className={`font-bold text-lg ${finalScore >= 7 ? 'text-emerald-600' : 'text-yellow-600'}`}>
              {finalScore >= 7 ? 'Excellent Performance' : 'Keep Practicing'}
            </p>
          </div>

          <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col justify-between">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-gray-800 dark:text-gray-100 font-bold text-lg">Question Performance Trend</h3>
                <div className="flex gap-6">
                    <div className="text-center"><p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{confidence}</p><p className="text-xs text-gray-400 dark:text-gray-500">Confidence</p></div>
                    <div className="text-center"><p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{communication}</p><p className="text-xs text-gray-400 dark:text-gray-500">Communication</p></div>
                    <div className="text-center"><p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{correctness}</p><p className="text-xs text-gray-400 dark:text-gray-500">Correctness</p></div>
                </div>
             </div>
             <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={questionScoreData}>
                        <defs>
                            <linearGradient id="colorQs" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f9fafb', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} itemStyle={{ color: '#10b981' }} />
                        <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorQs)" />
                    </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>

        {/* AI Feedback Center */}
        {aiFeedback && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2"><FaStar className="text-emerald-500"/> AI Evaluation</h2>
                    <div className="space-y-4">
                        <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-600">
                            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Overall Impression</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{aiFeedback.overallFeedback || "No overall feedback provided."}</p>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800/50">
                            <h4 className="text-sm font-bold text-blue-800 dark:text-blue-300 flex items-center gap-2 mb-1"><FaCode/> Technical Review</h4>
                            <p className="text-sm text-blue-700 dark:text-blue-400 leading-relaxed">{aiFeedback.technicalFeedback || "No technical feedback."}</p>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-2xl border border-purple-100 dark:border-purple-800/50">
                            <h4 className="text-sm font-bold text-purple-800 dark:text-purple-300 flex items-center gap-2 mb-1"><FaCommentDots/> Behavioral Review</h4>
                            <p className="text-sm text-purple-700 dark:text-purple-400 leading-relaxed">{aiFeedback.behavioralFeedback || "No behavioral feedback."}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2"><FaTasks className="text-emerald-600 dark:text-emerald-500"/> Persistent Preparation Roadmap</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Check off items as you complete them. Your progress is saved automatically!</p>
                        <div className="space-y-3">
                            {suggestions.map((s, i) => (
                                <label key={s._id || i} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${s.completed ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50' : 'bg-gray-50 dark:bg-slate-700/50 border-gray-200 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700'}`}>
                                    <input 
                                        type="checkbox" 
                                        checked={s.completed} 
                                        onChange={() => toggleChecklist(s._id, s.completed)}
                                        className="mt-1 w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                                    />
                                    <span className={`text-sm ${s.completed ? 'text-emerald-700 dark:text-emerald-400 line-through' : 'text-gray-700 dark:text-gray-300'}`}>{s.text}</span>
                                </label>
                            ))}
                            {suggestions.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">No suggestions available.</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-800/50">
                            <h4 className="font-bold text-emerald-800 dark:text-emerald-400 mb-3 flex items-center gap-2"><FaCheckCircle/> Strengths</h4>
                            <ul className="space-y-2">
                                {aiFeedback.strengths?.map((s,i)=><li key={i} className="text-xs text-emerald-700 dark:text-emerald-300 flex gap-2"><span className="mt-0.5">•</span> <span>{s}</span></li>)}
                            </ul>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/20 p-5 rounded-2xl border border-red-100 dark:border-red-800/50">
                            <h4 className="font-bold text-red-800 dark:text-red-400 mb-3 flex items-center gap-2"><FaExclamationCircle/> Improvements</h4>
                            <ul className="space-y-2">
                                {aiFeedback.improvements?.map((s,i)=><li key={i} className="text-xs text-red-700 dark:text-red-300 flex gap-2"><span className="mt-0.5">•</span> <span>{s}</span></li>)}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Detailed Question Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 p-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-8">Detailed Question Breakdown</h2>
            <div className="space-y-6">
                {questionWiseScore.map((q, i) => (
                    <motion.div key={i} initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} className="p-6 border border-gray-200 dark:border-slate-600 rounded-2xl bg-gray-50 dark:bg-slate-700/30">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                            <div className="flex-1">
                                <span className="inline-block px-3 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs font-bold rounded-full mb-3">Question {i+1}</span>
                                <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-lg">{q.question}</h3>
                            </div>
                            <div className="flex items-center gap-4 bg-white dark:bg-gray-800 px-4 py-2 rounded-xl shadow-sm border border-gray-100 dark:border-slate-600 shrink-0">
                                <div className="text-center"><p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{q.score}/10</p><p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase">Score</p></div>
                                <div className="w-px h-8 bg-gray-200 dark:bg-gray-600"></div>
                                <div className="text-center"><p className="text-lg font-bold text-gray-700 dark:text-gray-300">{q.confidence}/10</p><p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase">Conf</p></div>
                                <div className="w-px h-8 bg-gray-200 dark:bg-gray-600"></div>
                                <div className="text-center"><p className="text-lg font-bold text-gray-700 dark:text-gray-300">{q.correctness}/10</p><p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase">Corr</p></div>
                            </div>
                        </div>
                        <div className="mb-4">
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Your Answer:</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 italic bg-white dark:bg-gray-800/50 p-3 rounded-lg border border-gray-200 dark:border-slate-600">"{q.answer || "No audio transcript available."}"</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 mb-1">AI Feedback:</p>
                            <p className="text-sm text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg border border-emerald-100 dark:border-emerald-800/50">{q.feedback}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
        
        {/* Navigation Actions */}
        <div className="flex justify-center mt-12 mb-8">
            <button 
                onClick={() => navigate('/history')}
                className="bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 text-white px-8 py-4 rounded-2xl font-bold transition flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
                <FaTasks className="text-xl" />
                Return to Dashboard
            </button>
        </div>

      </div>
    </div>
  );
}

export default Step3Report;
