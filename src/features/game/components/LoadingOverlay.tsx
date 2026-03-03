interface LoadingOverlayProps {
  show: boolean
}

export function LoadingOverlay({ show }: LoadingOverlayProps) {
  if (!show) return null

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-yellow-400/60 backdrop-blur-md z-50 p-4 md:p-6">
      <div className="bg-white border-4 md:border-8 border-black p-6 md:p-12 shadow-brutal-sm md:shadow-brutal-lg text-center">
        <div className="mb-4 md:mb-6 inline-block bg-pina-navy text-pina-yellow px-3 py-1 md:px-6 md:py-2 text-xs md:text-sm font-black tracking-widest uppercase">
          LOADING...
        </div>
        <div className="flex gap-1.5 md:gap-2 justify-center">
          <div className="w-3 h-3 md:w-4 md:h-4 bg-pina-pink rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-3 h-3 md:w-4 md:h-4 bg-pina-pink rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-3 h-3 md:w-4 md:h-4 bg-pina-pink rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}
