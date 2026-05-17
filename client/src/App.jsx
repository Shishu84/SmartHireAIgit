import React, { useEffect } from 'react'
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
import Navbar from './components/Navbar'
import Footer from './components/Footer'

export const ServerUrl = "http://localhost:8000"

function App() {
  const dispatch = useDispatch()
  const location = useLocation()
  
  const isInterviewRoom = location.pathname === '/interview' || location.pathname === '/avatar-interview'

  useEffect(() => {
    const getUser = async () => {
      try {
        const result = await axios.get(ServerUrl + "/api/user/current-user", { withCredentials: true })
        dispatch(setUserData(result.data))
      } catch (error) {
        console.log(error)
        dispatch(setUserData(null))
      }
    }
    getUser()
  }, [dispatch])

  return (
    <div className="flex flex-col min-h-screen">
      {!isInterviewRoom && <Navbar />}
      
      <main className="flex-1">
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/auth' element={<Auth />} />
          <Route path='/interview' element={<InterviewPage />} />
          <Route path='/history' element={<InterviewHistory />} />
          <Route path='/pricing' element={<Pricing />} />
          <Route path='/report/:id' element={<InterviewReport />} />
          <Route path='/resume-report/:id' element={<ResumeReport />} />
          <Route path='/upload-resume' element={<UploadResume />} />
          <Route path='/mentor' element={<AiChat />} />
          <Route path='/avatar-interview' element={<AvatarInterview />} />
        </Routes>
      </main>

      {!isInterviewRoom && <Footer />}
    </div>
  )
}

export default App
