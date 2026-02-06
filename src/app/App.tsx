import { Routes, Route, useLocation } from 'react-router-dom'
import { MainLayout } from '../components/layouts/MainLayout'
import { ParallaxHero } from '../features/hero/components/ParallaxHero'
import { DigitalArchives } from '../features/products/components/DigitalArchives'
import { ProductModal } from '../features/products/components/ProductModal'
import { GamePage } from '../features/game/components/GamePage'
import { ROUTES } from './routes'
import { useEffect } from 'react'

export function App() {
  const location = useLocation()
  
  useEffect(() => {
    console.log('🔍 Current route:', location.pathname)
    console.log('🔍 ROUTES.GAME:', ROUTES.GAME)
  }, [location])

  return (
    <Routes>
      <Route
        path={ROUTES.HOME}
        element={
          <MainLayout>
            <ParallaxHero />
            <DigitalArchives />
            <ProductModal />
          </MainLayout>
        }
      />
      <Route path={ROUTES.GAME} element={<GamePage />} />
      <Route path="*" element={<div style={{padding: '20px', fontSize: '24px'}}>
        <h1>404 - Route not found</h1>
        <p>Current path: {location.pathname}</p>
        <p>Available routes:</p>
        <ul>
          <li>HOME: {ROUTES.HOME}</li>
          <li>GAME: {ROUTES.GAME}</li>
        </ul>
      </div>} />
    </Routes>
  )
}
