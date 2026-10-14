import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Inbox, Loader2 } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ViewErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled View Error in Boundary:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-2xl border border-red-100 shadow-sm p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              {this.props.fallbackTitle || 'Không thể tải nội dung phần này'}
            </h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              {this.state.error?.message || 'Đã có sự cố bất ngờ khi hiển thị giao diện. Bạn có thể nhấn thử lại bên dưới.'}
            </p>
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Thử lại ngay
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export const ViewLoadingFallback: React.FC<{ label?: string; message?: string }> = ({
  label,
  message
}) => {
  const displayText = message || label || 'Đang tải dữ liệu...';
  return (
    <div className="min-h-[350px] flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-800">{displayText}</p>
        <p className="text-xs text-slate-400 mt-0.5">Tối ưu hoá trải nghiệm học tập và phản hồi</p>
      </div>
      <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-blue-600 rounded-full animate-pulse w-3/4" />
      </div>
    </div>
  );
};

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-10 text-center flex flex-col items-center justify-center shadow-xs">
      <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mb-3">
        {icon || <Inbox className="w-6 h-6" />}
      </div>
      <h3 className="text-sm font-bold text-slate-800 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mb-4 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export interface ErrorStateWithRetryProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export const ErrorStateWithRetry: React.FC<ErrorStateWithRetryProps> = ({
  title = 'Tải dữ liệu không thành công',
  message,
  onRetry,
  retryLabel = 'Thử tải lại'
}) => {
  return (
    <div className="bg-red-50/60 rounded-2xl border border-red-200/80 p-8 text-center flex flex-col items-center justify-center shadow-xs">
      <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-3">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-xs text-slate-600 max-w-md mb-4 leading-relaxed">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          {retryLabel}
        </button>
      )}
    </div>
  );
};
