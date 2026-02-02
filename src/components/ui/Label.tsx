import { type HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

interface LabelProps extends HTMLAttributes<HTMLSpanElement> {
  tilted?: boolean
}

export function Label({ children, className, tilted = false, ...props }: LabelProps) {
  return (
    <span
      className={cn(
        'inline-block font-bold uppercase text-white bg-pink-500 border-4 border-black px-6 py-2 rounded-lg',
        tilted && 'rotate-[-2deg]',
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
