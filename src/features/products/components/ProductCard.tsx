import { Eye } from 'lucide-react'
import type { Product } from '../../../types'
import { useProductStore } from '../stores/useProductStore'
import { formatPrice } from '../../../utils/format'
import { CategoryBadge } from './CategoryBadge'
import { modelAssetUrl } from '../../../config/constants'
import { cn } from '../../../utils/cn'
import { ModelView360 } from '../../../components/three/ModelView360'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const openModal = useProductStore((s) => s.openModal)
  const selectedViewColorByProductId = useProductStore((s) => s.selectedViewColorByProductId)
  const previewColor = selectedViewColorByProductId[product.id] ?? product.color

  return (
    <article className="box-border flex w-full flex-col rounded-lg border-2 border-black bg-white shadow-brutal-sm sm:rounded-xl sm:border-4 sm:shadow-brutal-sm md:rounded-2xl md:border-6 md:shadow-brutal">
      <div className="flex flex-wrap items-center justify-between gap-2.5 border-b-2 border-black p-2.5 sm:border-b-4 sm:p-4">
        <CategoryBadge category={product.category} />
        <button
          type="button"
          onClick={() => openModal(product)}
          className="flex shrink-0 items-center gap-1.5 rounded-md border-2 border-black bg-blue-500 px-2 py-1.5 text-xs font-bold uppercase text-white shadow-brutal-sm transition-transform hover:scale-105 active:scale-95 sm:gap-2 sm:rounded-lg sm:border-4 sm:px-3 sm:py-2 sm:text-sm"
        >
          <Eye size={14} className="sm:hidden" />
          <Eye size={16} className="hidden sm:block" />
          360° VIEW
        </button>
      </div>

      <div className="aspect-square w-full p-2.5 sm:p-4 md:p-5">
        {product.modelUrl ? (
          <div className="h-full w-full overflow-hidden rounded-lg border-2 border-black bg-gray-100 sm:rounded-xl sm:border-4 md:rounded-2xl" style={{ touchAction: 'auto' }}>
            <ModelView360
              modelUrl={modelAssetUrl(product.modelUrl)}
              color={previewColor}
              interactive={false}
              offsetY={product.modelUrl.toLowerCase().includes('fanfan') ? -0.25 : undefined}
              className="!aspect-square h-full w-full"
            />
          </div>
        ) : (
          <div
            className={cn(
              'flex h-full w-full items-center justify-center rounded-lg border-2 border-black sm:rounded-xl sm:border-4 md:rounded-2xl',
              product.bgColor
            )}
          >
            <span className="font-black uppercase text-white/80 text-2xl text-center px-2">
              {product.name}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 border-t-2 border-black p-3 sm:border-t-4 sm:p-5">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-black uppercase text-lg text-black sm:text-xl md:text-2xl">
            {product.name}
          </h3>
          <span className="shrink-0 font-black text-lg text-black sm:text-xl md:text-2xl">
            {formatPrice(product.price)}
          </span>
        </div>
        <p className="text-xs text-gray-400 sm:text-sm">{product.subtitle}</p>
        <a
          href={product.purchaseUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex w-full justify-center rounded-lg border-2 border-black bg-pina-yellow px-3 py-2 text-sm font-bold uppercase text-black shadow-brutal-sm transition-transform hover:scale-105 active:scale-95 sm:mt-4 sm:rounded-xl sm:border-4 sm:px-4 sm:py-3 sm:text-base"
        >
          購入サイトへ
        </a>
      </div>
    </article>
  )
}
