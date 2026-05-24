import React from 'react';
import { Button } from '@/components/ui/button';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[Agriphix] Page error:', error, info);
  }

  handleRetry = () => {
    this.setState({ error: null });
    window.location.reload();
  };

  render() {
    if (this.state.error) {
      return (
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center max-w-lg mx-auto my-8">
          <h2 className="text-lg font-semibold text-red-900 mb-2">Something went wrong</h2>
          <p className="text-sm text-red-800 mb-4">
            This page hit an unexpected error. Try refreshing, or contact support if it continues.
          </p>
          <Button type="button" onClick={this.handleRetry} className="bg-emerald-600 hover:bg-emerald-700">
            Reload page
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
