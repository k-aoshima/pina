import { useProductStore } from '../stores/useProductStore'

/**
 * 商品ごとに選択された360°ビューカラーを返す。
 * 未選択の場合は defaultColor をフォールバックとして使用。
 */
export function useProductViewColor(productId: string, defaultColor: string): string {
  return useProductStore(
    (s) => s.selectedViewColorByProductId[productId] ?? defaultColor
  )
}
