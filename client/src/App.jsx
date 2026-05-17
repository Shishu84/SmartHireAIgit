import React, { useEffect, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
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
    <div className="flex flex-col min-h-screen">
      {!isInterviewRoom && <Navbar />}
      
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path='/' element={<Home />} />
          <Route path='/about' element={<About />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/privacy' element={<PrivacyPolicy />} />
          <Route path='/terms' element={<TermsOfService />} />
          <Route path='/pricing' element={<Pricing />} />

          {/* Auth Route (Only for logged-out users) */}
          <Route path='/auth' element={
            <AuthRoute isCheckingAuth={isCheckingAuth}>
              <Auth />
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
              <InterviewHistory />
            </ProtectedRoute>
          } />
          <Route path='/report/:id' element={
            <ProtectedRoute isCheckingAuth={isCheckingAuth}>
              <InterviewReport />
            </ProtectedRoute>
          } />
          <Route path='/resume-report/:id' element={
            <ProtectedRoute isCheckingAuth={isCheckingAuth}>
              <ResumeReport />
            </ProtectedRoute>
          } />
          <Route path='/upload-resume' element={
            <ProtectedRoute isCheckingAuth={isCheckingAuth}>
              <UploadResume />
            </ProtectedRoute>
          } />
          <Route path='/mentor' element={
            <ProtectedRoute isCheckingAuth={isCheckingAuth}>
              <AiChat />
            </ProtectedRoute>
          } />
          <Route path='/avatar-interview' element={
            <ProtectedRoute isCheckingAuth={isCheckingAuth}>
              <AvatarInterview />
            </ProtectedRoute>
          } />
        </Routes>
      </main>

      {!isInterviewRoom && <Footer />}
    </div>
  )
}

export default App
