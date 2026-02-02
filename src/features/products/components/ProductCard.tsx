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

  return (
    <article className="flex flex-col rounded-xl md:rounded-2xl border-4 md:border-6 border-black bg-white shadow-brutal overflow-hidden transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-brutal-sm active:scale-[0.99]">
      <div className="flex items-center justify-between gap-2 border-b-4 border-black p-3">
        <CategoryBadge category={product.category} />
        <button
          type="button"
          onClick={() => openModal(product)}
          className="flex items-center gap-2 rounded-lg border-4 border-black bg-blue-500 px-3 py-2 font-bold uppercase text-white shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all active:scale-95"
        >
          <Eye size={16} />
          360° VIEW
        </button>
      </div>

      <div className="relative aspect-square p-4">
        {product.modelUrl ? (
          <div className="h-full w-full overflow-hidden rounded-2xl border-4 border-black bg-gray-100">
            <ModelView360
              modelUrl={modelAssetUrl(product.modelUrl)}
              color={product.color}
              interactive={false}
              offsetY={product.modelUrl.toLowerCase().includes('fanfan') ? -0.25 : undefined}
              className="!aspect-square h-full w-full"
            />
          </div>
        ) : (
          <div
            className={cn(
              'flex h-full w-full items-center justify-center rounded-2xl border-4 border-black',
              product.bgColor
            )}
          >
            <span className="font-black uppercase text-white/80 text-2xl text-center px-2">
              {product.name}
            </span>
          </div>
        )}
        <div className="absolute bottom-6 right-6 rotate-[-5deg] rounded border-2 border-black bg-white px-3 py-2 shadow-brutal-sm">
          <span className="font-black text-xl text-black">
            {formatPrice(product.price)}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 border-t-4 border-black p-4">
        <h3 className="font-black uppercase text-2xl text-black">
          {product.name}
        </h3>
        <p className="text-sm text-gray-400">{product.subtitle}</p>
        <a
          href={product.purchaseUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex w-full justify-center rounded-xl border-4 border-black bg-pina-yellow px-4 py-3 font-bold uppercase text-black shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all active:scale-95"
        >
          購入サイトへ
        </a>
      </div>
    </article>
  )
}
