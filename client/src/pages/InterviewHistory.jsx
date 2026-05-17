import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ServerUrl } from '../App';
import { FaArrowLeft, FaHistory, FaFileAlt, FaUserEdit, FaChartBar } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

function InterviewHistory() {
    const { userData } = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const [interviews, setInterviews] = useState([]);
    const [resumes, setResumes] = useState([]);
    const [activeTab, setActiveTab] = useState('history'); // history, resumes, profile, analytics
    const navigate = useNavigate();

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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [intRes, resRes] = await Promise.all([
                    axios.get(ServerUrl + "/api/interview/get-interview", { withCredentials: true }),
                    axios.get(ServerUrl + "/api/interview/resume/history", { withCredentials: true })
                ]);
                setInterviews(intRes.data);
                setResumes(resRes.data);
            } catch (error) {
                console.log(error);
            }
        };
        fetchData();
    }, []);

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
            alert("Profile updated successfully!");
        } catch (error) {
            console.log("Profile update failed", error);
            alert("Failed to update profile.");
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
        <div className='min-h-screen bg-linear-to-br from-gray-50 to-emerald-50 dark:from-slate-900 dark:to-slate-800 py-10 transition-colors duration-300'>
            <div className='w-[90vw] lg:w-[75vw] max-w-[100%] mx-auto'>
                <div className='mb-8 w-full flex items-center justify-between'>
                    <div className='flex items-center gap-4'>
                        <button onClick={() => navigate("/")} className='p-3 rounded-full bg-white dark:bg-gray-800 shadow hover:shadow-md transition text-gray-600 dark:text-gray-300'>
                            <FaArrowLeft />
                        </button>
                        <div>
                            <h1 className='text-3xl font-bold text-gray-800 dark:text-white'>Candidate Dashboard</h1>
                            <p className='text-gray-500 dark:text-gray-400 mt-1'>Manage your profile, track progress, and view reports</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                    {/* Sidebar Tabs */}
                    <div className="w-full md:w-64 flex flex-col gap-2">
                        {[
                            { id: 'history', icon: <FaHistory />, label: 'Interview History' },
                            { id: 'resumes', icon: <FaFileAlt />, label: 'Resume ATS Reports' },
                            { id: 'analytics', icon: <FaChartBar />, label: 'Progress Analytics' },
                            { id: 'profile', icon: <FaUserEdit />, label: 'My Profile' }
                        ].map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-3 p-4 rounded-xl font-medium transition ${activeTab === tab.id ? 'bg-emerald-600 text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-slate-700'}`}>
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* TAB: INTERVIEW HISTORY */}
                        {activeTab === 'history' && (
                            <div className="grid gap-4">
                                {interviews.length === 0 ? (
                                    <div className="bg-white dark:bg-gray-800 p-10 rounded-2xl shadow text-center text-gray-500 dark:text-gray-400">
                                        <p>No interviews found.</p>
                                        <button onClick={() => navigate("/avatar-interview")} className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-full">Start your first interview!</button>
                                    </div>
                                ) : (
                                    interviews.map((item, index) => (
                                        <div key={index} onClick={() => navigate(`/report/${item._id}`)} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm hover:shadow-lg transition cursor-pointer border border-gray-100 dark:border-slate-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{item.role}</h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{item.experience} • {item.mode}</p>
                                                <p className="text-xs text-gray-400 mt-1">{new Date(item.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="text-right">
                                                    <p className="text-xl font-bold text-emerald-600">{item.finalScore || 0}/10</p>
                                                    <p className="text-xs text-gray-400">Overall Score</p>
                                                </div>
                                                <span className={`px-4 py-1 rounded-full text-xs font-medium ${item.status === "completed" ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"}`}>
                                                    {item.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* TAB: RESUMES */}
                        {activeTab === 'resumes' && (
                            <div className="grid gap-4">
                                {resumes.length === 0 ? (
                                    <div className="bg-white dark:bg-gray-800 p-10 rounded-2xl shadow text-center text-gray-500 dark:text-gray-400">
                                        <p>No resumes uploaded yet.</p>
                                        <button onClick={() => navigate("/avatar-interview")} className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-full">Upload in Interview Setup</button>
                                    </div>
                                ) : (
                                    resumes.map((resume, index) => (
                                        <div key={index} onClick={() => navigate(`/resume-report/${resume._id}`)} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm hover:shadow-lg transition cursor-pointer border border-gray-100 dark:border-slate-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{resume.role} Resume</h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Analyzed on {new Date(resume.createdAt).toLocaleDateString()}</p>
                                                <p className="text-xs text-gray-400 mt-1">Experience: {resume.experience || 'Not specified'}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-400 mb-1">ATS Score</p>
                                                    <div className={`w-14 h-14 flex items-center justify-center rounded-full border-4 font-bold text-lg ${resume.atsScore >= 75 ? 'border-green-500 text-green-600' : resume.atsScore >= 50 ? 'border-yellow-500 text-yellow-600' : 'border-red-500 text-red-600'}`}>
                                                        {resume.atsScore}%
                                                    </div>
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
                            <form onSubmit={handleProfileUpdate} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md border border-gray-100 dark:border-slate-700">
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
                                    <button type="submit" className="w-full bg-gray-900 hover:bg-black text-white py-3 rounded-xl font-semibold transition mt-6 shadow-md">
                                        Save Profile Details
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
export default InterviewHistory;
