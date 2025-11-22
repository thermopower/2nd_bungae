interface ErrorMessageProps {
  readonly message: string;
  readonly onRetry?: () => void;
  readonly className?: string;
}

export const ErrorMessage = ({
  message,
  onRetry,
  className = '',
}: ErrorMessageProps): JSX.Element => (
  <div
    className={`p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}
    role="alert"
  >
    <div className="flex items-start gap-3">
      <svg
        className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <div className="flex-1">
        <p className="text-sm text-red-800">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 text-sm font-medium text-red-600 hover:text-red-500"
          >
            다시 시도
          </button>
        )}
      </div>
    </div>
  </div>
);
