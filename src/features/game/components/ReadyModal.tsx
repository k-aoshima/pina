import { Link } from 'react-router-dom'
import type { RunnerModel } from '../stores/useGameStore'
import { RUNNER_OPTIONS } from '../constants/gameConstants'
import { ROUTES } from '../../../app/routes'

interface ReadyModalProps {
  show: boolean
  selectedModel: RunnerModel
  onSelectModel: (model: RunnerModel) => void
  onStart: () => void
  showScrollHint: boolean
  scrollContainerRef: React.RefObject<HTMLDivElement | null>
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void
}

export function ReadyModal({
  show,
  selectedModel,
  onSelectModel,
  onStart,
  showScrollHint,
  scrollContainerRef,
  onScroll,
}: ReadyModalProps) {
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
        <div className="mb-1 md:mb-3 inline-block bg-pina-navy text-pina-yellow px-1.5 py-0.5 md:px-4 md:py-1 text-[9px] md:text-xs font-black tracking-widest uppercase">
          Pinatoy&apos;s Game
        </div>
        <h1 className="text-2xl md:text-6xl font-black italic tracking-tighter mb-1 md:mb-3 uppercase leading-none">
          Collect Joy!
        </h1>
        <p className="text-sm md:text-xl font-bold mb-2 md:mb-6 text-pina-pink underline decoration-2 md:decoration-4 underline-offset-2">
          3D SUPER RUNNER
        </p>
        <p className="text-[10px] md:text-sm font-bold text-black mb-2 md:mb-4">
          キャラクターを選んでスタート
        </p>
        <div className="mb-3 md:mb-6 flex gap-1.5 md:gap-3 justify-center flex-wrap">
          {RUNNER_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onSelectModel(opt.id)
              }}
              className={`rounded-md md:rounded-xl border-2 md:border-4 border-black px-2 py-1 md:px-5 md:py-2.5 font-bold text-xs md:text-base uppercase transition-all active:scale-95 ${
                selectedModel === opt.id
                  ? 'bg-pina-pink text-white shadow-sm md:shadow-brutal-sm'
                  : 'bg-stone-200 text-black shadow-sm md:shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onStart()
          }}
          className="w-full bg-pina-pink text-white border-2 md:border-4 border-black py-2 md:py-5 text-base md:text-2xl font-black shadow-brutal-sm md:shadow-brutal-lg active:translate-y-2 active:shadow-none transition-all hover:bg-pink-600"
        >
          START GAME
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
