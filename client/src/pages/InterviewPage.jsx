import React, { useState, useEffect } from 'react'
import Step1SetUp from '../components/Step1SetUp'
import Step2Interview from '../components/Step2Interview'
import Step3Report from '../components/Step3Report'

function InterviewPage() {
    const [step, setStep] = useState(() => {
        const savedStep = localStorage.getItem('interviewStep');
        // Only restore step 1 or 2, never step 3 — avoid landing on stale report
        const parsed = savedStep ? Number(savedStep) : 1;
        return parsed === 3 ? 1 : parsed;
    });
    
    const [interviewData, setInterviewData] = useState(() => {
        const savedData = localStorage.getItem('interviewData');
        return savedData ? JSON.parse(savedData) : null;
    });

    useEffect(() => {
        // Only persist step 1 and 2; clear on step 3
        if (step === 3) {
            localStorage.removeItem('interviewStep');
        } else {
            localStorage.setItem('interviewStep', step);
        }
    }, [step]);

    useEffect(() => {
        if (interviewData && step < 3) {
            localStorage.setItem('interviewData', JSON.stringify(interviewData));
        } else if (step === 3) {
            // Clear setup data once interview is done — don't persist the report
            localStorage.removeItem('interviewData');
        }
    }, [interviewData, step]);

  return (
    <div className='min-h-screen bg-gray-50'>
        {step===1 && (
            <Step1SetUp onStart={(data)=>{
                setInterviewData(data);
                setStep(2);
            }}/>
        )}

         {step===2 && (
            <Step2Interview interviewData={interviewData}
            onFinish={(report)=>{
                setInterviewData(report);
                setStep(3);
            }}
            />
        )}

          {step===3 && (
            <Step3Report report={interviewData}/>
        )}

      
    </div>
  )
}

export default InterviewPage
