import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-3xl font-bold text-black mb-4">Something went wrong.</h1>
          <p className="text-gray-500 mb-8 max-w-md">
            We're sorry, but an unexpected error occurred. Please try refreshing the page or go back to the home page.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Refresh Page
            </button>
            <a href="/" className="btn-secondary px-6 py-2 rounded-full font-semibold border border-black hover:bg-black hover:text-white transition-colors">
              Go Home
            </a>
          </div>
          {import.meta.env.DEV && (
            <div className="mt-8 text-left bg-gray-100 p-4 rounded-md max-w-3xl overflow-auto w-full">
              <p className="text-red-500 font-bold mb-2">{this.state.error?.toString()}</p>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                {this.state.errorInfo?.componentStack}
              </pre>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
