import { MainLayout } from '../components/layouts/MainLayout'
import { ParallaxHero } from '../features/hero/components/ParallaxHero'
import { DigitalArchives } from '../features/products/components/DigitalArchives'
import { ProductModal } from '../features/products/components/ProductModal'

export function App() {
  return (
    <MainLayout>
      <ParallaxHero />
      <DigitalArchives />
      <ProductModal />
    </MainLayout>
  )
}
