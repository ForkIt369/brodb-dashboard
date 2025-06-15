'use client'

import React from 'react'

interface Props {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  reset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        const Fallback = this.props.fallback
        return <Fallback error={this.state.error} reset={this.reset} />
      }

      return (
        <div className="min-h-screen bg-dark-primary flex items-center justify-center p-4">
          <div className="bg-dark-secondary border border-red-500/20 rounded-lg p-8 max-w-2xl w-full">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Something went wrong</h2>
            <pre className="bg-dark-tertiary p-4 rounded text-sm text-gray-300 mb-4 overflow-auto">
              {this.state.error.message}
            </pre>
            <details className="mb-4">
              <summary className="cursor-pointer text-gray-400 hover:text-white">
                Stack trace
              </summary>
              <pre className="mt-2 bg-dark-tertiary p-4 rounded text-xs text-gray-400 overflow-auto">
                {this.state.error.stack}
              </pre>
            </details>
            <button
              onClick={this.reset}
              className="px-4 py-2 bg-bro-500 text-white rounded-lg hover:bg-bro-600 transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}