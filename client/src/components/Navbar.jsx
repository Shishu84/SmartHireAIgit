import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from "motion/react"
import { BsRobot, BsCoin, BsList, BsX } from "react-icons/bs";
import { HiOutlineLogout } from "react-icons/hi";
import { FaUserAstronaut } from "react-icons/fa";
import { Sun, Moon } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ServerUrl } from '../App';
import { setUserData } from '../redux/userSlice';
import AuthModel from './AuthModel';
import { useTheme } from '../context/ThemeContext';
import logo from '../assets/logo.png';

function Navbar() {
    const { userData } = useSelector((state) => state.user)
    const { theme, activeTheme, toggleTheme } = useTheme();
    const [showThemePopup, setShowThemePopup] = useState(false)
    const [showCreditPopup, setShowCreditPopup] = useState(false)
    const [showUserPopup, setShowUserPopup] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [showAuth, setShowAuth] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

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
        { label: "About", action: () => { navigate("/about"); setMobileMenuOpen(false); } },
        { label: "Contact", action: () => { navigate("/contact"); setMobileMenuOpen(false); } },
    ]

    return (
        <div className='sticky top-0 z-50 flex justify-center px-4 pt-4 sm:pt-6 pb-2 pointer-events-none transition-all duration-300'>
            <motion.div
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`w-full max-w-5xl rounded-full px-6 py-3.5 flex justify-between items-center relative transition-all duration-300 pointer-events-auto
                    ${scrolled
                        ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-lg shadow-purple-500/5 border border-gray-200/50 dark:border-slate-700/50'
                        : 'bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shadow-sm border border-gray-200/50 dark:border-slate-800/50'
                    }`}>

                <div onClick={() => navigate("/")} className='flex items-center gap-3 cursor-pointer text-gray-900 dark:text-white group'>
                    <div className='transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3'>
                        <img src={logo} alt="SmartHireAI Logo" className="w-8 h-8 rounded-lg object-cover" />
                    </div>
                    <h1 className='font-semibold text-lg tracking-tight'>SmartHire.AI</h1>
                </div>

                <div className='hidden md:flex items-center gap-6 relative'>
                    <button onClick={() => navigate("/")} className='nav-link text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white font-medium transition text-sm'>Home</button>

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

                    <button onClick={() => navigate("/about")} className='nav-link text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white font-medium transition text-sm'>About</button>
                    <button onClick={() => navigate("/contact")} className='nav-link text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white font-medium transition text-sm'>Contact</button>

                    {/* Theme Toggle (Desktop) */}
                    <button
                        onClick={toggleTheme}
                        className='flex items-center justify-center w-9 h-9 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-600 dark:text-gray-300'
                        aria-label="Toggle Theme"
                    >
                        {activeTheme === 'dark' ? (
                            <Sun size={18} className="animate-fade-in" />
                        ) : (
                            <Moon size={18} className="animate-fade-in" />
                        )}
                    </button>



                    {/* User */}
                    <div className='relative'>
                        <button onClick={() => {
                            if (!userData) { setShowAuth(true); return; }
                            setShowUserPopup(!showUserPopup);
                            setShowCreditPopup(false);
                            setShowThemePopup(false);
                        }} className='w-9 h-9 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center font-semibold border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden hover:scale-105 transition-transform'>
                            {userData ? userData?.name.slice(0, 1).toUpperCase() : <img src={logo} alt="Guest" className="w-full h-full object-cover p-1" />}
                        </button>
                        {showUserPopup && (
                            <div className='absolute right-0 mt-3 w-64 bg-white dark:bg-slate-900 shadow-2xl border border-gray-100 dark:border-slate-800 rounded-2xl p-2 z-50 flex flex-col origin-top-right animate-fade-in'>
                                <div className='p-3 border-b border-gray-100 dark:border-slate-800 mb-2 flex items-center justify-between'>
                                    <div className='flex flex-col'>
                                        <p className='text-sm text-gray-900 dark:text-white font-bold'>{userData?.name}</p>
                                        <p className='text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold'>Account</p>
                                    </div>
                                    <div className='bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm border border-purple-100/50 dark:border-purple-800/30'>
                                        <BsCoin size={14} />
                                        <span className='font-bold text-sm'>{userData?.credits || 0}</span>
                                    </div>
                                </div>
                                <button onClick={() => navigate("/pricing")} className='w-full text-left text-sm p-3 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl text-gray-700 dark:text-gray-200 flex items-center justify-between group transition-colors'>
                                    <span className='flex items-center gap-2 font-medium'><BsCoin size={15} className="text-purple-400 dark:text-purple-500" /> Buy Credits</span>
                                </button>
                                <button onClick={() => navigate("/mentor")} className='w-full text-left text-sm p-3 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl text-gray-700 dark:text-gray-200 flex items-center gap-2 group transition-colors font-medium'><BsRobot size={15} className="text-gray-400 group-hover:text-purple-500 transition-colors" /> Career Mentor</button>
                                <button onClick={() => navigate("/history")} className='w-full text-left text-sm p-3 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl text-gray-700 dark:text-gray-200 flex items-center gap-2 group transition-colors font-medium'><BsList size={15} className="text-gray-400 group-hover:text-purple-500 transition-colors" /> Dashboard Hub</button>
                                <div className='h-px bg-gray-100 dark:bg-slate-800 my-1'></div>
                                <button onClick={handleLogout} className='w-full text-left text-sm p-3 flex items-center gap-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors font-medium'>
                                    <HiOutlineLogout size={16} /> Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile: Credits, Theme, + Hamburger */}
                <div className='flex md:hidden items-center gap-2'>
                    <button onClick={toggleTheme} className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                        {activeTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
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
                            <motion.button
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.18, delay: i * 0.05 }}
                                onClick={link.action}
                                className='w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium transition'
                            >
                                {link.label}
                            </motion.button>
                        ))}
                        <div className='border-t border-gray-100 dark:border-gray-800 mt-1 pt-2'>
                            {userData ? (
                                <>
                                    <div className='bg-purple-50 dark:bg-purple-900/20 px-4 py-3 rounded-xl mx-4 mb-3 border border-purple-100 dark:border-purple-800/50 flex justify-between items-center'>
                                        <div>
                                            <p className='text-xs text-gray-500 dark:text-gray-400 font-medium'>Signed in as</p>
                                            <p className='text-sm text-gray-900 dark:text-white font-bold'>{userData.name}</p>
                                        </div>
                                        <div className='flex items-center gap-1 text-purple-600 dark:text-purple-400 font-bold bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg shadow-sm border border-purple-100 dark:border-purple-800'>
                                            <BsCoin size={12} /> {userData.credits || 0}
                                        </div>
                                    </div>
                                    <button onClick={() => { navigate("/pricing"); setMobileMenuOpen(false); }} className='w-[calc(100%-2rem)] mx-auto mb-2 text-left px-4 py-3 rounded-xl text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/10 hover:bg-purple-100 dark:hover:bg-purple-900/30 font-medium flex items-center gap-2 transition'>
                                        <BsCoin size={16} /> Buy Credits
                                    </button>
                                    <button onClick={handleLogout} className='w-[calc(100%-2rem)] mx-auto text-left px-4 py-3 rounded-xl text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium flex items-center gap-2 transition'>
                                        <HiOutlineLogout size={16} /> Logout
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => { setShowAuth(true); setMobileMenuOpen(false); }} className='w-full bg-black dark:bg-purple-600 text-white py-3 rounded-xl font-medium mt-2'>
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
