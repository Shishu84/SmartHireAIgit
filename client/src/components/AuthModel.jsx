import React, { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import Auth from '../pages/Auth';

function AuthModel({onClose}) {
    const {userData} = useSelector((state)=>state.user)
    const modalRef = useRef()

    useEffect(()=>{
        if(userData){
            onClose()
        }
    },[userData , onClose])

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [onClose])

    const handleOutsideClick = (e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
            onClose()
        }
    }

  return (
    <div onClick={handleOutsideClick} className='fixed inset-0 z-[999] flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm px-4 transition-all'>
        <div ref={modalRef} className='w-full max-w-md'>
            <Auth isModel={true} onClose={onClose}/>
        </div>
    </div>
  )
}

export default AuthModel
