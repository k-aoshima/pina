import { useState, useRef, useEffect } from 'react'

export interface ScrollHintAPI {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>
  showScrollHint: boolean
  handleModalScroll: (e: React.UIEvent<HTMLDivElement>) => void
}

export function useScrollHint(isActive: boolean): ScrollHintAPI {
  const [showScrollHint, setShowScrollHint] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const resizeCheckRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const checkScrollHint = () => {
    const el = scrollContainerRef.current
    if (!el) return
    const needsScroll = el.scrollHeight > el.clientHeight + 2
    setShowScrollHint(needsScroll)
  }

  const handleModalScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    if (el.scrollTop > 15) setShowScrollHint(false)
  }

  useEffect(() => {
    if (!isActive) {
      setShowScrollHint(false)
      return
    }
    setShowScrollHint(true)
    // レイアウト・フォント確定後に判定（rAFだけだと早すぎる場合がある）
    const t1 = setTimeout(checkScrollHint, 50)
    const t2 = setTimeout(checkScrollHint, 250)
    const el = scrollContainerRef.current
    let ro: ResizeObserver | null = null
    if (el) {
      ro = new ResizeObserver(() => checkScrollHint())
      ro.observe(el)
    }
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      ro?.disconnect()
    }
  }, [isActive])

  // 画面回転・リサイズ時もスクロール案内を再判定
  useEffect(() => {
    if (!isActive) return
    const onResize = () => {
      if (resizeCheckRef.current) clearTimeout(resizeCheckRef.current)
      resizeCheckRef.current = setTimeout(checkScrollHint, 150)
    }
    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
      if (resizeCheckRef.current) clearTimeout(resizeCheckRef.current)
      resizeCheckRef.current = null
    }
  }, [isActive])

  return { scrollContainerRef, showScrollHint, handleModalScroll }
}
