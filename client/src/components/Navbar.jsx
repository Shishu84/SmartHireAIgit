import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from "motion/react"
import { BsRobot, BsCoin, BsList, BsX } from "react-icons/bs";
import { HiOutlineLogout } from "react-icons/hi";
import { FaUserAstronaut } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ServerUrl } from '../App';
import { setUserData } from '../redux/userSlice';
import AuthModel from './AuthModel';

function Navbar() {
    const { userData } = useSelector((state) => state.user)
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
            setMobileMenuOpen(false)
            navigate("/")
        } catch (error) {
            console.log(error)
        }
    }

    const navLinks = [
        { label: "Home", action: () => { navigate("/"); setMobileMenuOpen(false); } },
        ...(userData ? [
            { label: "Career Mentor Bot", action: () => { navigate("/mentor"); setMobileMenuOpen(false); } },
            { label: "Interview History", action: () => { navigate("/history"); setMobileMenuOpen(false); } },
        ] : []),
        { label: "Pricing", action: () => { navigate("/pricing"); setMobileMenuOpen(false); } },
    ]

    return (
        <div className='bg-[#f3f3f3] flex justify-center px-4 pt-6 relative z-50'>
            <motion.div
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className='w-full max-w-6xl bg-white rounded-[24px] shadow-sm border border-gray-200 px-5 py-4 flex justify-between items-center relative'>

                {/* Logo */}
                <div onClick={() => navigate("/")} className='flex items-center gap-3 cursor-pointer'>
                    <div className='bg-black text-white p-2 rounded-lg'>
                        <BsRobot size={18} />
                    </div>
                    <h1 className='font-semibold text-lg'>SmartHire.AI</h1>
                </div>

                {/* Desktop Nav */}
                <div className='hidden md:flex items-center gap-6 relative'>
                    <button onClick={() => navigate("/")} className='text-gray-600 hover:text-black font-medium transition'>Home</button>
                    {userData && (
                        <button onClick={() => navigate("/mentor")} className='flex items-center gap-2 text-gray-600 hover:text-black font-medium transition'>
                            <BsRobot size={18} /> Career Mentor
                        </button>
                    )}
                    <button onClick={() => navigate("/pricing")} className='text-gray-600 hover:text-black font-medium transition'>Pricing</button>

                    {/* Credits */}
                    <div className='relative'>
                        <button onClick={() => {
                            if (!userData) { setShowAuth(true); return; }
                            setShowCreditPopup(!showCreditPopup);
                            setShowUserPopup(false)
                        }} className='flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full text-sm hover:bg-gray-200 transition'>
                            <BsCoin size={18} />
                            {userData?.credits || 0}
                        </button>
                        {showCreditPopup && (
                            <div className='absolute right-0 mt-3 w-64 bg-white shadow-xl border border-gray-200 rounded-xl p-5 z-50'>
                                <p className='text-sm text-gray-600 mb-4'>Need more credits to continue interviews?</p>
                                <button onClick={() => navigate("/pricing")} className='w-full bg-black text-white py-2 rounded-lg text-sm'>Buy more credits</button>
                            </div>
                        )}
                    </div>

                    {/* User */}
                    <div className='relative'>
                        <button onClick={() => {
                            if (!userData) { setShowAuth(true); return; }
                            setShowUserPopup(!showUserPopup);
                            setShowCreditPopup(false)
                        }} className='w-9 h-9 bg-black text-white rounded-full flex items-center justify-center font-semibold'>
                            {userData ? userData?.name.slice(0, 1).toUpperCase() : <FaUserAstronaut size={16} />}
                        </button>
                        {showUserPopup && (
                            <div className='absolute right-0 mt-3 w-48 bg-white shadow-xl border border-gray-200 rounded-xl p-4 z-50'>
                                <p className='text-sm text-blue-500 font-medium mb-2'>{userData?.name}</p>
                                <button onClick={() => navigate("/mentor")} className='w-full text-left text-sm py-2 hover:text-black text-gray-600 flex items-center gap-2'><BsRobot size={14} /> Career Mentor</button>
                                <button onClick={() => navigate("/history")} className='w-full text-left text-sm py-2 hover:text-black text-gray-600'>Interview History</button>
                                <button onClick={handleLogout} className='w-full text-left text-sm py-2 flex items-center gap-2 text-red-500'>
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
                    }} className='flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-full text-sm'>
                        <BsCoin size={16} /> {userData?.credits || 0}
                    </button>
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className='w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition'>
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
                        className='absolute top-[80px] left-4 right-4 bg-white rounded-2xl shadow-xl border border-gray-200 p-4 z-50 flex flex-col gap-2'>
                        {navLinks.map((link, i) => (
                            <button key={i} onClick={link.action} className='w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium transition'>
                                {link.label}
                            </button>
                        ))}
                        <div className='border-t border-gray-100 mt-1 pt-2'>
                            {userData ? (
                                <>
                                    <p className='text-xs text-gray-400 px-4 mb-1'>Signed in as <span className='text-blue-500 font-medium'>{userData.name}</span></p>
                                    <button onClick={handleLogout} className='w-full text-left px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 font-medium flex items-center gap-2 transition'>
                                        <HiOutlineLogout size={16} /> Logout
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => { setShowAuth(true); setMobileMenuOpen(false); }} className='w-full bg-black text-white py-3 rounded-xl font-medium'>
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
