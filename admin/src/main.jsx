import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.jsx'
import './i18n.js'
import { UiProvider } from './contexts/UiContext.jsx'

// ننشئ مخزناً واحداً للطلبات حتى لا نكرر طلب بيانات الجلسة أثناء التنقل.
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, staleTime: 60 * 1000 } },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <UiProvider>
        <App />
      </UiProvider>
    </QueryClientProvider>
  </StrictMode>,
)
