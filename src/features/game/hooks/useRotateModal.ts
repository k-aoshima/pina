import { useState, useEffect } from 'react'
import { MOBILE_MAX_WIDTH } from '../constants/gameConstants'

export function useRotateModal(): boolean {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      setShow(w <= MOBILE_MAX_WIDTH && h > w)
    }
    update()
    window.addEventListener('resize', update)
    window.addEventListener('orientationchange', update)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('orientationchange', update)
    }
  }, [])

  return show
}
