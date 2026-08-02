import { useEffect } from 'react'
import { Languages, Moon, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, Outlet } from 'react-router-dom'

// هذه نسخة الشعار المخصصة لخلفية الوضع الفاتح.
import lightLogo from '../assets/lightLogo.jpg'
// هذه نسخة الشعار المخصصة لخلفية الوضع الداكن.
import darkLogo from '../assets/darkLogo.jpg'
import { useUi } from '../context/UiContext'

// هذا الـ Layout يحيط كل صفحات المستخدم بالـ Header المشترك.
function RootLayout() {
  const { theme, toggleTheme } = useUi()
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language.startsWith('ar')
  // نختار الشعار المناسب للون الخلفية الحالية تلقائيًا.
  const activeLogo = theme === 'dark' ? darkLogo : lightLogo

  // هذا التأثير يحدّث لغة واتجاه مستند HTML عند تبديل الترجمة.
  useEffect(() => {
    document.documentElement.lang = i18n.language
    document.documentElement.dir = isArabic ? 'rtl' : 'ltr'
  }, [i18n.language, isArabic])

  // هذه الدالة تغيّر اللغة بين العربية والإنجليزية عبر react-i18next.
  function toggleLanguage() {
    const nextLanguage = isArabic ? 'en' : 'ar'
    window.localStorage.setItem('medical-platform.language', nextLanguage)
    i18n.changeLanguage(nextLanguage)
  }

  return (
    <div className="flex min-h-screen flex-col bg-app-bg text-app-text transition-colors duration-300">
      
      {/* رأس الصفحة المشترك (Header) مع تصميم زجاجي سينمائي وتجاوب كامل */}
      <header className="sticky top-0 z-50 border-b border-app-border/80 bg-app-surface/80 backdrop-blur-xl transition-colors">
        <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
          
          {/* شعار المنصة */}
          <Link className="group flex items-center gap-3 font-black tracking-tight transition-transform active:scale-95" to="/login">
            <img className="h-10 w-auto rounded-xl shadow-md shadow-brand/20 transition-transform group-hover:scale-[1.02]" src={activeLogo} alt={t('brand')} />
          </Link>

          {/* أزرار التحكم (تبديل المظهر واللغة) مع تصميم تفاعلي متجاوب */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button 
              className="inline-flex size-10 items-center justify-center rounded-xl border border-app-border bg-app-surface/50 text-app-text shadow-sm transition-all hover:border-brand hover:bg-app-surface-muted hover:text-brand" 
              type="button" 
              onClick={toggleTheme}
              aria-label={t('header.toggleTheme')}
              title={t('header.toggleTheme')}
            >
              {theme === 'light' ? <Moon aria-hidden="true" size={20} /> : <Sun aria-hidden="true" size={20} />}
            </button>
            <button 
              className="inline-flex size-10 items-center justify-center rounded-xl border border-app-border bg-app-surface/50 text-app-text shadow-sm transition-all hover:border-brand hover:bg-app-surface-muted hover:text-brand" 
              type="button" 
              onClick={toggleLanguage}
              aria-label={t('header.toggleLanguage')}
              title={t('header.toggleLanguage')}
            >
              <Languages aria-hidden="true" size={20} />
            </button>
          </div>
        </nav>
      </header>

      {/* منطقة المحتوى الرئيسي */}
      <main className="flex flex-1 flex-col w-full">
        <Outlet />
      </main>

    </div>
  )
}

export default RootLayout
