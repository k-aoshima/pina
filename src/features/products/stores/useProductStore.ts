import { create } from 'zustand'
import type { Product } from '../../../types'

interface ProductState {
  selectedProduct: Product | null
  isModalOpen: boolean
  openModal: (product: Product) => void
  closeModal: () => void
  clearProduct: () => void
}

export const useProductStore = create<ProductState>()((set) => ({
  selectedProduct: null,
  isModalOpen: false,

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
}))
