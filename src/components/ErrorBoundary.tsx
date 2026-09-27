import React, { Component, ErrorInfo, ReactNode } from 'react';

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
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[House of Líora] Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('liora_site_content');
    } catch {}
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF8F5] text-[#24211D] flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-white border border-[#EAE0D5] rounded-2xl shadow-xl p-8 space-y-5">
            <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 text-[#8C5E35] flex items-center justify-center text-2xl font-serif font-bold">
              HL
            </div>
            <div className="space-y-2">
              <h2 className="font-serif text-2xl text-[#24211D]">Studio Portal Recovery</h2>
              <p className="text-xs text-[#7A6F62] leading-relaxed">
                ব্রাউজারের লোকাল ক্যাশের কারণে পেজ লোড হতে সাময়িক বিঘ্ন ঘটেছে। নিচের বাটনে ক্লিক করলে ক্যাশ স্বয়ংক্রিয়ভাবে ক্লিন হয়ে পেজটি ফ্রেশভাবে রিলোড হবে।
              </p>
            </div>
            {this.state.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-left text-[11px] font-mono text-red-700 overflow-x-auto max-h-32">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}
            <div className="space-y-2 pt-2">
              <button
                onClick={this.handleReset}
                className="w-full py-3 bg-[#24211D] hover:bg-[#3D3730] text-white text-xs font-semibold rounded-lg uppercase tracking-wider transition-colors cursor-pointer"
              >
                Clear Cache & Reload Studio Admin
              </button>
              <button
                onClick={() => { window.location.href = '/'; }}
                className="w-full py-2 text-xs text-[#8C5E35] hover:text-[#24211D] font-medium transition-colors cursor-pointer"
              >
                Return to Storefront Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
