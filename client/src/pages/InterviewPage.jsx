import React, { useState, useEffect } from 'react'
import Step1SetUp from '../components/Step1SetUp'
import Step2Interview from '../components/Step2Interview'
import Step3Report from '../components/Step3Report'

function InterviewPage() {
    const [step, setStep] = useState(() => {
        const savedStep = localStorage.getItem('interviewStep');
        return savedStep ? Number(savedStep) : 1;
    });
    
    const [interviewData, setInterviewData] = useState(() => {
        const savedData = localStorage.getItem('interviewData');
        return savedData ? JSON.parse(savedData) : null;
    });

    useEffect(() => {
        localStorage.setItem('interviewStep', step);
    }, [step]);

    useEffect(() => {
        if (interviewData) {
            localStorage.setItem('interviewData', JSON.stringify(interviewData));
        } else {
            localStorage.removeItem('interviewData');
        }
    }, [interviewData]);

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
