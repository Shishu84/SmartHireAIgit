import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ServerUrl } from '../App';
import { FaArrowLeft, FaCheckCircle, FaExclamationTriangle, FaLightbulb, FaBriefcase } from 'react-icons/fa';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function ResumeReport() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [resume, setResume] = useState(null);
    const [jd, setJd] = useState("");
    const [matchResult, setMatchResult] = useState(null);

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

    const handleCompare = () => {
        if (!jd.trim() || !resume) return;
        
        const jdLower = jd.toLowerCase();
        const extractedSkills = resume.skills || [];
        
        let matched = [];
        let missing = [];

        // Simple mock logic for missing keywords. In a full system, you could ping the AI again!
        // But per zero dummy data policy, we strictly extract what we can using exact match.
        // We will tokenize the JD and find common tech words missing from skills.
        const jdWords = jdLower.match(/\b(\w+)\b/g) || [];
        const techKeywords = ['react', 'node', 'javascript', 'typescript', 'docker', 'kubernetes', 'aws', 'python', 'java', 'sql', 'nosql', 'mongodb', 'ci/cd', 'agile', 'css', 'html', 'git', 'redux'];
        
        const jdTechWords = [...new Set(jdWords.filter(w => techKeywords.includes(w)))];
        
        const resumeSkillsLower = extractedSkills.map(s => s.toLowerCase());

        jdTechWords.forEach(kw => {
            const hasMatch = resumeSkillsLower.some(rs => rs.includes(kw));
            if (hasMatch) {
                matched.push(kw);
            } else {
                missing.push(kw);
            }
        });

        const score = jdTechWords.length > 0 ? Math.round((matched.length / jdTechWords.length) * 100) : 100;
        
        setMatchResult({
            score,
            matched,
            missing
        });
    };

    const downloadPDF = () => {
        if (!resume) return;
        const doc = new jsPDF("p", "mm", "a4");
        
        doc.setFontSize(22);
        doc.setTextColor(16, 185, 129); // Emerald
        doc.text("ATS Resume Analysis Report", 14, 22);

        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(`Role: ${resume.role}`, 14, 32);
        doc.text(`Experience: ${resume.experience || "Not specified"}`, 14, 38);
        doc.text(`ATS Score: ${resume.atsScore}%`, 14, 44);
        doc.text(`Date: ${new Date(resume.createdAt).toLocaleDateString()}`, 14, 50);

        autoTable(doc, {
            startY: 60,
            head: [['Section', 'Details']],
            body: [
                ['Summary', resume.summary || "None"],
                ['Best Fit Role', resume.bestRole || "None"],
                ['Experience Analysis', resume.experienceAnalysis || "None"],
                ['Skills', (resume.skills || []).join(", ")],
                ['Strengths', (resume.strengths || []).join("\n")],
                ['Weaknesses', (resume.weakness || []).join("\n")],
                ['Suggestions', (resume.suggestions || []).join("\n")]
            ],
            theme: 'grid',
            headStyles: { fillColor: [16, 185, 129] },
            styles: { fontSize: 10, cellPadding: 4 }
        });

        doc.save(`Resume_Report_${resume.role.replace(/\s+/g, '_')}.pdf`);
    };

    if (!resume) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
                <p className="text-gray-500 dark:text-gray-400 text-lg">Loading Resume Report...</p>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-linear-to-br from-gray-50 to-emerald-50 dark:from-slate-900 dark:to-slate-800 py-10 transition-colors duration-300'>
            <div className='w-[90vw] lg:w-[75vw] max-w-[100%] mx-auto'>
                {/* Header */}
                <div className='mb-8 w-full flex items-center justify-between'>
                    <div className='flex items-center gap-4'>
                        <button onClick={() => navigate("/history")} className='p-3 rounded-full bg-white dark:bg-gray-800 shadow hover:shadow-md transition'>
                            <FaArrowLeft className='text-gray-600 dark:text-gray-300' />
                        </button>
                        <div>
                            <h1 className='text-3xl font-bold text-gray-800 dark:text-white'>ATS Resume Diagnostics</h1>
                            <p className='text-gray-500 dark:text-gray-400 mt-1'>Detailed breakdown for {resume.role} position</p>
                        </div>
                    </div>
                    <button onClick={downloadPDF} className='bg-emerald-600 text-white px-6 py-2 rounded-xl font-medium shadow-md hover:bg-emerald-700 transition'>
                        Download Report
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col items-center text-center">
                            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Overall ATS Score</h2>
                            <div className={`w-32 h-32 flex items-center justify-center rounded-full border-8 font-bold text-4xl mb-4
                                ${resume.atsScore >= 75 ? 'border-green-500 text-green-600 dark:text-green-400' : resume.atsScore >= 50 ? 'border-yellow-500 text-yellow-600 dark:text-yellow-400' : 'border-red-500 text-red-600 dark:text-red-400'}`}>
                                {resume.atsScore}%
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Best Matched Role:</p>
                            <p className="font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-4 py-1 rounded-full">{resume.bestRole || resume.role}</p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                            <h3 className="font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2 mb-4"><FaBriefcase className="text-blue-500"/> Experience Analysis</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{resume.experienceAnalysis || "No detailed experience analysis available."}</p>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Skills Comparator */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                            <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg mb-4">Target Job Description Skill Gap Analyzer</h3>
                            <textarea 
                                value={jd}
                                onChange={(e) => setJd(e.target.value)}
                                placeholder="Paste your target Job Description here to compare compatibility in real-time..."
                                className="w-full h-32 p-4 border border-gray-200 dark:border-slate-600 bg-transparent dark:bg-slate-900 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-gray-700 dark:text-gray-300 dark:placeholder-gray-500 mb-4 resize-none"
                            ></textarea>
                            
                            {!matchResult ? (
                                <button onClick={handleCompare} disabled={!jd.trim()} className="w-full bg-gray-900 dark:bg-emerald-600 text-white disabled:bg-gray-400 dark:disabled:bg-slate-700 py-3 rounded-xl font-medium transition hover:bg-black dark:hover:bg-emerald-700 shadow-md">
                                    Check Match %
                                </button>
                            ) : (
                                <div className="mt-4 p-5 bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-gray-200 dark:border-slate-600">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="font-bold text-gray-800 dark:text-gray-100">JD Match Score</h4>
                                        <span className={`px-3 py-1 rounded-full font-bold text-sm ${matchResult.score >= 70 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'}`}>
                                            {matchResult.score}% Compatibility
                                        </span>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2">✅ Extracted Matches</p>
                                            <div className="flex flex-wrap gap-2">
                                                {matchResult.matched.length > 0 ? matchResult.matched.map((m, i) => <span key={i} className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-md">{m}</span>) : <span className="text-xs text-gray-500 dark:text-gray-400">No major keywords matched.</span>}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">⚠️ Missing Keywords (Highly Recommended)</p>
                                            <div className="flex flex-wrap gap-2">
                                                {matchResult.missing.length > 0 ? matchResult.missing.map((m, i) => <span key={i} className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs rounded-md">{m}</span>) : <span className="text-xs text-gray-500 dark:text-gray-400">No major missing keywords detected!</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => setMatchResult(null)} className="mt-4 text-sm text-emerald-600 dark:text-emerald-400 font-medium hover:underline">Reset Comparison</button>
                                </div>
                            )}
                        </div>

                        {/* Strengths & Weaknesses Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800/50">
                                <h3 className="font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-2 mb-4"><FaCheckCircle/> Detected Strengths</h3>
                                <ul className="space-y-2">
                                    {(resume.strengths || []).length > 0 ? resume.strengths.map((s, i) => (
                                        <li key={i} className="text-sm text-emerald-700 dark:text-emerald-300 flex items-start gap-2"><span className="mt-1 font-bold">•</span> <span>{s}</span></li>
                                    )) : <li className="text-sm text-emerald-700 dark:text-emerald-300">No specific strengths parsed.</li>}
                                </ul>
                            </div>
                            <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl border border-red-100 dark:border-red-800/50">
                                <h3 className="font-bold text-red-800 dark:text-red-400 flex items-center gap-2 mb-4"><FaExclamationTriangle/> Growth & ATS Improvements</h3>
                                <ul className="space-y-2">
                                    {(resume.weakness || []).length > 0 ? resume.weakness.map((w, i) => (
                                        <li key={i} className="text-sm text-red-700 dark:text-red-300 flex items-start gap-2"><span className="mt-1 font-bold">•</span> <span>{w}</span></li>
                                    )) : <li className="text-sm text-red-700 dark:text-red-300">No specific weaknesses parsed.</li>}
                                </ul>
                            </div>
                        </div>

                        {/* Actionable Suggestions */}
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-2xl border border-purple-100 dark:border-purple-800/50">
                            <h3 className="font-bold text-purple-800 dark:text-purple-400 flex items-center gap-2 mb-4"><FaLightbulb/> Actionable Keyword & Layout Recommendations</h3>
                            <ul className="space-y-3">
                                {(resume.suggestions || []).length > 0 ? resume.suggestions.map((s, i) => (
                                    <li key={i} className="text-sm text-purple-700 dark:text-purple-300 bg-white dark:bg-purple-900/40 p-3 rounded-lg shadow-sm border border-purple-100 dark:border-purple-800/50">{s}</li>
                                )) : <p className="text-sm text-purple-700 dark:text-purple-300">No additional suggestions.</p>}
                            </ul>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default ResumeReport;
