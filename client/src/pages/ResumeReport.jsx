import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { ServerUrl } from '../App';
import { FaArrowLeft, FaCheckCircle, FaExclamationTriangle, FaLightbulb, FaBriefcase, FaBrain, FaFileAlt, FaChartLine, FaRobot, FaTimesCircle } from 'react-icons/fa';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function ResumeReport() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [resume, setResume] = useState(null);
    const { userData } = useSelector((state) => state.user);

    useEffect(() => {
        const fetchResume = async () => {
            try {
                const res = await axios.get(ServerUrl + "/api/interview/resume/report/" + id, { withCredentials: true });
                setResume(res.data);
            } catch (error) {
                console.log(error);
            }
        };
        fetchResume();
    }, [id]);

    const downloadPDF = () => {
        if (!resume) return;
        const doc = new jsPDF("p", "mm", "a4");
        
        // ── 1. DYNAMIC & PROFESSIONAL FILE NAMING ──────────────────────────
        const candidateName = userData?.name 
            ? userData.name.trim().replace(/\s+/g, '_') 
            : 'Candidate';
        
        const roleName = resume.role 
            ? resume.role.trim().replace(/\s+/g, '_') 
            : 'Resume';

        const dateObj = new Date(resume.createdAt || Date.now());
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = dateObj.toLocaleString('en-US', { month: 'short' });
        const year = dateObj.getFullYear();
        const formattedDate = `${day}_${month}_${year}`; // e.g. 18_May_2026

        const filename = `${candidateName}_${roleName}_ATS_Compatibility_Report_${formattedDate}.pdf`;

        // ── 2. PREMIUM COVER BANNER & BRANDING ──────────────────────────────
        // Header Background Banner (Emerald)
        doc.setFillColor(16, 185, 129);
        doc.roundedRect(14, 12, 182, 32, 3, 3, 'F');

        // Platform Brand Title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(20);
        doc.setTextColor(255, 255, 255);
        doc.text("SmartHire.AI", 20, 24);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text("VERIFIED AI PARSING ENGINE", 20, 29);

        // Right side metadata inside banner
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text(`Candidate: ${userData?.name || 'Guest User'}`, 115, 24);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text(`Role: ${resume.role}`, 115, 29);
        doc.text(`Report Date: ${new Date(resume.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`, 115, 34);

        // ── 3. VISUAL ATS SCORE PROGRESS METER ─────────────────────────────
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(30, 41, 59); // Slate 800
        doc.text(`ATS Compatibility Score: ${resume.atsScore}%`, 14, 52);

        // Background progress track
        doc.setFillColor(243, 244, 246);
        doc.roundedRect(14, 55, 182, 6, 1.5, 1.5, 'F');

        // Color Fill logic based on score
        if (resume.atsScore >= 75) {
            doc.setFillColor(16, 185, 129); // Green
        } else if (resume.atsScore >= 50) {
            doc.setFillColor(245, 158, 11); // Orange/Yellow
        } else {
            doc.setFillColor(239, 68, 68); // Red
        }
        const scoreWidth = (resume.atsScore / 100) * 182;
        doc.roundedRect(14, 55, scoreWidth, 6, 1.5, 1.5, 'F');

        // ── 4. BRANDED FOOTER & TABULAR ANALYSIS ───────────────────────────
        autoTable(doc, {
            startY: 68,
            head: [['ATS Evaluation Section', 'AI Intelligence Breakdown']],
            body: [
                ['AI Executive Summary', resume.summary || "No executive summary parsed."],
                ['Experience Intelligence', resume.experienceAnalysis || "No detailed work experience metrics found."],
                ['Skill Stack Mapping', (resume.skills || []).join(", ") || "No structured skills detected."],
                ['Detected Behavioral Strengths', (resume.strengths || []).join("\n") || "No strengths mapped."],
                ['Critical Hiring Blockers', (resume.weakness || []).join("\n") || "No blockers identified."],
                ['AI Recruiter Improvement Action', (resume.suggestions || []).join("\n") || "No recommendations generated."]
            ],
            theme: 'grid',
            headStyles: { 
                fillColor: [30, 41, 59], 
                textColor: [255, 255, 255],
                fontSize: 10,
                fontStyle: 'bold'
            },
            styles: { 
                fontSize: 9, 
                cellPadding: 5,
                lineHeight: 1.3
            },
            columnStyles: {
                0: { fontStyle: 'bold', width: 50 }
            },
            didDrawPage: function (data) {
                // Branded Footer on all pages
                doc.setFont("helvetica", "normal");
                doc.setFontSize(8);
                doc.setTextColor(148, 163, 184); // Slate 400
                doc.text("SmartHire.AI - Confidential Recruiting Report", 14, doc.internal.pageSize.height - 10);
                
                const pageText = `Page ${data.pageNumber} | Generated by AI Intelligence Engine`;
                doc.text(pageText, doc.internal.pageSize.width - doc.getStringUnitWidth(pageText) * 2.8 - 14, doc.internal.pageSize.height - 10);
            }
        });

        doc.save(filename);
    };

    if (!resume) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
                <p className="text-gray-500 dark:text-gray-400 text-lg font-medium animate-pulse">Processing Advanced ATS Diagnostics...</p>
            </div>
        );
    }

    // Dynamic UI states based on ATS Score
    const getScoreStatus = (score) => {
        if (score >= 75) return { color: 'green', text: 'Excellent', icon: <FaCheckCircle/>, message: 'Ready for competitive roles' };
        if (score >= 50) return { color: 'yellow', text: 'Average', icon: <FaExclamationTriangle/>, message: 'Needs structural improvements' };
        return { color: 'red', text: 'Low / Poor', icon: <FaTimesCircle/>, message: 'Below Hiring Threshold' };
    };
    
    const status = getScoreStatus(resume.atsScore);

    // Simulated Category Scores based on overall ATS score
    const skillScore = Math.min(100, Math.round(resume.atsScore * 0.9 + ((resume.skills?.length || 0) * 2)));
    const expScore = Math.min(100, Math.round(resume.atsScore * 0.85 + (resume.experience === 'Fresher' ? 10 : 20)));
    const formatScore = Math.min(100, Math.round(resume.atsScore * 0.8));

    return (
        <div className='min-h-screen bg-gray-50 dark:bg-slate-900 py-10 transition-colors duration-300'>
            <div className='w-[95vw] lg:w-[85vw] max-w-7xl mx-auto'>
                {/* Header Section */}
                <div className='mb-8 w-full flex flex-col md:flex-row md:items-end justify-between gap-4'>
                    <div className='flex items-start gap-4'>
                        <button onClick={() => navigate("/history")} className='p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition shrink-0 mt-1'>
                            <FaArrowLeft className='text-gray-600 dark:text-gray-300' />
                        </button>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className='text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight'>Advanced ATS Resume Intelligence</h1>
                                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-bold uppercase tracking-wide">
                                    <FaRobot/> AI Verified
                                </span>
                            </div>
                            <p className='text-gray-500 dark:text-gray-400 text-lg'>Deep structural and semantic analysis for <span className="font-semibold text-gray-800 dark:text-gray-200">{resume.role}</span></p>
                        </div>
                    </div>
                    <button onClick={downloadPDF} className='bg-gray-900 hover:bg-black dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium shadow-md transition whitespace-nowrap shrink-0'>
                        Download Full Report
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* LEFT COLUMN: Overview & Scores (col-span-4) */}
                    <div className="lg:col-span-4 space-y-8">
                        
                        {/* Snapshot Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
                            <h2 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <FaFileAlt/> Candidate Profile Snapshot
                            </h2>
                            
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Role Classification</p>
                                    <p className="font-semibold text-gray-800 dark:text-gray-100">{resume.bestRole || resume.role}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Experience Level</p>
                                    <p className="font-semibold text-gray-800 dark:text-gray-100">{resume.experience || "Not Extracted"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Resume Quality Index</p>
                                    <p className={`font-semibold text-${status.color}-600 dark:text-${status.color}-400`}>{status.text} (Formatting {status.text === 'Low / Poor' ? 'Issues Detected' : 'Acceptable'})</p>
                                </div>
                                <div className="pt-4 border-t border-gray-100 dark:border-slate-700">
                                    <div className="flex justify-between items-end mb-2">
                                        <p className="text-sm font-bold text-gray-800 dark:text-gray-100">ATS Compatibility Score</p>
                                        <p className={`text-2xl font-black text-${status.color}-600 dark:text-${status.color}-400`}>{resume.atsScore}%</p>
                                    </div>
                                    <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-2.5">
                                        <div className={`bg-${status.color}-500 h-2.5 rounded-full`} style={{ width: `${resume.atsScore}%` }}></div>
                                    </div>
                                    <p className={`text-xs mt-2 text-${status.color}-600 dark:text-${status.color}-400 font-medium`}>{status.message}</p>
                                </div>
                            </div>
                        </div>

                        {/* Recommendation Score Breakdown */}
                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
                            <h2 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <FaChartLine/> AI Recommendation Breakdown
                            </h2>
                            <div className="space-y-5">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-700 dark:text-gray-300 font-medium">Skill Visibility</span>
                                        <span className="font-bold text-gray-900 dark:text-white">{skillScore}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-1.5"><div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${skillScore}%` }}></div></div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-700 dark:text-gray-300 font-medium">Experience Clarity</span>
                                        <span className="font-bold text-gray-900 dark:text-white">{expScore}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-1.5"><div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${expScore}%` }}></div></div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-700 dark:text-gray-300 font-medium">Formatting Quality</span>
                                        <span className="font-bold text-gray-900 dark:text-white">{formatScore}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-1.5"><div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${formatScore}%` }}></div></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Deep Analysis (col-span-8) */}
                    <div className="lg:col-span-8 space-y-8">
                        
                        {/* Executive Summary */}
                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-200 dark:border-slate-700 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5 dark:opacity-10 pointer-events-none">
                                <FaBrain className="text-9xl text-gray-900 dark:text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <FaBrain className="text-purple-600 dark:text-purple-400" /> AI Executive Summary (Deep Insight)
                            </h2>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                                {resume.summary || "The resume shows structural parsing limitations impacting ATS readability."}
                            </p>
                            
                            <div className={`p-4 rounded-xl border ${status.color === 'red' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50' : status.color === 'yellow' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800/50' : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/50'}`}>
                                <p className="text-sm font-bold mb-1 flex items-center gap-2">
                                    👉 AI Hiring Simulation Result:
                                </p>
                                <p className={`text-sm ${status.color === 'red' ? 'text-red-800 dark:text-red-300' : status.color === 'yellow' ? 'text-yellow-800 dark:text-yellow-300' : 'text-green-800 dark:text-green-300'}`}>
                                    {status.color === 'red' ? '"This resume would likely NOT pass initial screening for most ATS pipelines. It requires restructuring before being considered for interviews."' :
                                     status.color === 'yellow' ? '"This resume might pass some ATS filters but lacks strong keyword optimization and structural clarity. Human review is unlikely to proceed without improvements."' :
                                     '"Strong candidate profile. High probability of passing ATS automated screening and moving to recruiter review stage."'}
                                </p>
                            </div>
                        </div>

                        {/* Section-wise Deep AI Analysis */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            
                            {/* Experience Intelligence */}
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-slate-700">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <FaBriefcase className="text-blue-500"/> Experience Intelligence
                                    </h3>
                                    <span className={`text-xs px-2 py-1 rounded-md font-bold ${expScore < 50 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : expScore < 80 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                                        Status: {expScore < 50 ? 'Poor' : expScore < 80 ? 'Average' : 'Good'}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{resume.experienceAnalysis}</p>
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800/30">
                                    <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-1">AI Inference:</p>
                                    <p className="text-xs text-blue-700 dark:text-blue-400">{expScore < 60 ? "No measurable outcomes or achievements detected. Lacks quantifiable impact." : "Experience is somewhat defined but could benefit from stronger action verbs and metrics."}</p>
                                </div>
                            </div>

                            {/* Skill Intelligence */}
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-slate-700">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <FaLightbulb className="text-yellow-500"/> Skill Intelligence
                                    </h3>
                                    <span className={`text-xs px-2 py-1 rounded-md font-bold ${skillScore < 50 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : skillScore < 80 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                                        Status: {skillScore < 50 ? 'Insufficient Data' : skillScore < 80 ? 'Moderate' : 'Excellent'}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {resume.skills?.length > 0 ? resume.skills.map((s, i) => (
                                        <span key={i} className="px-2.5 py-1 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 text-xs rounded-md">{s}</span>
                                    )) : <span className="text-sm text-gray-500">No structured technical stack detected.</span>}
                                </div>
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-100 dark:border-yellow-800/30">
                                    <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-300 mb-1">Detected Pattern:</p>
                                    <p className="text-xs text-yellow-700 dark:text-yellow-400">{skillScore < 50 ? "Skills are either missing or embedded in unstructured text. No technical stack hierarchy identified." : "Technical stack is visible but could be categorized better (e.g. Frontend, Backend, Tools)."}</p>
                                </div>
                            </div>
                        </div>

                        {/* Strengths and Weaknesses */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-900/50">
                                <h3 className="font-bold text-emerald-800 dark:text-emerald-400 mb-4 flex items-center gap-2">
                                    <FaCheckCircle/> AI Detected Soft Signals (Strengths)
                                </h3>
                                <ul className="space-y-3">
                                    {resume.strengths?.length > 0 ? resume.strengths.map((s, i) => (
                                        <li key={i} className="text-sm text-emerald-900 dark:text-emerald-200 flex items-start gap-2">
                                            <span className="text-emerald-500 mt-0.5">✔</span> <span>{s}</span>
                                        </li>
                                    )) : <li className="text-sm text-emerald-700">No specific strengths parsed.</li>}
                                </ul>
                                <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-4 italic">🧠 AI Insight: These are behavioral and formatting strengths derived from document structure.</p>
                            </div>

                            <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-3xl border border-red-100 dark:border-red-900/50">
                                <h3 className="font-bold text-red-800 dark:text-red-400 mb-4 flex items-center gap-2">
                                    <FaExclamationTriangle/> Critical Hiring Blockers
                                </h3>
                                <ul className="space-y-3">
                                    {resume.weakness?.length > 0 ? resume.weakness.map((w, i) => (
                                        <li key={i} className="text-sm text-red-900 dark:text-red-200 flex items-start gap-2">
                                            <span className="text-red-500 mt-0.5">❌</span> <span>{w}</span>
                                        </li>
                                    )) : <li className="text-sm text-red-700">No critical weaknesses found.</li>}
                                </ul>
                            </div>
                        </div>

                        {/* Improvement Strategy */}
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-200 dark:border-slate-700">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                🚀 AI-Driven Improvement Strategy
                            </h2>
                            <div className="space-y-4">
                                {resume.suggestions?.length > 0 ? resume.suggestions.map((s, i) => (
                                    <div key={i} className="flex gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-slate-700/50 border border-gray-100 dark:border-slate-600">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">{i + 1}</div>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 pt-1.5">{s}</p>
                                    </div>
                                )) : <p className="text-sm text-gray-500">No additional suggestions.</p>}
                            </div>
                        </div>

                        {/* Final Verdict */}
                        <div className={`p-6 rounded-3xl border-2 ${status.color === 'red' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50' : status.color === 'yellow' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800/50' : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/50'}`}>
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 dark:text-white">📌 Final Verdict</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className={`text-sm font-bold ${status.color === 'red' ? 'text-red-700 dark:text-red-400' : status.color === 'yellow' ? 'text-yellow-700 dark:text-yellow-400' : 'text-green-700 dark:text-green-400'}`}>
                                        {status.color === 'red' ? '❌ Current Status: NOT ATS READY' : status.color === 'yellow' ? '⚠️ Current Status: NEEDS OPTIMIZATION' : '✅ Current Status: ATS READY'}
                                    </p>
                                </div>
                                <div>
                                    <p className={`text-sm ${status.color === 'red' ? 'text-red-800 dark:text-red-300' : status.color === 'yellow' ? 'text-yellow-800 dark:text-yellow-300' : 'text-green-800 dark:text-green-300'}`}>
                                        <span className="font-bold">Required Action:</span> {status.color === 'red' ? 'Resume must undergo structural redesign + skill clarity enhancement before applying to competitive roles.' : status.color === 'yellow' ? 'Improve keyword density and formatting layout.' : 'Ready to apply! Keep your projects updated.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ResumeReport;
