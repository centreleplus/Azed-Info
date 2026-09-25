import React, { useState, useEffect, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

export function ErrorBoundary({ children, fallback }: Props) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      console.warn("Caught error in ErrorBoundary listener:", event.error);
    };

    const unhandledRejectionHandler = (event: PromiseRejectionEvent) => {
      console.warn("Caught unhandled rejection in ErrorBoundary listener:", event.reason);
    };

    window.addEventListener("error", errorHandler);
    window.addEventListener("unhandledrejection", unhandledRejectionHandler);

    return () => {
      window.removeEventListener("error", errorHandler);
      window.removeEventListener("unhandledrejection", unhandledRejectionHandler);
    };
  }, []);

  if (hasError) {
    if (fallback) return <>{fallback}</>;

    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-800 rounded-2xl border border-slate-700/80 p-8 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto text-amber-400">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">Une erreur inattendue est survenue</h2>
            <p className="text-slate-400 text-sm">
              L'application a rencontré un problème temporaire. Cliquez ci-dessous pour rafraîchir l'interface.
            </p>
          </div>
          <button
            onClick={() => {
              setHasError(false);
              window.location.reload();
            }}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl shadow-lg transition-all text-sm w-full"
          >
            <RefreshCw className="w-4 h-4" />
            Recharger la page
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
