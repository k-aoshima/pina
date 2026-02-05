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
      className="box-border w-screen overflow-x-clip pl-3 pr-6 py-8 sm:pl-4 sm:pr-6 sm:py-12 md:px-6 md:py-16"
    >
      <div className="mx-auto box-border w-full max-w-6xl rounded-xl border-2 border-black bg-white p-4 shadow-brutal sm:rounded-2xl sm:border-4 sm:p-10 sm:shadow-brutal md:rounded-3xl md:border-8 md:p-14 md:shadow-brutal-lg">
        <h2 className="break-words font-black uppercase text-3xl text-black border-b-2 border-black pb-3 sm:text-4xl sm:border-b-4 sm:pb-4 md:border-b-8 md:text-6xl">
          DIGITAL ARCHIVES
        </h2>

        {loading ? (
          <div className="flex justify-center py-16">
            <p className="font-bold text-gray-500">読み込み中...</p>
          </div>
        ) : (
          <div className="mt-6 box-border w-full sm:mt-8">
            <ProductGrid products={products} />
          </div>
        )}
      </div>
    </section>
  )
}
