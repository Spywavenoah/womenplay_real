import React from "react";

export default function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = React.useState(false);
  const [error, setError] = React.useState<Error | undefined>();

  React.useEffect(() => {
    const handler = (event: ErrorEvent) => {
      setHasError(true);
      setError(event.error);
      event.preventDefault();
    };
    window.addEventListener("error", handler);
    return () => window.removeEventListener("error", handler);
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 text-rose-500 flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-xl font-display font-extrabold text-slate-900 mb-2">Something went wrong</h2>
        <p className="text-sm text-slate-500 mb-6 max-w-md">
          {error?.message || "An unexpected error occurred."}
        </p>
        <button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition">
          Refresh Page
        </button>
      </div>
    );
  }
  return <>{children}</>;
}
