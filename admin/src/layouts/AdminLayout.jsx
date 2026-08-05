import { useMutation, useQuery } from '@tanstack/react-query'
import { Languages, LogOut, Menu, Moon, ShieldCheck, Sun, UsersRound, X } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useUi } from '../contexts/UiContext.jsx'
import { getCurrentUser, logout } from '../services/authService.js'

// هذه الدالة تعيد أول حرف من اسم الأدمن ليظهر كصورة رمزية بسيطة دون حفظ صورة شخصية.
function getInitial(name) {
  return name?.trim().charAt(0).toUpperCase() || 'A'
}

// هذا المكوّن هو الغلاف المشترك: Navbar وSidebar وFooter لكل صفحة إدارية محمية.
export function AdminLayout() {
  const { t, i18n } = useTranslation()
  const { theme, toggleLanguage, toggleTheme } = useUi()
  const navigate = useNavigate()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { data: admin } = useQuery({ queryKey: ['current-user'], queryFn: getCurrentUser })
  const logoutMutation = useMutation({ mutationFn: logout })

  // نغلق جلسة الأدمن على السيرفر قبل العودة لصفحة الدخول.
  async function handleLogout() {
    try {
      await logoutMutation.mutateAsync()
      navigate('/login', { replace: true })
    } catch (_error) {
      // لا نغادر الصفحة إذا فشل مسح Cookie الجلسة.
    }
  }

  // هذا الرابط يُغلق القائمة تلقائياً على الهاتف بعد اختيار الصفحة.
  function closeSidebar() {
    setIsSidebarOpen(false)
  }

  return (
    <div className="flex min-h-screen bg-admin-bg">
      {isSidebarOpen && <button type="button" aria-label={t('layout.closeMenu')} onClick={closeSidebar} className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden" />}
      <aside
  className={`admin-sidebar fixed inset-y-0 start-0 z-40 flex w-72 flex-col border-e border-admin-border bg-admin-surface transition-transform duration-200 lg:static ${
    isSidebarOpen ? 'admin-sidebar--open' : ''
  }`}
>
        <div className="flex h-18 items-center justify-between border-b border-admin-border px-5">
          <div className="flex items-center gap-3 font-bold text-admin-text"><span className="grid size-9 place-items-center rounded-xl bg-linear-to-br from-admin-brand to-admin-brand-strong text-white"><ShieldCheck size={20} aria-hidden="true" /></span><span>{t('brand')}</span></div>
          <button type="button" onClick={closeSidebar} className="grid size-9 place-items-center rounded-lg text-admin-muted lg:hidden" aria-label={t('layout.closeMenu')}><X size={20} aria-hidden="true" /></button>
        </div>
        <nav className="flex-1 p-4" aria-label={t('layout.navigation')}>
          <p className="px-3 pb-2 text-xs font-bold uppercase tracking-wider text-admin-muted">{t('layout.navigation')}</p>
          <NavLink to="/users/security" onClick={closeSidebar} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition ${isActive ? 'bg-admin-brand text-white' : 'text-admin-muted hover:bg-admin-bg hover:text-admin-text'}`}><UsersRound size={18} aria-hidden="true" />{t('layout.security')}</NavLink>
        </nav>
        <div className="border-t border-admin-border p-4">
          <button type="button" onClick={handleLogout} disabled={logoutMutation.isPending} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-admin-muted transition hover:bg-admin-bg hover:text-admin-text disabled:opacity-60"><LogOut size={18} aria-hidden="true" />{t('layout.signOut')}</button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-18 items-center justify-between border-b border-admin-border bg-admin-surface px-4 sm:px-7">
          <button type="button" onClick={() => setIsSidebarOpen(true)} className="grid size-10 place-items-center rounded-lg text-admin-muted hover:bg-admin-bg lg:hidden" aria-label={t('layout.menu')}><Menu size={21} aria-hidden="true" /></button>
          <div className="hidden items-center gap-2 text-sm font-bold text-admin-text sm:flex lg:hidden"><ShieldCheck size={19} className="text-admin-brand" aria-hidden="true" />{t('brand')}</div>
          <div className="ms-auto flex items-center gap-1 sm:gap-2">
            <button type="button" onClick={toggleLanguage} className="grid size-10 place-items-center rounded-lg text-admin-muted transition hover:bg-admin-bg hover:text-admin-text" aria-label={t('actions.changeLanguage')} title={t('actions.changeLanguage')}><Languages size={19} aria-hidden="true" /><span className="sr-only">{i18n.language === 'ar' ? 'English' : 'العربية'}</span></button>
            <button type="button" onClick={toggleTheme} className="grid size-10 place-items-center rounded-lg text-admin-muted transition hover:bg-admin-bg hover:text-admin-text" aria-label={t('actions.changeTheme')} title={t('actions.changeTheme')}>{theme === 'dark' ? <Sun size={19} aria-hidden="true" /> : <Moon size={19} aria-hidden="true" />}</button>
            <div className="ms-1 flex min-w-0 items-center gap-2 border-s border-admin-border ps-2 sm:gap-3 sm:ps-3"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-admin-brand text-sm font-bold text-white">{getInitial(admin?.name)}</span><div className="hidden min-w-0 sm:block"><p className="truncate text-sm font-bold text-admin-text">{admin?.name}</p><p className="truncate text-xs text-admin-muted">{admin?.email}</p></div></div>
          </div>
        </header>
        <div className="flex-1"><Outlet /></div>
        <footer className="border-t border-admin-border bg-admin-surface px-5 py-4 text-center text-xs text-admin-muted sm:px-8">© {new Date().getFullYear()} {t('layout.footer')}</footer>
      </div>
    </div>
  )
}
