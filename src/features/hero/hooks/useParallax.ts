import { useState, useEffect } from 'react'

interface ParallaxStyle {
  transform: string
  transition: string
}

export function useParallax(): {
  scrollY: number
  getParallaxStyle: (speed: number, rotation?: number) => ParallaxStyle
} {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const getParallaxStyle = (speed: number, rotation = 0): ParallaxStyle => ({
    transform: `translateY(${scrollY * speed}px) rotate(${scrollY * rotation}deg)`,
    transition: 'transform 0.1s ease-out',
  })

  return { scrollY, getParallaxStyle }
}
