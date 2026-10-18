import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/shared/styles/index.css'
import { App } from '@/app/App'
import { BRAND } from '@/shared/config/brand'

// The brand picks its colours in index.css
document.documentElement.dataset.brand = BRAND.id

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
