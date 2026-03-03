interface RotateModalProps {
  show: boolean
}

export function RotateModal({ show }: RotateModalProps) {
  if (!show) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-pina-yellow/95 p-3 md:p-6"
      aria-modal="true"
      role="alert"
      aria-live="polite"
    >
      <div className="bg-white border-2 md:border-8 border-black p-3 md:p-8 max-w-[280px] md:max-w-sm w-full shadow-brutal-sm md:shadow-brutal-lg text-center">
        <div className="mb-2 md:mb-6 flex justify-center">
          <svg
            className="w-12 h-12 md:w-24 md:h-24 text-pina-navy"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </div>
        <p className="text-sm md:text-xl font-black text-black mb-1 md:mb-2">
          横向きに回転してください
        </p>
        <p className="text-[10px] md:text-sm font-bold text-black/70">
          Please rotate to landscape
        </p>
      </div>
    </div>
  )
}
