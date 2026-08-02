import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import './i18n'
import { UiProvider } from './context/UiContext'
import { router } from './router'

// هذا الكائن يدير حالة طلبات React Query مثل التحميل والأخطاء وإعادة المحاولة.
const queryClient = new QueryClient({
  defaultOptions: {
    // لا نعيد محاولة تسجيل الدخول تلقائيًا حتى لا نزيد محاولات كلمة المرور.
    mutations: { retry: false },
  },
})

// نغلف التطبيق بمزود React Query حتى تستخدمه صفحات الحساب.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <UiProvider>
        <RouterProvider router={router} />
      </UiProvider>
    </QueryClientProvider>
  </StrictMode>,
)
