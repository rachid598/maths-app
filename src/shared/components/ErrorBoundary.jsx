import { Component } from 'react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // TODO: send to telemetry if configured
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-bg text-center">
          <div className="max-w-md">
            <div className="text-6xl mb-4">😵</div>
            <h2 className="text-xl font-bold mb-2">Oups — une erreur est survenue</h2>
            <p className="text-sm text-slate-400 mb-4">Nous avons enregistré l'erreur. Tu peux recharger l'application.</p>
            <div className="flex gap-3 justify-center">
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold" onClick={() => window.location.reload()}>
                Recharger
              </button>
              <button className="px-4 py-2 bg-white text-indigo-600 rounded-xl font-bold" onClick={() => (window.location.href = '/') }>
                Retour à l'accueil
              </button>
            </div>
            {this.state.error && (
              <details className="mt-4 text-xs text-left text-slate-400 overflow-auto max-h-40">
                <summary>Voir l'erreur</summary>
                <pre className="whitespace-pre-wrap">{String(this.state.error)}</pre>
              </details>
            )}
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
