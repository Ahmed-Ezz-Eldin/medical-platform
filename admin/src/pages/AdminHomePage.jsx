import { useMutation } from '@tanstack/react-query'
import { LogOut } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { AdminTopBar } from '../components/AdminTopBar.jsx'
import { logout } from '../services/authService.js'

// هذه صفحة مؤقتة ومحميّة تؤكد نجاح دخول الأدمن؛ ستُستبدل تدريجياً بصفحات الإدارة الفعلية.
export function AdminHomePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const logoutMutation = useMutation({ mutationFn: logout })

  // نسجل الخروج ثم نعيد المستخدم إلى صفحة الدخول كي لا تبقى الجلسة صالحة على الجهاز.
  async function handleLogout() {
    await logoutMutation.mutateAsync()
    navigate('/login', { replace: true })
  }

  return (
    <main className="min-h-screen bg-admin-bg">
      <AdminTopBar />
      <section className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
        <div className="rounded-2xl border border-admin-border bg-admin-surface p-8">
          <h1 className="text-2xl font-bold text-admin-text">{t('home.title')}</h1>
          <p className="mt-2 text-admin-muted">{t('home.subtitle')}</p>
          <button type="button" onClick={handleLogout} disabled={logoutMutation.isPending} className="mt-8 inline-flex items-center gap-2 rounded-xl border border-admin-border px-4 py-2 text-sm font-semibold text-admin-text transition hover:bg-admin-bg disabled:opacity-60">
            <LogOut size={16} aria-hidden="true" />
            {t('home.signOut')}
          </button>
        </div>
      </section>
    </main>
  )
}
