import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { languageStorageKey } from '../i18n.js'

const UiContext = createContext(null)
const themeStorageKey = 'medical-platform.admin-theme'

// هذه الدالة تختار آخر ثيم حفظه المستخدم، أو تفضيل نظام التشغيل عند أول زيارة.
function getInitialTheme() {
  const savedTheme = window.localStorage.getItem(themeStorageKey)
  if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// هذا الـ provider يوحّد اللغة والثيم لكل صفحات الأدمن ويمنع اختلافهما بعد التنقل.
export function UiProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme)
  const { i18n } = useTranslation()

  // نطبق الثيم على html ونحفظ الاختيار مرة واحدة عند تغيّره.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    window.localStorage.setItem(themeStorageKey, theme)
  }, [theme])

  // نضبط اتجاه الصفحة وخاصية اللغة حتى تعمل العربية والإنجليزية بشكل سليم.
  useEffect(() => {
    const language = i18n.language === 'en' ? 'en' : 'ar'
    document.documentElement.lang = language
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
  }, [i18n.language])

  // useMemo يحافظ على مرجع ثابت للقيم بين عمليات إعادة الرسم غير اللازمة.
  const value = useMemo(() => ({
    theme,
    toggleTheme: () => setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark')),
    toggleLanguage: () => {
      const language = i18n.language === 'en' ? 'ar' : 'en'
      window.localStorage.setItem(languageStorageKey, language)
      return i18n.changeLanguage(language)
    },
  }), [i18n, theme])

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>
}

// هذه الدالة تمنح أي مكوّن الوصول للغة والثيم دون تمرير props بين الصفحات.
export function useUi() {
  const context = useContext(UiContext)
  if (!context) throw new Error('useUi must be used inside UiProvider')
  return context
}
