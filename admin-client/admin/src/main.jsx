import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { seedMockUsers } from '@/lib/mockAuth'
import { seedMockStore } from '@/lib/mockStore'
import './index.css'
import App from './App.jsx'

if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
  seedMockUsers()
  seedMockStore()
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
