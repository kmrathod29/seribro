// src/components/ErrorBoundary.jsx
// Error Boundary component to catch React errors and display fallback UI

import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-slate-800/50 border border-red-500/30 rounded-lg p-8 space-y-6">
            <div className="flex items-center gap-3 text-red-400">
              <AlertCircle size={32} />
              <h1 className="text-2xl font-bold">Something went wrong</h1>
            </div>

            <div className="space-y-4">
              <p className="text-gray-300">
                An unexpected error occurred. This has been logged and we'll look into it.
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="bg-slate-900/50 rounded p-4 border border-slate-700">
                  <summary className="text-sm text-gray-400 cursor-pointer mb-2">
                    Error Details (Development Only)
                  </summary>
                  <pre className="text-xs text-red-300 overflow-auto max-h-64 mt-2">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium rounded transition-colors"
              >
                <Home size={18} />
                Go to Home
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded transition-colors"
              >
                <RefreshCw size={18} />
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

