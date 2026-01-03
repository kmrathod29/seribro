<<<<<<< HEAD
import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
=======
// src/components/ErrorBoundary.jsx
// Error Boundary component to catch React errors and display fallback UI

import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
>>>>>>> c60feea9278ac643f4ee64b68ef91a22103c1bed

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
<<<<<<< HEAD
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
=======
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
>>>>>>> c60feea9278ac643f4ee64b68ef91a22103c1bed
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
<<<<<<< HEAD
    console.error('[ErrorBoundary] Error caught:', error);
    console.error('[ErrorBoundary] Error info:', errorInfo);
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
    console.error('[ErrorBoundary] Full error details:', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
    this.setState({
      error,
      errorInfo
=======
    // Log error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
>>>>>>> c60feea9278ac643f4ee64b68ef91a22103c1bed
    });
  }

  handleReset = () => {
<<<<<<< HEAD
    this.setState({ 
      hasError: false, 
      error: null,
      errorInfo: null
    });
    // Optionally reload the page
    window.location.reload();
=======
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
>>>>>>> c60feea9278ac643f4ee64b68ef91a22103c1bed
  };

  render() {
    if (this.state.hasError) {
<<<<<<< HEAD
      return (
        <div className="min-h-screen bg-gradient-to-br from-navy via-navy-light to-navy-dark flex flex-col items-center justify-center px-4 text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Something went wrong</h1>
          <p className="text-gray-300 mb-4 max-w-md">
            An unexpected error occurred. Please try again or refresh the page.
          </p>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6 max-w-lg text-left space-y-2">
              <p className="text-red-300 font-mono text-sm break-words">
                {this.state.error.toString()}
              </p>
              {this.state.errorInfo?.componentStack && (
                <div className="mt-4">
                  <p className="text-red-400 font-semibold text-xs mb-2">Component Stack:</p>
                  <pre className="text-red-300 font-mono text-xs overflow-auto max-h-40 bg-black/20 p-2 rounded">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </div>
          )}
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
=======
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
>>>>>>> c60feea9278ac643f4ee64b68ef91a22103c1bed
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
<<<<<<< HEAD
=======

>>>>>>> c60feea9278ac643f4ee64b68ef91a22103c1bed
