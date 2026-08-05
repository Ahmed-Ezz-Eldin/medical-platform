import { useQuery } from '@tanstack/react-query'
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { AdminLayout } from './layouts/AdminLayout.jsx'
import { AdminLoginPage } from './pages/AdminLoginPage.jsx'
import { UsersSecurityPage } from './pages/UsersSecurityPage.jsx'
import { getCurrentUser } from './services/authService.js'

// هذا الحارس يسأل السيرفر عن Cookie الجلسة؛ لا يثق في أي دور محفوظ داخل المتصفح.
function RequireAdmin() {
  const { data: user, isLoading } = useQuery({ queryKey: ['current-user'], queryFn: getCurrentUser })
  if (isLoading) return <main className="grid min-h-screen place-items-center bg-admin-bg text-admin-muted">Loading...</main>
  if (user?.role !== 'admin') return <Navigate to="/login" replace />
  return <Outlet />
}

// جميع الصفحات الإدارية توضع داخل الحارس، بينما صفحة الدخول تظل عامة.
export const router = createBrowserRouter([
  { path: '/login', element: <AdminLoginPage /> },
  {
    element: <RequireAdmin />,
    children: [{
      element: <AdminLayout />,
      children: [{ index: true, element: <Navigate to="/users/security" replace /> }, { path: 'users/security', element: <UsersSecurityPage /> }],
    }],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
