import { type ButtonHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

type ButtonVariant = 'default' | 'pink' | 'navy' | 'blue' | 'white'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const variants: Record<ButtonVariant, string> = {
  default:
    'bg-pina-yellow border-4 shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none',
  pink: 'bg-pink-500 text-white border-4 shadow-brutal-sm hover:translate-x-1 hover:translate-y-1',
  navy: 'bg-pina-navy text-pina-yellow border-4 shadow-brutal-sm',
  blue: 'bg-blue-500 text-white border-4 shadow-brutal-sm hover:translate-x-1 hover:translate-y-1',
  white: 'bg-white border-4 shadow-brutal-sm hover:translate-x-1 hover:translate-y-1',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-3 text-base',
  lg: 'px-6 py-4 text-lg',
}

export function Button({
  children,
  className,
  variant = 'default',
  size = 'md',
  ...props
}: ButtonProps) {
  const base =
    'font-bold uppercase border-black rounded-lg active:scale-95 transition-all inline-flex items-center justify-center'
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  )
}
