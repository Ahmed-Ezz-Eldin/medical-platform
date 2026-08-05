import { Languages, Moon, ShieldCheck, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useUi } from '../contexts/UiContext.jsx'

// هذا الشريط يعرض هوية لوحة الأدمن وأدوات عامة مشتركة بين الصفحات.
export function AdminTopBar() {
  const { t, i18n } = useTranslation()
  const { theme, toggleLanguage, toggleTheme } = useUi()

  return (
    <header className="flex items-center justify-between border-b border-admin-border bg-admin-surface px-5 py-4 sm:px-8">
      <div className="flex items-center gap-3 font-bold text-admin-text">
        <span className="grid size-9 place-items-center rounded-xl bg-linear-to-br from-admin-brand to-admin-brand-strong text-white">
          <ShieldCheck size={20} aria-hidden="true" />
        </span>
        <span>{t('brand')}</span>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" onClick={toggleLanguage} className="grid size-10 place-items-center rounded-lg text-admin-muted transition hover:bg-admin-bg hover:text-admin-text" aria-label={t('actions.changeLanguage')} title={t('actions.changeLanguage')}>
          <Languages size={19} aria-hidden="true" />
          <span className="sr-only">{i18n.language === 'ar' ? 'English' : 'العربية'}</span>
        </button>
        <button type="button" onClick={toggleTheme} className="grid size-10 place-items-center rounded-lg text-admin-muted transition hover:bg-admin-bg hover:text-admin-text" aria-label={t('actions.changeTheme')} title={t('actions.changeTheme')}>
          {theme === 'dark' ? <Sun size={19} aria-hidden="true" /> : <Moon size={19} aria-hidden="true" />}
        </button>
      </div>
    </header>
  )
}
