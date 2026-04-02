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
          <h1 className="font-display text-3xl sm:text-4xl text-text mb-2">Oups, une erreur est survenue</h1>
          <p className="text-text-light text-center max-w-md mb-8">
            Recharge la page ou retourne à l&apos;accueil.
          </p>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center px-7 py-3.5 bg-primary text-white text-sm font-medium rounded-full hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
            >
              Recharger la page
            </button>
            <a
              href="/"
              className="inline-flex items-center justify-center px-7 py-3.5 bg-white border border-border text-sm font-medium rounded-full text-text hover:border-text transition-colors shadow-sm"
            >
              Accueil
            </a>
            <a
              href="/connexion"
              className="inline-flex items-center justify-center px-7 py-3.5 bg-white border border-border text-sm font-medium rounded-full text-text hover:border-text transition-colors shadow-sm"
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
