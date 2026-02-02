import { useState, useEffect } from 'react'
import type { Product } from '../../../types'
import { getProducts } from '../api/getProducts'
import { ProductGrid } from './ProductGrid'

export function DigitalArchives() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProducts().then((data) => {
      setProducts(data)
      setLoading(false)
    })
  }, [])

  return (
    <section
      id="digital-archives"
      className="mx-auto max-w-6xl px-4 py-12 md:py-16"
    >
      <div className="rounded-2xl md:rounded-3xl border-4 md:border-8 border-black bg-white p-4 sm:p-8 shadow-brutal-lg md:p-12">
        <h2 className="font-black uppercase text-4xl sm:text-5xl md:text-6xl text-black border-b-4 md:border-b-8 border-black pb-4">
          DIGITAL ARCHIVES
        </h2>

        {loading ? (
          <div className="flex justify-center py-16">
            <p className="font-bold text-gray-500">読み込み中...</p>
          </div>
        ) : (
          <div className="mt-8">
            <ProductGrid products={products} />
          </div>
        )}
      </div>
    </section>
  )
}
