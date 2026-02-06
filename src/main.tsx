import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AppProvider } from './app/provider'
import { App } from './app/App'
import './index.css'

const basename = import.meta.env.MODE === 'production' ? '/pina' : ''

createRoot(document.getElementById('root')!).render(
  <BrowserRouter basename={basename}>
    <AppProvider>
      <App />
    </AppProvider>
  </BrowserRouter>
)
