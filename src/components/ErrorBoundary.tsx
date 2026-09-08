import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Threadline ErrorBoundary Caught Error]:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetWorkspace = () => {
    // Attempt recovery by removing temporary state
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF6EE] text-[#221E18] flex items-center justify-center p-6 select-none font-sans">
          <div className="max-w-md w-full bg-[#F1EAD9] border border-[rgba(34,30,24,0.15)] rounded-[8px] p-6 shadow-warm-md text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 border border-red-200 text-red-700 flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>

            <div className="space-y-1.5">
              <h2 className="font-serif font-bold text-lg text-[#221E18]">
                Manuscript Workspace Encountered an Issue
              </h2>
              <p className="text-xs text-[#7A705F] leading-relaxed">
                Threadline caught an unexpected error. Your manuscript data is preserved in local storage.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="bg-[#FAF6EE] p-2.5 rounded-[5px] border border-[rgba(34,30,24,0.1)] text-left">
                <p className="font-mono text-[11px] text-red-800 break-words line-clamp-3">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex gap-2 justify-center pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#B54B32] text-[#FAF6EE] text-xs font-semibold rounded-[5px] hover:bg-[#9E3E27] cursor-pointer shadow-warm-sm"
              >
                <RefreshCw size={13} />
                <span>Reload Page</span>
              </button>

              <button
                type="button"
                onClick={this.handleResetWorkspace}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#FAF6EE] border border-[rgba(34,30,24,0.15)] text-[#221E18] text-xs font-semibold rounded-[5px] hover:bg-white cursor-pointer"
              >
                <Home size={13} />
                <span>Recover Studio</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
