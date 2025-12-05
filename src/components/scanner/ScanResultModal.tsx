"use client";

interface ScanResultModalProps {
  isOpen: boolean;
  type: "success" | "error" | "warning";
  title: string;
  message: string;
  employeeName?: string;
  tokensRemaining?: number;
  timestamp?: Date;
  onDismiss: () => void;
}

export default function ScanResultModal({
  isOpen,
  type,
  title,
  message,
  employeeName,
  tokensRemaining,
  timestamp,
  onDismiss,
}: ScanResultModalProps) {
  if (!isOpen) return null;

  const isSuccess = type === "success";
  const isError = type === "error";

  // Determine colors based on type
  const gradientClass = isSuccess
    ? "from-[var(--fnb-teal)] to-[var(--fnb-teal-dark)]"
    : isError
    ? "from-[var(--error)] to-red-700"
    : "from-[var(--fnb-orange)] to-[var(--fnb-orange-dark)]";

  const borderClass = isSuccess
    ? "border-[var(--success)]"
    : isError
    ? "border-[var(--error)]"
    : "border-[var(--fnb-orange)]";

  const titleClass = isSuccess
    ? "text-[var(--success)]"
    : isError
    ? "text-[var(--error)]"
    : "text-[var(--fnb-orange)]";

  const buttonClass = isSuccess
    ? "bg-[var(--fnb-teal)] hover:bg-[var(--fnb-teal-dark)]"
    : isError
    ? "bg-[var(--error)] hover:bg-red-600"
    : "bg-[var(--fnb-orange)] hover:bg-[var(--fnb-orange-dark)]";

  const buttonText = isSuccess ? "Scan Next" : isError ? "Try Again" : "Dismiss";

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="relative animate-zoom-in">
        {/* Floating Icon - positioned above the card */}
        <div className="absolute -top-14 left-1/2 -translate-x-1/2 z-10">
          <div
            className={`w-28 h-28 rounded-full flex items-center justify-center shadow-2xl bg-gradient-to-br ${gradientClass}`}
            style={{
              boxShadow: isSuccess
                ? "0 0 40px rgba(0, 170, 172, 0.4)"
                : isError
                ? "0 0 40px rgba(239, 68, 68, 0.4)"
                : "0 0 40px rgba(245, 156, 35, 0.4)",
            }}
          >
            {isSuccess ? (
              <svg
                className="w-14 h-14 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : isError ? (
              <svg
                className="w-14 h-14 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-14 h-14 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            )}
          </div>
        </div>

        {/* Main Card */}
        <div
          className={`relative bg-[#1A2332] rounded-3xl border-2 p-8 pt-20 max-w-sm w-full shadow-2xl ${borderClass}`}
        >
          {/* Title */}
          <h2 className={`text-2xl font-bold text-center mb-3 ${titleClass}`}>
            {title}
          </h2>

          {/* Message */}
          <p className="text-center text-white/90 text-base font-medium mb-6">
            {message}
          </p>

          {/* Content Box - Only show if we have details */}
          {(employeeName || tokensRemaining !== undefined || timestamp) && (
            <div className="bg-white/5 rounded-2xl p-5 mb-6 border border-white/10">
              <div className="flex flex-col gap-3">
                {employeeName && (
                  <div className="flex justify-between items-center">
                    <span className="text-white/50 text-sm">Employee</span>
                    <span className="text-white font-semibold">{employeeName}</span>
                  </div>
                )}
                {tokensRemaining !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-white/50 text-sm">Tokens Left</span>
                    <span
                      className={`font-bold text-lg ${
                        tokensRemaining <= 3
                          ? "text-[var(--error)]"
                          : tokensRemaining <= 8
                          ? "text-[var(--fnb-orange)]"
                          : "text-[var(--fnb-teal)]"
                      }`}
                    >
                      {tokensRemaining}
                    </span>
                  </div>
                )}
                {timestamp && (
                  <div className="flex justify-between items-center">
                    <span className="text-white/50 text-sm">Time</span>
                    <span className="text-white font-semibold">
                      {timestamp.toLocaleTimeString("en-BW", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Helper Text */}
          <p className="text-sm text-white/40 text-center mb-5">
            Tap button below to continue scanning
          </p>

          {/* Action Button */}
          <button
            onClick={onDismiss}
            className={`w-full py-4 rounded-2xl font-bold text-white text-lg transition-all duration-200 shadow-lg active:scale-95 ${buttonClass}`}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
