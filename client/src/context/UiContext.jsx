import { createContext, useContext, useEffect, useState } from 'react'

// هذا Context يجعل اللغة والثيم متاحين لكل صفحة بدون تمرير props كثيرة.
const UiContext = createContext(null)

// هذه الدالة تقرأ الثيم المحفوظ أو تستخدم تفضيل الجهاز في أول زيارة.
function getInitialTheme() {
  const savedTheme = window.localStorage.getItem('medical-platform.theme')
  if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// هذا المزود يجمع حالة اللغة والثيم وأزرار تبديلهما في مكان واحد.
export function UiProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme)

  // هذا التأثير يطبق dark class ويحفظ اختيار المستخدم للمرة القادمة.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    window.localStorage.setItem('medical-platform.theme', theme)
  }, [theme])

  // هذه الدالة البسيطة تترك مكونات الواجهة بلا منطق ثيم متكرر.
  function toggleTheme() {
    setTheme((currentTheme) => (currentTheme === 'light' ? 'dark' : 'light'))
  }

  return <UiContext.Provider value={{ theme, toggleTheme }}>{children}</UiContext.Provider>
}

// هذا Hook يختصر قراءة Context ويتأكد من استخدامه داخل UiProvider.
export function useUi() {
  const context = useContext(UiContext)
  if (!context) throw new Error('useUi must be used inside UiProvider.')

  return context
}
