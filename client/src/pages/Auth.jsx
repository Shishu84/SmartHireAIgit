import React, { useState } from 'react'
import { BsRobot, BsGithub, BsEnvelope, BsLock, BsPerson, BsEye, BsEyeSlash, BsX } from "react-icons/bs";
import { IoSparkles } from "react-icons/io5";
import { motion, AnimatePresence } from "motion/react"
import { FcGoogle } from "react-icons/fc";
import { 
    signInWithPopup, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    sendPasswordResetEmail,
    updateProfile
} from 'firebase/auth';
import { auth, provider, githubProvider } from '../utils/firebase';
import axios from 'axios';
import { ServerUrl } from '../App';
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice';
import logo from '../assets/logo.png';

function Auth({isModel = false, onClose}) {
    const dispatch = useDispatch()
    const [isLogin, setIsLogin] = useState(true)
    const [nameInput, setNameInput] = useState('')
    const [emailInput, setEmailInput] = useState('')
    const [passwordInput, setPasswordInput] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [resetSent, setResetSent] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    // PRESERVED EXACTLY AS ORIGINAL
    const handleGoogleAuth = async () => {
        try {
            const response = await signInWithPopup(auth,provider)
            let User = response.user
            let name = User.displayName
            let email = User.email
            const result = await axios.post(ServerUrl + "/api/auth/google" , {name , email} , {withCredentials:true})
            dispatch(setUserData(result.data))
        } catch (error) {
            console.log(error)
            dispatch(setUserData(null))
        }
    }

    const handleGithubAuth = async () => {
        try {
            const response = await signInWithPopup(auth, githubProvider)
            let User = response.user
            let name = User.displayName || User.reloadUserInfo?.screenName || 'GitHub User'
            let email = User.email || `${User.uid}@github.login`
            const result = await axios.post(ServerUrl + "/api/auth/google", { name, email }, { withCredentials: true })
            dispatch(setUserData(result.data))
        } catch (error) {
            console.log(error)
            if (error.message.includes('auth/invalid-credential') || error.message.includes('Bad credentials')) {
                setError("GitHub Login Failed: Please ensure GitHub Authentication is enabled and configured with the correct Client ID and Secret in your Firebase Console.")
            } else {
                setError(error.message.replace('Firebase: ', ''))
            }
        }
    }

    const handleEmailAuth = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            let User;
            if (isLogin) {
                const response = await signInWithEmailAndPassword(auth, emailInput, passwordInput)
                User = response.user
            } else {
                const response = await createUserWithEmailAndPassword(auth, emailInput, passwordInput)
                User = response.user
                await updateProfile(User, { displayName: nameInput })
            }
            
            let name = User.displayName || nameInput || 'User'
            let email = User.email
            
            const result = await axios.post(ServerUrl + "/api/auth/google", { name, email }, { withCredentials: true })
            dispatch(setUserData(result.data))
            
        } catch (err) {
            setError(err.message.replace('Firebase: ', '').replace('Error (', '').replace(').', ''))
        } finally {
            setLoading(false)
        }
    }

    const handleForgotPassword = async () => {
        if (!emailInput) {
            setError("Please enter your email address first to reset password.")
            return
        }
        try {
            await sendPasswordResetEmail(auth, emailInput)
            setResetSent(true)
            setError('')
        } catch (err) {
            setError(err.message.replace('Firebase: ', ''))
        }
    }

    return (
        <div className={`w-full ${isModel ? "py-2" : "min-h-screen bg-[#f3f3f3] dark:bg-slate-900 flex items-center justify-center px-6 py-20"}`}>
            <motion.div 
            initial={{opacity:0 , y:-20}} 
            animate={{opacity:1 , y:0}} 
            transition={{duration:0.5, ease: "easeOut"}}
            className={`w-full ${isModel ? "max-w-md p-8 rounded-3xl" : "max-w-md p-10 rounded-[32px]"} bg-white dark:bg-slate-800 shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden relative transition-colors`}>
                
                {isModel && onClose && (
                    <button 
                        type="button"
                        onClick={onClose}
                        className="absolute top-5 right-5 text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 hover:bg-gray-200 dark:bg-slate-700/50 dark:hover:bg-slate-600 p-2 rounded-full transition-all"
                    >
                        <BsX size={20} />
                    </button>
                )}

                <div className='flex items-center justify-center gap-3 mb-8'>
                    <img src={logo} alt="SmartHireAI Logo" className="w-10 h-10 rounded-xl object-cover shadow-sm" />
                    <h2 className='font-bold text-xl tracking-tight text-gray-900 dark:text-white'>SmartHire.AI</h2>
                </div>

                <div className="mb-8">
                    <h1 className='text-2xl font-bold text-gray-900 dark:text-white text-center mb-2'>
                        {isLogin ? "Welcome back" : "Create an account"}
                    </h1>
                    <p className='text-gray-500 dark:text-gray-400 text-center text-sm'>
                        {isLogin ? "Sign in to access your interview dashboard." : "Join us to practice AI-powered interviews."}
                    </p>
                </div>

                {error && (
                    <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl text-center">
                        {error}
                    </motion.div>
                )}

                {resetSent && (
                    <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="mb-4 p-3 bg-green-50 border border-green-100 text-green-700 text-xs rounded-xl text-center">
                        Password reset email sent! Check your inbox.
                    </motion.div>
                )}

                <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
                    <AnimatePresence mode="popLayout">
                        {!isLogin && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0, overflow: 'hidden' }} 
                                animate={{ opacity: 1, height: 'auto', overflow: 'visible' }} 
                                exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                                className="relative">
                                <BsPerson className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input 
                                    type="text" 
                                    placeholder="Full Name" 
                                    value={nameInput}
                                    onChange={(e) => setNameInput(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-2xl py-3 pl-11 pr-4 text-sm text-gray-900 dark:text-white outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-black dark:focus:border-emerald-500 focus:ring-1 focus:ring-black dark:focus:ring-emerald-500 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                    required={!isLogin}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="relative">
                        <BsEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="email" 
                            placeholder="Email address" 
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-2xl py-3 pl-11 pr-4 text-sm text-gray-900 dark:text-white outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-black dark:focus:border-emerald-500 focus:ring-1 focus:ring-black dark:focus:ring-emerald-500 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                            required
                        />
                    </div>

                    <div className="relative">
                        <BsLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="Password" 
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-2xl py-3 pl-11 pr-12 text-sm text-gray-900 dark:text-white outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-black dark:focus:border-emerald-500 focus:ring-1 focus:ring-black dark:focus:ring-emerald-500 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                            required
                        />
                        <button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                            {showPassword ? <BsEyeSlash size={18} /> : <BsEye size={18} />}
                        </button>
                    </div>

                    {isLogin && (
                        <div className="flex justify-end">
                            <button type="button" onClick={handleForgotPassword} className="text-xs text-gray-500 hover:text-black dark:hover:text-white font-medium transition-colors">
                                Forgot password?
                            </button>
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={loading}
                        className='w-full py-3.5 mt-2 bg-black dark:bg-emerald-600 text-white rounded-2xl font-medium text-sm hover:bg-gray-800 dark:hover:bg-emerald-500 transition-colors shadow-lg shadow-black/10 dark:shadow-emerald-900/20 disabled:opacity-70 flex items-center justify-center'>
                        {loading ? "Please wait..." : (isLogin ? "Sign In" : "Create Account")}
                    </button>
                </form>

                <div className="relative flex items-center justify-center mb-6 mt-6">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-slate-700"></div></div>
                    <div className="relative bg-white dark:bg-slate-800 px-4 text-xs text-gray-400 font-semibold uppercase tracking-wider">Or continue with</div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                    <button 
                        onClick={handleGoogleAuth}
                        type="button"
                        className='flex items-center justify-center gap-2 py-3 border border-gray-200 dark:border-slate-700 rounded-2xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors text-sm font-semibold text-gray-700 dark:text-gray-200 shadow-sm'>
                        <FcGoogle size={18}/>
                        Google
                    </button>
                    <button 
                        onClick={handleGithubAuth}
                        type="button"
                        className='flex items-center justify-center gap-2 py-3 border border-gray-200 dark:border-slate-700 rounded-2xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors text-sm font-semibold text-gray-700 dark:text-gray-200 shadow-sm'>
                        <BsGithub size={18} className="text-gray-900 dark:text-white"/>
                        GitHub
                    </button>
                </div>

                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <button 
                        type="button"
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError('');
                            setResetSent(false);
                        }} 
                        className="ml-2 text-black dark:text-white font-bold hover:underline">
                        {isLogin ? "Sign up" : "Sign in"}
                    </button>
                </p>

            </motion.div>
        </div>
    )
}

export default Auth
