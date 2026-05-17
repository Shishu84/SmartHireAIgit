import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ServerUrl } from '../App';
import { FaCloudUploadAlt, FaFilePdf, FaFileWord, FaFileImage, FaCheckCircle, FaSpinner, FaLock } from 'react-icons/fa';
import { motion } from 'motion/react';

function UploadResume() {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState('');
    const [guestResult, setGuestResult] = useState(null); // For non-logged in users
    const navigate = useNavigate();
    const inputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSetFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            validateAndSetFile(e.target.files[0]);
        }
    };

    const validateAndSetFile = (file) => {
        setError('');
        setGuestResult(null);
        const validTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword',
            'image/jpeg', 'image/png', 'image/jpg'
        ];
        if (!validTypes.includes(file.type)) {
            setError('Invalid file type. Please upload a PDF, DOCX, JPG, or PNG.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError('File size exceeds 5MB limit.');
            return;
        }
        setSelectedFile(file);
    };

    const handleUpload = async () => {
        if (!selectedFile) return;
        setIsUploading(true);
        setUploadProgress(10);
        setError('');

        const formData = new FormData();
        formData.append('resume', selectedFile);

        // Simulated progress ticks
        const progressInterval = setInterval(() => {
            setUploadProgress(prev => (prev >= 85 ? prev : prev + 15));
        }, 500);

        try {
            const result = await axios.post(ServerUrl + "/api/interview/resume", formData, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            clearInterval(progressInterval);
            setUploadProgress(100);

            const data = result.data;

            setTimeout(() => {
                if (data._id) {
                    // Logged-in user: redirect to the full saved report
                    navigate(`/resume-report/${data._id}`);
                } else {
                    // Guest user: show inline result summary
                    setGuestResult(data);
                    setIsUploading(false);
                    setUploadProgress(0);
                    setSelectedFile(null);
                }
            }, 800);

        } catch (err) {
            clearInterval(progressInterval);
            console.error(err);
            setError(err.response?.data?.message || 'Failed to upload resume. Please try again.');
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const getFileIcon = () => {
        if (!selectedFile) return null;
        if (selectedFile.type.includes('pdf')) return <FaFilePdf className="text-red-500 text-4xl" />;
        if (selectedFile.type.includes('word')) return <FaFileWord className="text-blue-500 text-4xl" />;
        if (selectedFile.type.includes('image')) return <FaFileImage className="text-green-500 text-4xl" />;
        return <FaFilePdf className="text-gray-500 text-4xl" />;
    };

    return (
        <div className='min-h-screen bg-gray-50 dark:bg-slate-900 py-12 transition-colors duration-300'>
            <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='text-center mb-10'>
                    <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>Upload Resume</h1>
                    <p className='mt-3 text-lg text-gray-600 dark:text-gray-400'>
                        Get instant AI-powered ATS diagnostics, formatting review, and missing keywords detection.
                    </p>
                </div>

                <div className='bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 p-8 md:p-12 transition-colors duration-300'>
                    {!isUploading ? (
                        <>
                            <div 
                                className={`relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-all duration-300 ${
                                    dragActive 
                                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' 
                                        : 'border-gray-300 dark:border-slate-600 hover:border-emerald-400 dark:hover:border-emerald-500 bg-gray-50 dark:bg-slate-700/30'
                                }`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                <input 
                                    ref={inputRef}
                                    type="file" 
                                    className="hidden" 
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                    onChange={handleChange}
                                    onClick={(e) => (e.target.value = null)}
                                />
                                
                                {!selectedFile ? (
                                    <>
                                        <div className='bg-white dark:bg-gray-800 p-4 rounded-full shadow-sm mb-4'>
                                            <FaCloudUploadAlt className='text-emerald-500 text-4xl' />
                                        </div>
                                        <p className='text-gray-700 dark:text-gray-200 font-semibold mb-2'>
                                            Drag & drop your resume here
                                        </p>
                                        <p className='text-gray-500 dark:text-gray-400 text-sm mb-6'>
                                            Supports PDF, DOC, DOCX, JPG, PNG (Max 5MB)
                                        </p>
                                        <button 
                                            onClick={() => inputRef.current.click()}
                                            className='bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-medium transition'
                                        >
                                            Browse Files
                                        </button>
                                    </>
                                ) : (
                                    <div className='flex flex-col items-center'>
                                        {getFileIcon()}
                                        <p className='text-gray-800 dark:text-gray-200 font-medium mt-4'>{selectedFile.name}</p>
                                        <p className='text-gray-500 dark:text-gray-400 text-xs mb-6'>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                                        
                                        <div className='flex gap-4'>
                                            <button 
                                                onClick={() => setSelectedFile(null)}
                                                className='px-6 py-2 rounded-xl text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700 transition font-medium'
                                            >
                                                Cancel
                                            </button>
                                            <button 
                                                onClick={handleUpload}
                                                className='bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl transition font-medium'
                                            >
                                                Analyze Resume
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {error && (
                                <motion.p 
                                    initial={{ opacity: 0, y: 10 }} 
                                    animate={{ opacity: 1, y: 0 }}
                                    className='text-red-500 text-sm mt-4 text-center'
                                >
                                    {error}
                                </motion.p>
                            )}
                        </>
                    ) : (
                        <div className='py-12 flex flex-col items-center'>
                            <div className='relative w-24 h-24 mb-6 flex items-center justify-center'>
                                {uploadProgress < 100 ? (
                                    <FaSpinner className='text-emerald-500 text-5xl animate-spin' />
                                ) : (
                                    <FaCheckCircle className='text-emerald-500 text-6xl' />
                                )}
                            </div>
                            <h3 className='text-xl font-bold text-gray-800 dark:text-gray-100 mb-2'>
                                {uploadProgress < 100 ? 'Parsing AI Diagnostics...' : 'Analysis Complete!'}
                            </h3>
                            <p className='text-gray-500 dark:text-gray-400 text-sm mb-8'>
                                {uploadProgress < 100 ? 'Our AI is extracting keywords and checking ATS compatibility.' : 'Almost done, preparing your report...'}
                            </p>
                            
                            <div className='w-full max-w-md bg-gray-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden'>
                                <motion.div 
                                    className='bg-emerald-500 h-full'
                                    initial={{ width: 0 }}
                                    animate={{ width: `${uploadProgress}%` }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>
                            <p className='text-gray-500 dark:text-gray-400 font-medium text-sm mt-3'>{uploadProgress}%</p>
                        </div>
                    )}
                </div>

                {/* Guest Result Panel */}
                {guestResult && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className='mt-8 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 p-8'
                    >
                        {/* Sign-in Banner */}
                        <div className='flex items-start gap-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-4 mb-8'>
                            <FaLock className='text-emerald-600 dark:text-emerald-400 text-xl mt-0.5 shrink-0' />
                            <div>
                                <p className='font-semibold text-emerald-800 dark:text-emerald-300 text-sm'>Sign in to save this report</p>
                                <p className='text-emerald-700 dark:text-emerald-400 text-xs mt-1'>Create a free account to permanently save this analysis, track history, and access the full ATS diagnostics report.</p>
                            </div>
                            <button onClick={() => navigate('/')} className='ml-auto shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-4 py-2 rounded-xl font-medium transition'>
                                Sign In Free
                            </button>
                        </div>

                        <h2 className='text-xl font-bold text-gray-800 dark:text-gray-100 mb-6'>Your ATS Analysis Preview</h2>

                        {/* Score + Role */}
                        <div className='flex flex-col sm:flex-row items-center gap-6 mb-8'>
                            <div className={`w-28 h-28 shrink-0 flex items-center justify-center rounded-full border-8 font-bold text-3xl
                                ${guestResult.atsScore >= 75 ? 'border-green-500 text-green-600 dark:text-green-400'
                                : guestResult.atsScore >= 50 ? 'border-yellow-500 text-yellow-600 dark:text-yellow-400'
                                : 'border-red-500 text-red-600 dark:text-red-400'}`}>
                                {guestResult.atsScore}%
                            </div>
                            <div>
                                <p className='text-sm text-gray-500 dark:text-gray-400 mb-1'>Detected Role</p>
                                <p className='text-xl font-bold text-gray-800 dark:text-white'>{guestResult.role}</p>
                                <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>Experience: <span className='font-medium text-gray-700 dark:text-gray-300'>{guestResult.experience}</span></p>
                                <span className='inline-block mt-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-semibold rounded-full'>Best Fit: {guestResult.bestRole}</span>
                            </div>
                        </div>

                        {/* Summary */}
                        {guestResult.summary && (
                            <div className='bg-gray-50 dark:bg-slate-700/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-600 mb-6'>
                                <p className='text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2'>Summary</p>
                                <p className='text-sm text-gray-700 dark:text-gray-300 leading-relaxed'>{guestResult.summary}</p>
                            </div>
                        )}

                        {/* Strengths & Weaknesses */}
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6'>
                            <div className='bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800/50'>
                                <p className='text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-3'>✅ Strengths</p>
                                <ul className='space-y-1.5'>
                                    {(guestResult.strengths || []).map((s, i) => (
                                        <li key={i} className='text-xs text-emerald-800 dark:text-emerald-300 flex gap-2'><span>•</span><span>{s}</span></li>
                                    ))}
                                </ul>
                            </div>
                            <div className='bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl border border-red-100 dark:border-red-800/50'>
                                <p className='text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider mb-3'>⚠️ Improvements</p>
                                <ul className='space-y-1.5'>
                                    {(guestResult.weakness || []).map((w, i) => (
                                        <li key={i} className='text-xs text-red-800 dark:text-red-300 flex gap-2'><span>•</span><span>{w}</span></li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Skills */}
                        {(guestResult.skills || []).length > 0 && (
                            <div className='mb-6'>
                                <p className='text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3'>Detected Skills</p>
                                <div className='flex flex-wrap gap-2'>
                                    {guestResult.skills.map((s, i) => (
                                        <span key={i} className='px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded-full border border-blue-100 dark:border-blue-800/50'>{s}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className='border-t border-gray-100 dark:border-slate-700 pt-6 flex flex-col sm:flex-row gap-3'>
                            <button onClick={() => { setGuestResult(null); }} className='flex-1 py-3 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 font-medium transition text-sm'>
                                Analyze Another Resume
                            </button>
                            <button onClick={() => navigate('/')} className='flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition text-sm'>
                                Sign In to Save Full Report
                            </button>
                        </div>
                    </motion.div>
                )}

                <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-12'>
                    <div className='bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col items-center text-center'>
                        <div className='bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 w-12 h-12 rounded-full flex items-center justify-center mb-4'>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <h4 className='font-bold text-gray-800 dark:text-gray-100 mb-2'>ATS Compatibility</h4>
                        <p className='text-sm text-gray-500 dark:text-gray-400'>Discover how applicant tracking systems read your resume format.</p>
                    </div>
                    <div className='bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col items-center text-center'>
                        <div className='bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 w-12 h-12 rounded-full flex items-center justify-center mb-4'>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        </div>
                        <h4 className='font-bold text-gray-800 dark:text-gray-100 mb-2'>Keyword Missing</h4>
                        <p className='text-sm text-gray-500 dark:text-gray-400'>Identify exact missing keywords for your target role description.</p>
                    </div>
                    <div className='bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col items-center text-center'>
                        <div className='bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 w-12 h-12 rounded-full flex items-center justify-center mb-4'>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                        </div>
                        <h4 className='font-bold text-gray-800 dark:text-gray-100 mb-2'>Formatting Review</h4>
                        <p className='text-sm text-gray-500 dark:text-gray-400'>Get AI-powered structural layout and phrasing enhancements.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UploadResume;
