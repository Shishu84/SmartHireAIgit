import React, { useEffect, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import Home from './pages/Home'
import Auth from './pages/Auth'
import axios from 'axios'
import { useDispatch } from 'react-redux'
import { setUserData } from './redux/userSlice'
import InterviewPage from './pages/InterviewPage'
import InterviewHistory from './pages/InterviewHistory'
import Pricing from './pages/Pricing'
import InterviewReport from './pages/InterviewReport'
import ResumeReport from './pages/ResumeReport'
import UploadResume from './pages/UploadResume'
import AiChat from './pages/AiChat'
import AvatarInterview from './pages/AvatarInterview'
import About from './pages/About'
import Contact from './pages/Contact'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import AuthRoute from './components/AuthRoute'

export const ServerUrl = "http://localhost:8000"

const PageWrapper = ({ children }) => {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
}

function ScrollManager() {
  const location = useLocation();
  
  useEffect(() => {
    // We delay the scroll slightly to allow Framer Motion exit animations to start,
    // avoiding a harsh jump before the page fades out.
    const timeout = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, 10);
    return () => clearTimeout(timeout);
  }, [location.pathname]);

  return null;
}

function App() {
  const dispatch = useDispatch()
  const location = useLocation()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  const isInterviewRoom = location.pathname === '/interview' || location.pathname === '/avatar-interview'

  useEffect(() => {
    const getUser = async () => {
      try {
        const result = await axios.get(ServerUrl + "/api/user/current-user", { withCredentials: true })
        dispatch(setUserData(result.data))
      } catch (error) {
        console.log(error)
        dispatch(setUserData(null))
      } finally {
        setIsCheckingAuth(false)
      }
    }
    getUser()
  }, [dispatch])

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <ScrollManager />
      {!isInterviewRoom && <Navbar />}

      <main className="flex-1">
        <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' })}>
          <Routes location={location} key={location.pathname}>
            {/* Public Routes */}
            <Route path='/' element={<PageWrapper><Home /></PageWrapper>} />
            <Route path='/about' element={<PageWrapper><About /></PageWrapper>} />
            <Route path='/contact' element={<PageWrapper><Contact /></PageWrapper>} />
            <Route path='/privacy' element={<PageWrapper><PrivacyPolicy /></PageWrapper>} />
            <Route path='/terms' element={<PageWrapper><TermsOfService /></PageWrapper>} />
            <Route path='/pricing' element={<PageWrapper><Pricing /></PageWrapper>} />

            {/* Auth Route (Only for logged-out users) */}
            <Route path='/auth' element={
              <AuthRoute isCheckingAuth={isCheckingAuth}>
                <PageWrapper><Auth /></PageWrapper>
              </AuthRoute>
            } />

            {/* Protected Routes (Only for logged-in users) */}
            <Route path='/interview' element={
              <ProtectedRoute isCheckingAuth={isCheckingAuth}>
                <InterviewPage />
              </ProtectedRoute>
            } />
            <Route path='/history' element={
              <ProtectedRoute isCheckingAuth={isCheckingAuth}>
                <PageWrapper><InterviewHistory /></PageWrapper>
              </ProtectedRoute>
            } />
            <Route path='/report/:id' element={
              <ProtectedRoute isCheckingAuth={isCheckingAuth}>
                <PageWrapper><InterviewReport /></PageWrapper>
              </ProtectedRoute>
            } />
            <Route path='/resume-report/:id' element={
              <ProtectedRoute isCheckingAuth={isCheckingAuth}>
                <PageWrapper><ResumeReport /></PageWrapper>
              </ProtectedRoute>
            } />
            <Route path='/upload-resume' element={
              <ProtectedRoute isCheckingAuth={isCheckingAuth}>
                <PageWrapper><UploadResume /></PageWrapper>
              </ProtectedRoute>
            } />
            <Route path='/mentor' element={
              <ProtectedRoute isCheckingAuth={isCheckingAuth}>
                <PageWrapper><AiChat /></PageWrapper>
              </ProtectedRoute>
            } />
            <Route path='/avatar-interview' element={
              <ProtectedRoute isCheckingAuth={isCheckingAuth}>
                <AvatarInterview />
              </ProtectedRoute>
            } />
          </Routes>
        </AnimatePresence>
      </main>

      {(!isInterviewRoom && location.pathname !== '/mentor') && <Footer />}
    </div>
  )
}

export default App
