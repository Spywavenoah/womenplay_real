import React, { ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an unhandled React rendering error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div 
          role="alert" 
          aria-live="assertive"
          className="min-h-[320px] w-full flex flex-col items-center justify-center bg-slate-900/90 text-slate-100 p-8 text-center rounded-3xl border border-slate-800 shadow-2xl my-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mb-4 shadow-inner">
            <AlertTriangle className="w-8 h-8" />
          </div>
          
          <h3 className="text-xl font-display font-bold text-white mb-2">
            {this.props.fallbackTitle || "Unable to display this section"}
          </h3>
          
          <p className="text-xs text-slate-400 mb-6 max-w-md leading-relaxed">
            {this.state.error?.message || this.props.fallbackMessage || "An unexpected interface error occurred. You can safely try reloading this component."}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={this.handleReset}
              className="min-h-[44px] px-5 py-2.5 bg-brand-pink hover:bg-brand-pink-dark text-white text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer shadow-md"
              aria-label="Try loading this section again"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
            <button
              type="button"
              onClick={() => { window.location.href = "/"; }}
              className="min-h-[44px] px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer"
              aria-label="Return to WomenPlay home page"
            >
              <Home className="w-4 h-4" />
              <span>Return Home</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
