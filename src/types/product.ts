export interface Product {
  id: string
  name: string
  subtitle: string
  category: string
  price: number
  color: string
  bgColor: string
  image: string
  description: string
  purchaseUrl: string
  /** 3Dモデル（STL）のURL。指定時はモーダルで360°ビューを表示 */
  modelUrl?: string
}
