import { cn } from '../../../utils/cn'

interface CategoryBadgeProps {
  category: string
  className?: string
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  return (
    <span
      className={cn(
        'inline-block rounded-lg border-2 border-black bg-white px-2 py-1 text-xs font-bold uppercase text-black',
        className
      )}
    >
      {category}
    </span>
  )
}
