import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from "motion/react"
import { BsRobot, BsCoin, BsList, BsX, BsSun, BsMoon, BsDisplay } from "react-icons/bs";
import { HiOutlineLogout } from "react-icons/hi";
import { FaUserAstronaut } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ServerUrl } from '../App';
import { setUserData } from '../redux/userSlice';
import AuthModel from './AuthModel';
import { useTheme } from '../context/ThemeContext';

function Navbar() {
    const { userData } = useSelector((state) => state.user)
    const { theme, setTheme } = useTheme();
    const [showThemePopup, setShowThemePopup] = useState(false)
    const [showCreditPopup, setShowCreditPopup] = useState(false)
    const [showUserPopup, setShowUserPopup] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [showAuth, setShowAuth] = useState(false);

    const handleLogout = async () => {
        try {
            await axios.get(ServerUrl + "/api/auth/logout", { withCredentials: true })
            dispatch(setUserData(null))
            setShowCreditPopup(false)
            setShowUserPopup(false)
            setShowThemePopup(false)
            setMobileMenuOpen(false)
            navigate("/")
        } catch (error) {
            console.log(error)
        }
    }

    const navLinks = [
        { label: "Home", action: () => { navigate("/"); setMobileMenuOpen(false); } },
        { label: "Features", action: () => { navigate("/"); setMobileMenuOpen(false); } },
        ...(userData ? [
            { label: "Avatar Interview", action: () => { navigate("/avatar-interview"); setMobileMenuOpen(false); } },
            { label: "Career Mentor Bot", action: () => { navigate("/mentor"); setMobileMenuOpen(false); } },
            { label: "Dashboard & Resumes", action: () => { navigate("/history"); setMobileMenuOpen(false); } },
        ] : []),
        { label: "Pricing", action: () => { navigate("/pricing"); setMobileMenuOpen(false); } },
        { label: "About", action: () => { navigate("/"); setMobileMenuOpen(false); } },
        { label: "Contact", action: () => { navigate("/"); setMobileMenuOpen(false); } },
    ]

    return (
        <div className='bg-[#f3f3f3] dark:bg-slate-900 flex justify-center px-4 pt-6 relative z-50 transition-colors duration-300'>
            <motion.div
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className='w-full max-w-6xl bg-white dark:bg-gray-900 rounded-[24px] shadow-sm border border-gray-200 dark:border-gray-800 px-5 py-4 flex justify-between items-center relative'>

                {/* Logo */}
                <div onClick={() => navigate("/")} className='flex items-center gap-3 cursor-pointer text-gray-900 dark:text-white'>
                    <div className='bg-black text-white p-2 rounded-lg'>
                        <BsRobot size={18} />
                    </div>
                    <h1 className='font-semibold text-lg'>SmartHire.AI</h1>
                </div>

                {/* Desktop Nav */}
                <div className='hidden md:flex items-center gap-6 relative'>
                    <button onClick={() => navigate("/")} className='text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white font-medium transition text-sm'>Home</button>
                    
                    <div className='relative group'>
                        <button className='flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white font-medium transition py-2 text-sm'>
                            Features <span className="text-[10px] ml-0.5">▼</span>
                        </button>
                        <div className='absolute top-full left-[-40px] w-64 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 flex flex-col p-4 gap-4'>
                            <div>
                                <p className='text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-2'>Interview System</p>
                                <button onClick={() => navigate("/avatar-interview")} className='w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg flex items-center gap-2'>🌐 Avatar Interview</button>
                                <button onClick={() => navigate("/mentor")} className='w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg flex items-center gap-2'>🤖 Career Mentor</button>
                                <button onClick={() => navigate("/history")} className='w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg flex items-center gap-2'>📊 Dashboard</button>
                            </div>
                            
                            <div className='border-t border-gray-100 dark:border-gray-800 pt-3'>
                                <p className='text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-2'>Resume Suite</p>
                                <button onClick={() => navigate("/history")} className='w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg'>ATS Diagnostics</button>
                                <button onClick={() => navigate("/upload-resume")} className='w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg'>Upload Resume</button>
                            </div>

                            <div className='border-t border-gray-100 dark:border-gray-800 pt-3'>
                                <p className='text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-2'>Pricing & Plans</p>
                                <button onClick={() => navigate("/pricing")} className='w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg'>View Pricing</button>
                            </div>
                        </div>
                    </div>

                    <button onClick={() => navigate("/")} className='text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white font-medium transition text-sm'>About</button>
                    <button onClick={() => navigate("/")} className='text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white font-medium transition text-sm'>Contact</button>

                    {/* Theme Toggle */}
                    <div className='relative'>
                        <button onClick={() => {
                            setShowThemePopup(!showThemePopup);
                            setShowCreditPopup(false);
                            setShowUserPopup(false);
                        }} className='flex items-center justify-center w-9 h-9 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full transition text-gray-600 dark:text-gray-300'>
                            {theme === 'light' ? <BsSun size={16} /> : theme === 'dark' ? <BsMoon size={16} /> : <BsDisplay size={16} />}
                        </button>
                        {showThemePopup && (
                            <div className='absolute right-0 mt-3 w-40 bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-800 rounded-xl p-2 z-50 flex flex-col gap-1'>
                                <button onClick={() => { setTheme('light'); setShowThemePopup(false); }} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${theme==='light' ? 'bg-gray-100 dark:bg-gray-800 text-black dark:text-white font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                                    <BsSun size={14} /> Light
                                </button>
                                <button onClick={() => { setTheme('dark'); setShowThemePopup(false); }} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${theme==='dark' ? 'bg-gray-100 dark:bg-gray-800 text-black dark:text-white font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                                    <BsMoon size={14} /> Dark
                                </button>
                                <button onClick={() => { setTheme('system'); setShowThemePopup(false); }} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${theme==='system' ? 'bg-gray-100 dark:bg-gray-800 text-black dark:text-white font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                                    <BsDisplay size={14} /> Auto
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Credits */}
                    <div className='relative'>
                        <button onClick={() => {
                            if (!userData) { setShowAuth(true); return; }
                            setShowCreditPopup(!showCreditPopup);
                            setShowUserPopup(false);
                            setShowThemePopup(false);
                        }} className='flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full text-sm hover:bg-gray-200 transition'>
                            <BsCoin size={18} />
                            {userData?.credits || 0}
                        </button>
                        {showCreditPopup && (
                            <div className='absolute right-0 mt-3 w-64 bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-800 rounded-xl p-4 z-50 text-center'>
                                <div className='bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3'>
                                    <BsCoin size={24} />
                                </div>
                                <p className='text-gray-800 dark:text-gray-100 font-semibold mb-1'>Available Credits</p>
                                <p className='text-2xl font-bold text-green-600 dark:text-green-400 mb-3'>{userData?.credits || 0}</p>
                                <p className='text-sm text-gray-600 dark:text-gray-400 mb-4'>Need more credits to continue interviews?</p>
                                <button onClick={() => navigate("/pricing")} className='w-full bg-black dark:bg-emerald-600 text-white py-2 rounded-lg text-sm'>Buy more credits</button>
                            </div>
                        )}
                    </div>

                    {/* User */}
                    <div className='relative'>
                        <button onClick={() => {
                            if (!userData) { setShowAuth(true); return; }
                            setShowUserPopup(!showUserPopup);
                            setShowCreditPopup(false);
                            setShowThemePopup(false);
                        }} className='w-9 h-9 bg-black text-white rounded-full flex items-center justify-center font-semibold'>
                            {userData ? userData?.name.slice(0, 1).toUpperCase() : <FaUserAstronaut size={16} />}
                        </button>
                        {showUserPopup && (
                            <div className='absolute right-0 mt-3 w-48 bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-800 rounded-xl p-4 z-50'>
                                <p className='text-sm text-blue-500 dark:text-emerald-400 font-medium mb-2'>{userData?.name}</p>
                                <button onClick={() => navigate("/mentor")} className='w-full text-left text-sm py-2 hover:text-black dark:hover:text-white text-gray-600 dark:text-gray-300 flex items-center gap-2'><BsRobot size={14} /> Career Mentor</button>
                                <button onClick={() => navigate("/history")} className='w-full text-left text-sm py-2 hover:text-black dark:hover:text-white text-gray-600 dark:text-gray-300'>Dashboard Hub</button>
                                <button onClick={handleLogout} className='w-full text-left text-sm py-2 flex items-center gap-2 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300'>
                                    <HiOutlineLogout size={16} /> Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile: Credits + Hamburger */}
                <div className='flex md:hidden items-center gap-3'>
                    <button onClick={() => {
                        if (!userData) { setShowAuth(true); return; }
                        setShowCreditPopup(!showCreditPopup)
                    }} className='flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white px-3 py-1.5 rounded-full text-sm'>
                        <BsCoin size={16} className="text-gray-600 dark:text-gray-300"/> {userData?.credits || 0}
                    </button>
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className='w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition'>
                        {mobileMenuOpen ? <BsX size={22} /> : <BsList size={22} />}
                    </button>
                </div>
            </motion.div>

            {/* Mobile Dropdown Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className='absolute top-[80px] left-4 right-4 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-4 z-50 flex flex-col gap-2'>
                        {navLinks.map((link, i) => (
                            <button key={i} onClick={link.action} className='w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium transition'>
                                {link.label}
                            </button>
                        ))}
                        <div className='border-t border-gray-100 dark:border-gray-800 mt-1 pt-2'>
                            {userData ? (
                                <>
                                    <p className='text-xs text-gray-400 px-4 mb-1'>Signed in as <span className='text-emerald-500 font-medium'>{userData.name}</span></p>
                                    <button onClick={handleLogout} className='w-full text-left px-4 py-3 rounded-xl text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium flex items-center gap-2 transition'>
                                        <HiOutlineLogout size={16} /> Logout
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => { setShowAuth(true); setMobileMenuOpen(false); }} className='w-full bg-black dark:bg-emerald-600 text-white py-3 rounded-xl font-medium mt-2'>
                                    Sign In
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}
        </div>
    )
}

export default Navbar
