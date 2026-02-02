import { type ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../utils/cn'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  className?: string
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={cn(
          'bg-white border-8 border-black rounded-3xl shadow-brutal-lg max-h-[90vh] overflow-auto w-full max-w-2xl',
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end p-4 border-b-4 border-black">
          <button
            onClick={onClose}
            className="p-2 rounded-lg border-4 border-black bg-white hover:bg-gray-100 active:scale-95 transition-all"
            aria-label="閉じる"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
