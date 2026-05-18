import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ServerUrl } from '../App';
import { FaArrowLeft, FaHistory, FaFileAlt, FaUserEdit, FaChartBar, FaEye, FaDownload, FaTrash, FaCheck, FaTimes, FaSpinner, FaLock, FaExclamationTriangle } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function InterviewHistory() {
    const { userData } = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const [interviews, setInterviews] = useState([]);
    const [resumes, setResumes] = useState([]);
    const [activeTab, setActiveTab] = useState('history'); // history, resumes, profile, analytics
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(true);

    // Selection states for bulk delete
    const [selectedInterviews, setSelectedInterviews] = useState([]);
    const [selectedResumes, setSelectedResumes] = useState([]);

    // Delete confirmation modal states
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'interview'|'resume'|'bulk_interview'|'bulk_resume', id?: string }
    const [isDeleting, setIsDeleting] = useState(false);

    // Toast/Alert notification state
    const [notification, setNotification] = useState(null); // { type: 'success'|'error', message: '' }

    // Profile form state
    const [formData, setFormData] = useState({
        experience: '',
        linkedin: '',
        github: '',
        portfolio: ''
    });

    useEffect(() => {
        if (userData) {
            setFormData({
                experience: userData.experience || '',
                linkedin: userData.socials?.linkedin || '',
                github: userData.socials?.github || '',
                portfolio: userData.socials?.portfolio || ''
            });
        }
    }, [userData]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [intRes, resRes] = await Promise.all([
                axios.get(ServerUrl + "/api/interview/get-interview", { withCredentials: true }),
                axios.get(ServerUrl + "/api/interview/resume/history", { withCredentials: true })
            ]);
            setInterviews(intRes.data);
            setResumes(resRes.data);
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    // Re-fetch every time the user navigates to this page
    useEffect(() => {
        fetchData();
    }, [location.key]);

    const triggerNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 4000);
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.put(ServerUrl + "/api/user/update-profile", {
                experience: formData.experience,
                socials: {
                    linkedin: formData.linkedin,
                    github: formData.github,
                    portfolio: formData.portfolio
                }
            }, { withCredentials: true });
            dispatch(setUserData(res.data));
            triggerNotification('success', "Profile updated successfully!");
        } catch (error) {
            console.log("Profile update failed", error);
            triggerNotification('error', "Failed to update profile.");
        }
    };

    // ── PDF DYNAMIC EXPORT GENERATOR FROM DASHBOARD ───────────────────
    const handleDownloadPDF = async (item, type) => {
        try {
            if (type === 'resume') {
                const res = await axios.get(ServerUrl + "/api/interview/resume/report/" + item._id, { withCredentials: true });
                const report = res.data;
                const doc = new jsPDF("p", "mm", "a4");

                // Dynamic Name Constructor
                const candName = userData?.name ? userData.name.trim().replace(/\s+/g, '_') : 'Candidate';
                const roleName = report.role ? report.role.trim().replace(/\s+/g, '_') : 'Resume';
                const dateObj = new Date(report.createdAt);
                const day = String(dateObj.getDate()).padStart(2, '0');
                const month = dateObj.toLocaleString('en-US', { month: 'short' });
                const formattedDate = `${day}_${month}_${dateObj.getFullYear()}`;
                const filename = `${candName}_${roleName}_ATS_Compatibility_Report_${formattedDate}.pdf`;

                // Design
                doc.setFillColor(16, 185, 129);
                doc.roundedRect(14, 12, 182, 32, 3, 3, 'F');

                doc.setFont("helvetica", "bold");
                doc.setFontSize(20);
                doc.setTextColor(255, 255, 255);
                doc.text("SmartHire.AI", 20, 24);

                doc.setFont("helvetica", "normal");
                doc.setFontSize(9);
                doc.text("VERIFIED AI PARSING ENGINE", 20, 29);

                doc.setFont("helvetica", "bold");
                doc.setFontSize(11);
                doc.text(`Candidate: ${userData?.name || 'User'}`, 115, 24);
                doc.setFont("helvetica", "normal");
                doc.text(`Role: ${report.role}`, 115, 29);
                doc.text(`Report Date: ${new Date(report.createdAt).toLocaleDateString()}`, 115, 34);

                doc.setFont("helvetica", "bold");
                doc.setTextColor(30, 41, 59);
                doc.text(`ATS Compatibility Score: ${report.atsScore}%`, 14, 52);

                doc.setFillColor(243, 244, 246);
                doc.roundedRect(14, 55, 182, 6, 1.5, 1.5, 'F');
                doc.setFillColor(report.atsScore >= 75 ? 16 : 245, report.atsScore >= 75 ? 185 : 158, report.atsScore >= 75 ? 129 : 11);
                doc.roundedRect(14, 55, (report.atsScore / 100) * 182, 6, 1.5, 1.5, 'F');

                autoTable(doc, {
                    startY: 68,
                    head: [['ATS Evaluation Section', 'AI Intelligence Breakdown']],
                    body: [
                        ['AI Executive Summary', report.summary || ""],
                        ['Experience Intelligence', report.experienceAnalysis || ""],
                        ['Skill Stack Mapping', (report.skills || []).join(", ")],
                        ['Detected Behavioral Strengths', (report.strengths || []).join("\n")],
                        ['Critical Hiring Blockers', (report.weakness || []).join("\n")],
                        ['AI Recruiter Improvement Action', (report.suggestions || []).join("\n")]
                    ],
                    theme: 'grid',
                    headStyles: { fillColor: [30, 41, 59] },
                    styles: { fontSize: 9, cellPadding: 5 }
                });

                doc.save(filename);
            } else if (type === 'interview') {
                const res = await axios.get(ServerUrl + "/api/interview/report/" + item._id, { withCredentials: true });
                const report = res.data;
                const doc = new jsPDF("p", "mm", "a4");

                // Dynamic Name Constructor
                const candName = userData?.name ? userData.name.trim().replace(/\s+/g, '_') : 'Candidate';
                const roleName = item.role ? item.role.trim().replace(/\s+/g, '_') : 'Mock_Interview';
                const dateObj = new Date(item.createdAt);
                const day = String(dateObj.getDate()).padStart(2, '0');
                const month = dateObj.toLocaleString('en-US', { month: 'short' });
                const formattedDate = `${day}_${month}_${dateObj.getFullYear()}`;
                const filename = `${candName}_${roleName}_Interview_Feedback_${formattedDate}.pdf`;

                // Design
                doc.setFillColor(59, 130, 246); // Blue
                doc.roundedRect(14, 12, 182, 32, 3, 3, 'F');

                doc.setFont("helvetica", "bold");
                doc.setFontSize(20);
                doc.setTextColor(255, 255, 255);
                doc.text("SmartHire.AI", 20, 24);

                doc.setFont("helvetica", "normal");
                doc.setFontSize(9);
                doc.text("VERIFIED AI INTERVIEW ENGINE", 20, 29);

                doc.setFont("helvetica", "bold");
                doc.setFontSize(11);
                doc.text(`Candidate: ${userData?.name || 'User'}`, 115, 24);
                doc.setFont("helvetica", "normal");
                doc.text(`Role: ${item.role}`, 115, 29);
                doc.text(`Interview Date: ${new Date(item.createdAt).toLocaleDateString()}`, 115, 34);

                doc.setFont("helvetica", "bold");
                doc.setTextColor(30, 41, 59);
                doc.text(`Mock Interview Score: ${report.finalScore?.toFixed(1) || '0'}/10`, 14, 52);

                doc.setFillColor(243, 244, 246);
                doc.roundedRect(14, 55, 182, 6, 1.5, 1.5, 'F');
                doc.setFillColor(59, 130, 246);
                doc.roundedRect(14, 55, ((report.finalScore || 0) / 10) * 182, 6, 1.5, 1.5, 'F');

                autoTable(doc, {
                    startY: 68,
                    head: [['Feedback Section', 'AI Intelligence Breakdown']],
                    body: [
                        ['AI Overall Feedback', report.aiFeedback?.overallFeedback || ""],
                        ['Technical Feedback', report.aiFeedback?.technicalFeedback || ""],
                        ['Behavioral Feedback', report.aiFeedback?.behavioralFeedback || ""],
                        ['Confidence Level', `${report.confidence}/10`],
                        ['Communication Quality', `${report.communication}/10`],
                        ['Correctness Analysis', `${report.correctness}/10`],
                        ['Key Technical Strengths', (report.aiFeedback?.strengths || []).join("\n")],
                        ['Areas of Improvement', (report.aiFeedback?.improvements || []).join("\n")]
                    ],
                    theme: 'grid',
                    headStyles: { fillColor: [30, 41, 59] },
                    styles: { fontSize: 9, cellPadding: 5 }
                });

                doc.save(filename);
            }
            triggerNotification('success', "Report downloaded successfully!");
        } catch (err) {
            console.error(err);
            triggerNotification('error', "Failed to download PDF report.");
        }
    };

    // ── DELETE ACTIONS & WORKFLOWS ────────────────────────────────────
    const confirmDelete = (target) => {
        setDeleteTarget(target);
        setShowDeleteModal(true);
    };

    const handleDeleteAction = async () => {
        setIsDeleting(true);
        try {
            if (deleteTarget.type === 'interview') {
                await axios.delete(`${ServerUrl}/api/interview/${deleteTarget.id}`, { withCredentials: true });
                setInterviews(prev => prev.filter(i => i._id !== deleteTarget.id));
                triggerNotification('success', "Interview report permanently deleted.");
            } else if (deleteTarget.type === 'resume') {
                await axios.delete(`${ServerUrl}/api/interview/resume/${deleteTarget.id}`, { withCredentials: true });
                setResumes(prev => prev.filter(r => r._id !== deleteTarget.id));
                triggerNotification('success', "Resume report permanently deleted.");
            } else if (deleteTarget.type === 'bulk_interview') {
                await Promise.all(selectedInterviews.map(id => 
                    axios.delete(`${ServerUrl}/api/interview/${id}`, { withCredentials: true })
                ));
                setInterviews(prev => prev.filter(i => !selectedInterviews.includes(i._id)));
                setSelectedInterviews([]);
                triggerNotification('success', "Selected interview reports permanently deleted.");
            } else if (deleteTarget.type === 'bulk_resume') {
                await Promise.all(selectedResumes.map(id => 
                    axios.delete(`${ServerUrl}/api/interview/resume/${id}`, { withCredentials: true })
                ));
                setResumes(prev => prev.filter(r => !selectedResumes.includes(r._id)));
                setSelectedResumes([]);
                triggerNotification('success', "Selected resume reports permanently deleted.");
            }
        } catch (error) {
            console.error(error);
            triggerNotification('error', "An error occurred while deleting the reports.");
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
            setDeleteTarget(null);
        }
    };

    const toggleInterviewSelection = (id) => {
        setSelectedInterviews(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const toggleResumeSelection = (id) => {
        setSelectedResumes(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const selectAllInterviews = () => {
        if (selectedInterviews.length === interviews.length) {
            setSelectedInterviews([]);
        } else {
            setSelectedInterviews(interviews.map(i => i._id));
        }
    };

    const selectAllResumes = () => {
        if (selectedResumes.length === resumes.length) {
            setSelectedResumes([]);
        } else {
            setSelectedResumes(resumes.map(r => r._id));
        }
    };

    const renderAnalytics = () => {
        if (interviews.length === 0) {
            return (
                <div className="bg-white dark:bg-gray-800 p-10 rounded-2xl shadow text-center text-gray-500 dark:text-gray-400">
                    <p>No interviews available to analyze yet.</p>
                    <button onClick={() => navigate("/avatar-interview")} className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-full">Start your first mock interview!</button>
                </div>
            );
        }

        const chartData = [...interviews].reverse().map((it, i) => ({
            name: `Mock ${i+1}`,
            score: it.finalScore || 0,
        }));

        return (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-slate-700">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">Overall Performance Trend</h2>
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                            <YAxis domain={[0, 10]} stroke="#9ca3af" fontSize={12} />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#4b5563" strokeOpacity={0.2} />
                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f9fafb', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} itemStyle={{ color: '#10b981' }} />
                            <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" name="Overall Score" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        );
    };

    return (
        <div className='min-h-screen bg-gray-50 dark:bg-slate-900 py-10 transition-colors duration-300 relative'>
            
            {/* ── TOAST NOTIFICATIONS ────────────────────────────────────────── */}
            {notification && (
                <div className={`fixed top-5 right-5 z-50 px-5 py-3.5 rounded-2xl shadow-lg border flex items-center gap-3 transition-all duration-300 animate-slide-in
                    ${notification.type === 'success' 
                        ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300' 
                        : 'bg-red-50 dark:bg-red-950/80 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'}`}>
                    {notification.type === 'success' ? <FaCheck className="text-emerald-500" /> : <FaTimes className="text-red-500" />}
                    <span className="text-sm font-semibold">{notification.message}</span>
                </div>
            )}

            <div className='w-[90vw] lg:w-[75vw] max-w-7xl mx-auto'>
                <div className='mb-8 w-full flex items-center justify-between'>
                    <div className='flex items-center gap-4'>
                        <button onClick={() => navigate("/")} className='p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition text-gray-600 dark:text-gray-300'>
                            <FaArrowLeft />
                        </button>
                        <div>
                            <h1 className='text-3xl font-black text-gray-900 dark:text-white tracking-tight'>Candidate Dashboard</h1>
                            <p className='text-gray-500 dark:text-gray-400 mt-1'>Manage your reports, profile, and track system diagnostics</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar Tabs */}
                    <div className="w-full md:w-64 flex flex-col gap-2">
                        {[
                            { id: 'history', icon: <FaHistory />, label: 'Interview History' },
                            { id: 'resumes', icon: <FaFileAlt />, label: 'Resume ATS Reports' },
                            { id: 'analytics', icon: <FaChartBar />, label: 'Progress Analytics' },
                            { id: 'profile', icon: <FaUserEdit />, label: 'My Profile' }
                        ].map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-3 p-4 rounded-xl font-semibold transition ${activeTab === tab.id ? 'bg-emerald-600 text-white shadow-md' : 'bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-slate-700/50 text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-slate-700'}`}>
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        
                        {/* TAB: INTERVIEW HISTORY */}
                        {activeTab === 'history' && (
                            <div className="space-y-4">
                                {interviews.length > 0 && (
                                    <div className="flex items-center justify-between pb-2">
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedInterviews.length === interviews.length}
                                                onChange={selectAllInterviews}
                                                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                            />
                                            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Select All ({selectedInterviews.length})</span>
                                        </div>
                                        {selectedInterviews.length > 0 && (
                                            <button 
                                                onClick={() => confirmDelete({ type: 'bulk_interview' })}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 text-xs font-bold rounded-lg border border-red-200/50 dark:border-red-800/50 transition"
                                            >
                                                <FaTrash /> Delete Selected
                                            </button>
                                        )}
                                    </div>
                                )}

                                {isLoading ? (
                                    <div className="bg-white dark:bg-gray-800 p-10 rounded-3xl border border-gray-200 dark:border-slate-700 shadow-sm text-center text-gray-500 dark:text-gray-400 flex flex-col items-center gap-3">
                                        <FaSpinner className="animate-spin text-3xl text-emerald-500" />
                                        <p className="font-medium">Loading your interviews...</p>
                                    </div>
                                ) : interviews.length === 0 ? (
                                    <div className="bg-white dark:bg-gray-800 p-10 rounded-3xl border border-gray-200 dark:border-slate-700 shadow-sm text-center text-gray-500 dark:text-gray-400">
                                        <p>No interviews found.</p>
                                        <button onClick={() => navigate("/avatar-interview")} className="mt-4 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition">Start your first interview!</button>
                                    </div>
                                ) : (
                                    interviews.map((item, index) => (
                                        <div key={item._id || index} className="group relative bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-800/50 transition flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                            <div className="flex items-start gap-3">
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedInterviews.includes(item._id)}
                                                    onChange={() => toggleInterviewSelection(item._id)}
                                                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 mt-1.5 shrink-0"
                                                />
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{item.role}</h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.experience} • {item.mode}</p>
                                                    <p className="text-xs text-gray-400 mt-1">{new Date(item.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-0 border-gray-100 dark:border-slate-700 pt-4 md:pt-0">
                                                <div className="text-right hidden sm:block">
                                                    <p className="text-xl font-bold text-emerald-600">{item.finalScore || 0}/10</p>
                                                    <p className="text-xs text-gray-400">Overall Score</p>
                                                </div>
                                                
                                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                                    <button 
                                                        onClick={() => navigate(`/report/${item._id}`)}
                                                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-semibold transition"
                                                        title="View Report"
                                                    >
                                                        <FaEye /> View
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDownloadPDF(item, 'interview')}
                                                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs font-semibold transition border border-emerald-100 dark:border-emerald-900/30"
                                                        title="Download PDF"
                                                    >
                                                        <FaDownload /> Download
                                                    </button>
                                                    <button 
                                                        onClick={() => confirmDelete({ type: 'interview', id: item._id })}
                                                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold transition border border-red-100 dark:border-red-900/30"
                                                        title="Delete Permanently"
                                                    >
                                                        <FaTrash /> Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* TAB: RESUMES */}
                        {activeTab === 'resumes' && (
                            <div className="space-y-4">
                                {resumes.length > 0 && (
                                    <div className="flex items-center justify-between pb-2">
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedResumes.length === resumes.length}
                                                onChange={selectAllResumes}
                                                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                            />
                                            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Select All ({selectedResumes.length})</span>
                                        </div>
                                        {selectedResumes.length > 0 && (
                                            <button 
                                                onClick={() => confirmDelete({ type: 'bulk_resume' })}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 text-xs font-bold rounded-lg border border-red-200/50 dark:border-red-800/50 transition"
                                            >
                                                <FaTrash /> Delete Selected
                                            </button>
                                        )}
                                    </div>
                                )}

                                {isLoading ? (
                                    <div className="bg-white dark:bg-gray-800 p-10 rounded-3xl border border-gray-200 dark:border-slate-700 shadow-sm text-center text-gray-500 dark:text-gray-400 flex flex-col items-center gap-3">
                                        <FaSpinner className="animate-spin text-3xl text-emerald-500" />
                                        <p className="font-medium">Loading your resume reports...</p>
                                    </div>
                                ) : resumes.length === 0 ? (
                                    <div className="bg-white dark:bg-gray-800 p-10 rounded-3xl border border-gray-200 dark:border-slate-700 shadow-sm text-center text-gray-500 dark:text-gray-400">
                                        <p>No resumes uploaded yet.</p>
                                        <button onClick={() => navigate("/upload-resume")} className="mt-4 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition">Upload Resume Analysis</button>
                                    </div>
                                ) : (
                                    resumes.map((resume, index) => (
                                        <div key={resume._id || index} className="group relative bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-800/50 transition flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                            <div className="flex items-start gap-3">
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedResumes.includes(resume._id)}
                                                    onChange={() => toggleResumeSelection(resume._id)}
                                                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 mt-1.5 shrink-0"
                                                />
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{resume.role} Resume</h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Analyzed on {new Date(resume.createdAt).toLocaleDateString()}</p>
                                                    <p className="text-xs text-gray-400 mt-1">Experience: {resume.experience || 'Not specified'}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-0 border-gray-100 dark:border-slate-700 pt-4 md:pt-0">
                                                <div className="text-right hidden sm:block">
                                                    <p className="text-xs text-gray-400 mb-1">ATS Score</p>
                                                    <div className={`w-12 h-12 flex items-center justify-center rounded-full border-4 font-bold text-sm ${resume.atsScore >= 75 ? 'border-green-500 text-green-600 dark:text-green-400' : resume.atsScore >= 50 ? 'border-yellow-500 text-yellow-600 dark:text-yellow-400' : 'border-red-500 text-red-600 dark:text-red-400'}`}>
                                                        {resume.atsScore}%
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                                    <button 
                                                        onClick={() => navigate(`/resume-report/${resume._id}`)}
                                                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-semibold transition"
                                                        title="View Report"
                                                    >
                                                        <FaEye /> View
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDownloadPDF(resume, 'resume')}
                                                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs font-semibold transition border border-emerald-100 dark:border-emerald-900/30"
                                                        title="Download PDF"
                                                    >
                                                        <FaDownload /> Download
                                                    </button>
                                                    <button 
                                                        onClick={() => confirmDelete({ type: 'resume', id: resume._id })}
                                                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold transition border border-red-100 dark:border-red-900/30"
                                                        title="Delete Permanently"
                                                    >
                                                        <FaTrash /> Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* TAB: ANALYTICS */}
                        {activeTab === 'analytics' && renderAnalytics()}

                        {/* TAB: PROFILE */}
                        {activeTab === 'profile' && (
                            <form onSubmit={handleProfileUpdate} className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-200 dark:border-slate-700">
                                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">Personal Profile & Socials</h2>
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Experience Level</label>
                                        <input type="text" value={formData.experience} onChange={(e) => setFormData({...formData, experience: e.target.value})} className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition bg-transparent dark:text-white dark:placeholder-gray-500" placeholder="e.g. 5 years" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">LinkedIn URL</label>
                                        <input type="text" value={formData.linkedin} onChange={(e) => setFormData({...formData, linkedin: e.target.value})} className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition bg-transparent dark:text-white dark:placeholder-gray-500" placeholder="https://linkedin.com/in/..." />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">GitHub URL</label>
                                        <input type="text" value={formData.github} onChange={(e) => setFormData({...formData, github: e.target.value})} className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition bg-transparent dark:text-white dark:placeholder-gray-500" placeholder="https://github.com/..." />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Portfolio Website</label>
                                        <input type="text" value={formData.portfolio} onChange={(e) => setFormData({...formData, portfolio: e.target.value})} className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition bg-transparent dark:text-white dark:placeholder-gray-500" placeholder="https://myportfolio.com" />
                                    </div>
                                    <button type="submit" className="w-full bg-gray-900 hover:bg-black dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white py-3.5 rounded-xl font-bold transition mt-6 shadow-md">
                                        Save Profile Details
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>

            {/* ── CONFIRMATION DELETE MODAL ───────────────────────────────────── */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-300">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full p-6 md:p-8 shadow-xl border border-gray-100 dark:border-slate-700 transition-all transform scale-100">
                        <div className="flex items-center gap-3 text-red-500 mb-4">
                            <FaExclamationTriangle className="text-3xl shrink-0" />
                            <h3 className="text-xl font-black tracking-tight text-gray-900 dark:text-white">Delete Report?</h3>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                            Are you sure you want to permanently delete this report? This action cannot be undone and the file will be removed from system history.
                        </p>
                        <div className="flex justify-end gap-3 pt-2">
                            <button 
                                onClick={() => { setShowDeleteModal(false); setDeleteTarget(null); }}
                                className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-slate-700 transition text-sm"
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleDeleteAction}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition text-sm shadow-md"
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <>
                                        <FaSpinner className="animate-spin" /> Deleting...
                                    </>
                                ) : (
                                    'Delete Permanently'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default InterviewHistory;
