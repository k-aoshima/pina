import { type HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white border-4 md:border-6 border-black rounded-3xl shadow-brutal',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
