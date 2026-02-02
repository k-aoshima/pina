import { useState, useEffect } from 'react'
import { useProductStore } from '../stores/useProductStore'
import { formatPrice } from '../../../utils/format'
import { modelAssetUrl } from '../../../config/constants'
import { Modal } from '../../../components/ui/Modal'
import { Button } from '../../../components/ui/Button'
import { ModelView360 } from '../../../components/three/ModelView360'

const VIEW_COLORS = [
  { name: 'バイオレット', hex: '#8B5CF6' },
  { name: 'エメラルド', hex: '#10B981' },
  { name: 'コーラル', hex: '#F97316' },
  { name: 'ピンク', hex: '#EC4899' },
  { name: 'スカイ', hex: '#06B6D4' },
] as const

export function ProductModal() {
  const selectedProduct = useProductStore((s) => s.selectedProduct)
  const isModalOpen = useProductStore((s) => s.isModalOpen)
  const closeModal = useProductStore((s) => s.closeModal)
  const clearProduct = useProductStore((s) => s.clearProduct)
  const selectedViewColorByProductId = useProductStore((s) => s.selectedViewColorByProductId)
  const setSelectedViewColor = useProductStore((s) => s.setSelectedViewColor)
  const [viewColor, setViewColor] = useState<string>(VIEW_COLORS[0].hex)

  useEffect(() => {
    if (selectedProduct?.modelUrl) {
      const stored = selectedProduct?.id && selectedViewColorByProductId[selectedProduct.id]
      setViewColor(stored ?? selectedProduct.color)
    }
  }, [selectedProduct?.id, selectedProduct?.color, selectedProduct?.modelUrl, selectedViewColorByProductId])

  const handleClose = () => {
    closeModal()
    setTimeout(clearProduct, 300)
  }

  if (!selectedProduct) return null

  return (
    <Modal
      isOpen={isModalOpen}
      onClose={handleClose}
      title={selectedProduct.name}
    >
      <div className="flex flex-col gap-6">
        {selectedProduct.modelUrl ? (
          <div className="rounded-2xl border-4 border-black overflow-hidden">
            <ModelView360
              modelUrl={modelAssetUrl(selectedProduct.modelUrl)}
              color={viewColor}
              offsetY={selectedProduct.modelUrl.toLowerCase().includes('fanfan') ? -0.25 : undefined}
            />
            <div className="flex flex-wrap items-center justify-center gap-2 border-t-4 border-black bg-gray-50 px-3 py-3">
              <span className="mr-1 text-xs font-bold text-gray-600">カラー:</span>
              {VIEW_COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  title={c.name}
                  onClick={() => {
                    setViewColor(c.hex)
                    setSelectedViewColor(selectedProduct.id, c.hex)
                  }}
                  className="h-8 w-8 shrink-0 rounded-full border-2 border-black shadow-brutal-sm transition-transform hover:scale-110 active:scale-95"
                  style={{ backgroundColor: c.hex }}
                  aria-label={c.name}
                />
              ))}
            </div>
            <p className="text-center text-xs text-gray-500 py-1 bg-gray-50 border-t border-black">
              ドラッグで回転・スクロールでズーム
            </p>
          </div>
        ) : (
          <div
            className={`flex aspect-video w-full items-center justify-center rounded-2xl border-4 border-black ${selectedProduct.bgColor}`}
          >
            <span className="font-black uppercase text-white text-2xl text-center px-4">
              {selectedProduct.name}
            </span>
          </div>
        )}

        <div>
          <h2 className="font-black uppercase text-3xl text-black">
            {selectedProduct.name}
          </h2>
          <p className="mt-1 text-gray-400">{selectedProduct.subtitle}</p>
          <p className="mt-2 font-black text-2xl text-black">
            {formatPrice(selectedProduct.price)}
          </p>
          <p className="mt-4 text-gray-600">{selectedProduct.description}</p>
        </div>

        <a
          href={selectedProduct.purchaseUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full justify-center"
        >
          <Button variant="default" size="lg" className="w-full">
            この商品を購入する
          </Button>
        </a>
      </div>
    </Modal>
  )
}
