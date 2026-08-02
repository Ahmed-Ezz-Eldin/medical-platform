import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'

import RootLayout from './layouts/RootLayout'

// هذه الصفحة لا تُحمّل إلا عند زيارة Login أو Register لتحسين حجم التحميل الأولي.
const AuthPage = lazy(() => import('./pages/AuthPage'))

// هذا الغلاف يعرض حالة بسيطة بينما يحضر المتصفح صفحة الحساب المطلوبة.
function AuthRoute({ mode }) {
  return <Suspense fallback={<div className="grid w-full flex-1 place-items-center text-sm font-bold">Loading...</div>}><AuthPage mode={mode} /></Suspense>
}

// هذا التعريف يجمع المسارات والـ Layout في Router واحد قابل للتوسع.
export const router = createBrowserRouter([
  {
    // كل صفحات المستخدم تظهر داخل Header الـ RootLayout.
    element: <RootLayout />,
    children: [
      // الصفحة الرئيسية تقود للـ Login في النسخة الحالية.
      { index: true, element: <Navigate to="/login" replace /> },
      // صفحة تسجيل الدخول.
      { path: 'login', element: <AuthRoute mode="login" /> },
      // صفحة إنشاء الحساب.
      { path: 'register', element: <AuthRoute mode="register" /> },
      // أي رابط مجهول يعود إلى Login بدل صفحة فارغة.
      { path: '*', element: <Navigate to="/login" replace /> },
    ],
  },
])
