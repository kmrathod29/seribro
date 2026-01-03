import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
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
    });
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null,
      errorInfo: null
    });
    // Optionally reload the page
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
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
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
