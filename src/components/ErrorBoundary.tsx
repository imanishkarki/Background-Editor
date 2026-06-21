import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-screen bg-page">
          <div className="text-center p-8">
            <h1 className="text-xl font-bold text-accent mb-2">Something went wrong</h1>
            <p className="text-muted text-sm">Reload the page to try again.</p>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
