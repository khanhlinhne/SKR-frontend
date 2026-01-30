import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can log error to external service here
    console.error('ErrorBoundary caught an error', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-2xl w-full bg-base-100 p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Có lỗi trong trang này</h2>
            <p className="mb-2 text-sm text-red-600">{this.state.error?.toString()}</p>
            <details className="text-xs whitespace-pre-wrap">{this.state.errorInfo?.componentStack}</details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
