import React from 'react'
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useTheme } from '../context/ThemeContext';

function Timer({ timeLeft = 0, totalTime = 60 }) {
    const validTotalTime = totalTime > 0 ? totalTime : 60;
    const percentage = (timeLeft / validTotalTime) * 100 || 0;
    const { theme } = useTheme();

  return (
    <div className='w-20 h-20'>
        <CircularProgressbar
        value={percentage}
        text={`${timeLeft}s`}
        styles={buildStyles({
          textSize: "28px",
          pathColor: "#10b981",
          textColor: theme === 'dark' ? '#f87171' : '#ef4444',
          trailColor: theme === 'dark' ? '#374151' : '#e5e7eb',
        })}
        />
      
    </div>
  )
}

export default Timer
