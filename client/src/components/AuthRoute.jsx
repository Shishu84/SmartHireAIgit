import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function AuthRoute({ children, isCheckingAuth }) {
  const { userData } = useSelector((state) => state.user);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (userData) {
    return <Navigate to="/avatar-interview" replace />;
  }

  return children;
}
