import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-6">
          <div className="bg-red-900/20 border border-red-500/50 p-8 rounded-2xl max-w-lg text-center">
            <h2 className="text-2xl font-bold mb-4 text-red-400">Module Crashed</h2>
            <p className="text-sm text-gray-300 mb-6">
              The AI Interview module encountered a fatal runtime error and was safely isolated to prevent a full page crash.
            </p>
            <div className="bg-black/50 p-3 rounded-lg text-left text-xs font-mono text-red-300 mb-6 overflow-x-auto">
                {this.state.error?.toString()}
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl transition"
            >
              Restart Interview
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
