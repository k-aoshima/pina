import { Link } from 'react-router-dom'
import { useGameStore } from '../stores/useGameStore'
import { ROUTES } from '../../../app/routes'
import { useGameEngine } from '../hooks/useGameEngine'
import { useRotateModal } from '../hooks/useRotateModal'
import { useScrollHint } from '../hooks/useScrollHint'
import { RotateModal } from './RotateModal'
import { LoadingOverlay } from './LoadingOverlay'
import { ReadyModal } from './ReadyModal'
import { GameOverModal } from './GameOverModal'

export function GamePage() {
  const { mountRef, startGame, jump } = useGameEngine()
  const showRotateModal = useRotateModal()

  const status = useGameStore((s) => s.status)
  const score = useGameStore((s) => s.score)
  const highScore = useGameStore((s) => s.highScore)
  const selectedModel = useGameStore((s) => s.selectedModel)
  const setSelectedModel = useGameStore((s) => s.setSelectedModel)
  const restartStore = useGameStore((s) => s.restart)

  const isLoading = status === 'loading'
  const isReady = status === 'ready'
  const isGameOver = status === 'gameover'
  const isPlaying = status === 'playing'

  const { scrollContainerRef, showScrollHint, handleModalScroll } = useScrollHint(
    isReady || isGameOver,
  )

  return (
    <div className="w-full h-screen bg-pina-yellow font-sans overflow-hidden select-none relative">
      <RotateModal show={showRotateModal} />

      {/* Three.js キャンバスマウント */}
      <div
        ref={mountRef}
        className="w-full h-full absolute inset-0"
        onClick={() => {
          if (isPlaying) jump()
        }}
        style={{ cursor: isPlaying ? 'pointer' : 'default' }}
      />

      {/* HOME リンク */}
      <div className="absolute top-1 left-1 md:top-4 md:left-4 z-50 pointer-events-auto">
        <Link
          to={ROUTES.HOME}
          className="inline-block bg-pina-navy text-pina-yellow px-2 py-1 md:px-6 md:py-3 border-2 md:border-4 border-black font-black italic text-xs md:text-xl shadow-brutal-sm md:shadow-brutal hover:translate-x-0.5 hover:translate-y-0.5 transition-all active:scale-95"
        >
          ← HOME
        </Link>
      </div>

      {/* スコア表示 */}
      <div className="absolute top-2 right-2 md:top-4 md:right-4 left-auto flex justify-end pointer-events-none z-10">
        <div className="bg-white/95 border-2 md:border-4 border-black px-2 py-1 md:px-4 md:py-2 shadow-brutal-sm md:shadow-brutal flex items-center gap-1.5 md:gap-4">
          <div className="flex flex-col items-center min-w-0">
            <span className="text-[6px] md:text-[10px] font-black uppercase opacity-40">Score</span>
            <span className="font-black text-sm md:text-2xl leading-none truncate">{score}</span>
          </div>
          <div className="w-px h-4 md:h-8 bg-black opacity-10 shrink-0" />
          <div className="flex flex-col items-center min-w-0">
            <span className="text-[6px] md:text-[10px] font-black uppercase opacity-40">High</span>
            <span className="font-black text-sm md:text-2xl leading-none text-orange-500 truncate">
              {highScore}
            </span>
          </div>
        </div>
      </div>

      <LoadingOverlay show={isLoading} />

      {/* 非プレイ中のぼかし背景 */}
      {!isPlaying && !isLoading && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-yellow-400/40 backdrop-blur-md z-50 p-6 pointer-events-none"
          aria-hidden
        />
      )}

      <ReadyModal
        show={isReady}
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
        onStart={startGame}
        showScrollHint={showScrollHint}
        scrollContainerRef={scrollContainerRef}
        onScroll={handleModalScroll}
      />

      <GameOverModal
        show={isGameOver}
        score={score}
        onRetry={restartStore}
        showScrollHint={showScrollHint}
        scrollContainerRef={scrollContainerRef}
        onScroll={handleModalScroll}
      />

      {/* ブランドラベル */}
      <div className="absolute bottom-2 left-2 md:bottom-10 md:left-10 pointer-events-none hidden sm:block">
        <div className="bg-pina-navy text-pina-yellow px-2 py-1 md:px-8 md:py-3 border-2 md:border-4 border-black font-black italic text-xs md:text-2xl shadow-brutal-sm md:shadow-brutal">
          PINATOY'S
        </div>
      </div>
    </div>
  )
}
