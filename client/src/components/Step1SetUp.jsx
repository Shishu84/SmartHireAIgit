import React from 'react'
import { motion } from "motion/react"
import {
    FaUserTie,
    FaBriefcase,
    FaFileUpload,
    FaMicrophoneAlt,
    FaChartLine,
} from "react-icons/fa";
import { useState } from 'react';
import axios from "axios"
import { ServerUrl } from '../App';
import { useDispatch, useSelector } from 'react-redux';
import { setUserData } from '../redux/userSlice';
function Step1SetUp({ onStart }) {
    const { userData } = useSelector((state) => state.user)
    const dispatch = useDispatch()
    const [role, setRole] = useState("");
    const [experience, setExperience] = useState("");
    const [mode, setMode] = useState("Technical");
    const [resumeFile, setResumeFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [projects, setProjects] = useState([]);
    const [skills, setSkills] = useState([]);
    const [resumeText, setResumeText] = useState("");
    const [analysisDone, setAnalysisDone] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState("");
    const [atsData, setAtsData] = useState(null);


    const handleUploadResume = async () => {
        if (!resumeFile || analyzing) return;
        setAnalyzing(true)

        const formdata = new FormData()
        formdata.append("resume", resumeFile)

        try {
            const result = await axios.post(ServerUrl + "/api/interview/resume", formdata, { withCredentials: true })

            console.log(result.data)

            setRole(result.data.role || "");
            setExperience(result.data.experience || "");
            setProjects(result.data.projects || []);
            setSkills(result.data.skills || []);
            setResumeText(result.data.resumeText || "");
            
            setAtsData({
                atsScore: result.data.atsScore || 0,
                summary: result.data.summary || "",
                strengths: result.data.strengths || [],
                weakness: result.data.weakness || [],
                experienceAnalysis: result.data.experienceAnalysis || "",
                bestRole: result.data.bestRole || "",
                suggestions: result.data.suggestions || []
            });

            setAnalysisDone(true);
            setAnalyzing(false);

        } catch (error) {
            console.log(error)
            setAnalyzing(false);
            setAnalysisError(error.response?.data?.message || "Failed to analyze resume. Please try again.");
        }
    }

    const handleStart = async () => {
        setLoading(true)
        setAnalysisError("");
        try {
            const result = await axios.post(ServerUrl + "/api/interview/generate-questions", { role, experience, mode, resumeText, projects, skills }, { withCredentials: true })
            console.log(result.data)
            if (userData) {
                dispatch(setUserData({ ...userData, credits: result.data.creditsLeft }))
            }
            setLoading(false)
            onStart({ ...result.data, role })

        } catch (error) {
            console.log(error)
            setLoading(false)
            setAnalysisError(error.response?.data?.message || "Failed to start interview. Please try again.");
        }
    }
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className='min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 px-4'>

            <div className='w-full max-w-6xl bg-white rounded-3xl shadow-2xl grid md:grid-cols-2 overflow-hidden'>

                <motion.div
                    initial={{ x: -80, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.7 }}
                    className='relative bg-gradient-to-br from-green-50 to-green-100 p-12 flex flex-col justify-center'>

                    <h2 className="text-4xl font-bold text-gray-800 mb-6">
                        Start Your AI Interview
                    </h2>

                    <p className="text-gray-600 mb-10">
                        Practice real interview scenarios powered by AI.
                        Improve communication, technical skills, and confidence.
                    </p>

                    <div className='space-y-5'>

                        {
                            [
                                {
                                    icon: <FaUserTie className="text-green-600 text-xl" />,
                                    text: "Choose Role & Experience",
                                },
                                {
                                    icon: <FaMicrophoneAlt className="text-green-600 text-xl" />,
                                    text: "Smart Voice Interview",
                                },
                                {
                                    icon: <FaChartLine className="text-green-600 text-xl" />,
                                    text: "Performance Analytics",
                                },
                            ].map((item, index) => (
                                <motion.div key={index}
                                    initial={{ y: 30, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 + index * 0.15 }}
                                    whileHover={{ scale: 1.03 }}
                                    className='flex items-center space-x-4 bg-white p-4 rounded-xl shadow-sm cursor-pointer'>
                                    {item.icon}
                                    <span className='text-gray-700 font-medium'>{item.text}</span>

                                </motion.div>
                            ))
                        }
                    </div>



                </motion.div>



                <motion.div
                    initial={{ x: 80, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.7 }}
                    className="p-12 bg-white">

                    <h2 className='text-3xl font-bold text-gray-800 mb-8'>
                        Interview SetUp
                    </h2>

                    {analysisError && (
                        <div className="p-4 mb-6 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium">
                            {analysisError}
                        </div>
                    )}

                    <div className='space-y-6'>

                        <div className='relative'>
                            <FaUserTie className='absolute top-4 left-4 text-gray-400' />

                            <input type='text' id='role' name='role' placeholder='Enter role'
                                className='w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition'
                                onChange={(e) => setRole(e.target.value)} value={role} />
                        </div>


                        <div className='relative'>
                            <FaBriefcase className='absolute top-4 left-4 text-gray-400' />

                            <input type='text' id='experience' name='experience' placeholder='Experience (e.g. 2 years)'
                                className='w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition'
                                onChange={(e) => setExperience(e.target.value)} value={experience} />



                        </div>

                        <select id='mode' name='mode' value={mode}
                            onChange={(e) => setMode(e.target.value)}
                            className='w-full py-3 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition'>

                            <option value="Technical">Technical Interview</option>
                            <option value="HR">HR Interview</option>

                        </select>

                        {!analysisDone && (
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                onClick={() => document.getElementById("resumeUpload").click()}
                                className='border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition'>

                                <FaFileUpload className='text-4xl mx-auto text-green-600 mb-3' />

                                <input type="file"
                                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                                    id="resumeUpload"
                                    className='hidden'
                                    onChange={(e) => setResumeFile(e.target.files[0])}
                                    onClick={(e) => (e.target.value = null)} />

                                <p className='text-gray-600 font-medium'>
                                    {resumeFile ? resumeFile.name : "Click to upload resume (Optional)"}
                                </p>

                                {resumeFile && (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleUploadResume()
                                        }}

                                        className='mt-4 bg-gray-900 text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition'>
                                        {analyzing ? "Analyzing..." : "Analyze Resume"}



                                    </motion.button>)}

                            </motion.div>


                        )}

                        {analysisDone && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className='bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4 shadow-inner max-h-[60vh] overflow-y-auto'>
                                <h3 className='text-xl font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4'>
                                    Comprehensive ATS Analysis
                                </h3>
                                    
                                {projects.length === 0 && skills.length === 0 && (!atsData || !atsData.summary) && (
                                    <div className="p-4 bg-yellow-50 text-yellow-700 rounded-lg text-sm border border-yellow-200">
                                        We couldn't extract any specific data from your resume. You can manually enter your details above or continue as is.
                                    </div>
                                )}

                                {atsData && (
                                    <div className="space-y-5">
                                        <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                            <div className={`w-16 h-16 flex items-center justify-center rounded-full border-4 font-bold text-xl ${atsData.atsScore >= 75 ? 'border-green-500 text-green-600' : atsData.atsScore >= 50 ? 'border-yellow-500 text-yellow-600' : 'border-red-500 text-red-600'}`}>
                                                {atsData.atsScore}%
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-800 text-lg">ATS Match Score</h4>
                                                <p className="text-sm text-gray-500">Based on standard industry requirements.</p>
                                            </div>
                                        </div>

                                        {atsData.summary && (
                                            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl shadow-sm">
                                                <h4 className="text-sm font-bold text-blue-800 mb-2 uppercase tracking-wide">Professional Summary</h4>
                                                <p className="text-sm text-blue-700 leading-relaxed">{atsData.summary}</p>
                                            </div>
                                        )}

                                        {atsData.bestRole && (
                                            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl shadow-sm">
                                                <h4 className="text-sm font-bold text-emerald-800 mb-1 uppercase tracking-wide">Best Job Role Match</h4>
                                                <p className="text-sm font-semibold text-emerald-700">{atsData.bestRole}</p>
                                            </div>
                                        )}
                                        
                                        {atsData.experienceAnalysis && (
                                            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl shadow-sm">
                                                <h4 className="text-sm font-bold text-indigo-800 mb-2 uppercase tracking-wide">Experience Analysis</h4>
                                                <p className="text-sm text-indigo-700 leading-relaxed">{atsData.experienceAnalysis}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {projects.length > 0 && (
                                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                        <p className='font-bold text-gray-800 mb-2 uppercase tracking-wide text-sm'>
                                            Key Projects
                                        </p>
                                        <ul className='list-disc list-inside text-gray-600 space-y-1 text-sm'>
                                            {projects.map((p, i) => (
                                                <li key={i}>{p}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {skills.length > 0 && (
                                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                        <p className='font-bold text-gray-800 mb-2 uppercase tracking-wide text-sm'>
                                            Extracted Skills
                                        </p>
                                        <div className='flex flex-wrap gap-2'>
                                            {skills.map((s, i) => (
                                                <span key={i} className='bg-green-50 border border-green-200 text-green-700 px-3 py-1 rounded-full text-xs font-semibold shadow-sm'>{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {atsData && atsData.strengths && atsData.strengths.length > 0 && (
                                    <div className="bg-teal-50 border border-teal-100 p-4 rounded-xl shadow-sm">
                                        <h4 className="text-sm font-bold text-teal-800 mb-2 uppercase tracking-wide">Key Strengths</h4>
                                        <ul className="list-disc list-inside text-sm text-teal-700 space-y-1">
                                            {atsData.strengths.map((s, i) => <li key={i}>{s}</li>)}
                                        </ul>
                                    </div>
                                )}

                                {atsData && atsData.weakness && atsData.weakness.length > 0 && (
                                    <div className="bg-red-50 border border-red-100 p-4 rounded-xl shadow-sm">
                                        <h4 className="text-sm font-bold text-red-800 mb-2 uppercase tracking-wide">Areas for Improvement</h4>
                                        <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                                            {atsData.weakness.map((w, i) => <li key={i}>{w}</li>)}
                                        </ul>
                                    </div>
                                )}

                                {atsData && atsData.suggestions && atsData.suggestions.length > 0 && (
                                    <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl shadow-sm">
                                        <h4 className="text-sm font-bold text-purple-800 mb-2 uppercase tracking-wide">Actionable Suggestions</h4>
                                        <ul className="list-disc list-inside text-sm text-purple-700 space-y-1">
                                            {atsData.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                                        </ul>
                                    </div>
                                )}

                            </motion.div>
                        )}


                        <motion.button
                            onClick={handleStart}
                            disabled={!role || !experience || loading}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.95 }}
                            className='w-full disabled:bg-gray-600 bg-green-600 hover:bg-green-700 text-white py-3 rounded-full text-lg font-semibold transition duration-300 shadow-md'>
                            {loading ? "Staring..." : "Start Interview"}


                        </motion.button>
                    </div>

                </motion.div>
            </div>

        </motion.div>
    )
}

export default Step1SetUp
