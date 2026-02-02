import { create } from 'zustand'
import type { Product } from '../../../types'

interface ProductState {
  selectedProduct: Product | null
  isModalOpen: boolean
  /** 商品ごとに360°ビューで選択した色（カードプレビューにも反映） */
  selectedViewColorByProductId: Record<string, string>
  openModal: (product: Product) => void
  closeModal: () => void
  clearProduct: () => void
  setSelectedViewColor: (productId: string, color: string) => void
}

export const useProductStore = create<ProductState>()((set) => ({
  selectedProduct: null,
  isModalOpen: false,
  selectedViewColorByProductId: {},

  openModal: (product) =>
    set({
      selectedProduct: product,
      isModalOpen: true,
    }),

  closeModal: () =>
    set({
      isModalOpen: false,
    }),

  clearProduct: () =>
    set({
      selectedProduct: null,
    }),

  setSelectedViewColor: (productId, color) =>
    set((state) => ({
      selectedViewColorByProductId: {
        ...state.selectedViewColorByProductId,
        [productId]: color,
      },
    })),
}))
