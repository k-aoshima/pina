import { Link } from 'react-router-dom'
import { ROUTES } from '../../../app/routes'

interface GameOverModalProps {
  show: boolean
  score: number
  onRetry: () => void
  showScrollHint: boolean
  scrollContainerRef: React.RefObject<HTMLDivElement | null>
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void
}

export function GameOverModal({
  show,
  score,
  onRetry,
  showScrollHint,
  scrollContainerRef,
  onScroll,
}: GameOverModalProps) {
  if (!show) return null

  return (
    <div className="absolute inset-0 flex items-center justify-center z-50 p-2 md:p-6 pointer-events-none overflow-y-auto">
      <div
        ref={scrollContainerRef}
        onScroll={onScroll}
        className="pointer-events-auto bg-white border-2 md:border-8 border-black p-3 md:p-8 w-full max-w-sm md:max-w-lg max-h-[min(90dvh,100%)] overflow-y-auto shadow-brutal-sm md:shadow-brutal-lg transform md:-rotate-1 text-center relative my-auto"
      >
        <Link
          to={ROUTES.HOME}
          className="absolute top-1 left-1 md:top-4 md:left-4 inline-flex items-center gap-1 bg-stone-200 text-black px-1.5 py-0.5 md:px-3 md:py-1.5 border-2 border-black font-bold text-[10px] md:text-sm shadow-sm md:shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          ← HOME
        </Link>
        <h2 className="text-2xl md:text-5xl font-black mb-2 md:mb-4 uppercase text-red-500 italic">
          ざんねん！
        </h2>
        <div className="my-2 py-2 md:my-8 md:py-6 border-y-2 md:border-y-8 border-black border-dashed">
          <p className="text-3xl md:text-7xl font-black tracking-tighter leading-none">{score}</p>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onRetry()
          }}
          className="w-full bg-pina-navy text-pina-yellow border-2 md:border-4 border-black py-2 md:py-5 text-base md:text-2xl font-black shadow-brutal-sm md:shadow-brutal-lg active:translate-y-2 active:shadow-none transition-all hover:bg-blue-900"
        >
          RETRY
        </button>
        {showScrollHint && (
          <div
            className="absolute top-1 right-1 md:hidden flex flex-col items-center text-black/60 animate-scroll-hint"
            aria-hidden
          >
            <span className="text-[8px] font-bold">スクロール</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  )
}
