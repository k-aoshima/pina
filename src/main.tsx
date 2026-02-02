import { createRoot } from 'react-dom/client'
import { AppProvider } from './app/provider'
import { App } from './app/App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <AppProvider>
    <App />
  </AppProvider>
)
