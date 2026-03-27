import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-bg text-text">
          <h1 className="font-display text-2xl text-text mb-2">Oups, une erreur est survenue</h1>
          <p className="text-text-light text-center max-w-md mb-8">
            Recharge la page ou retourne à l&apos;accueil.
          </p>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors"
            >
              Recharger la page
            </button>
            <a
              href="/"
              className="px-5 py-2.5 border border-border text-sm font-medium rounded-lg hover:border-text transition-colors"
            >
              Accueil
            </a>
            <a
              href="/connexion"
              className="px-5 py-2.5 border border-border text-sm font-medium rounded-lg hover:border-text transition-colors"
            >
              Connexion
            </a>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
