import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import ar from './locales/ar.json'
import en from './locales/en.json'

// هذا المفتاح ثابت حتى تبقى آخر لغة اختارها المستخدم بعد Refresh.
const languageStorageKey = 'medical-platform.language'
// نقرأ اللغة المحفوظة، ونبدأ بالعربية عند أول زيارة فقط.
const savedLanguage = window.localStorage.getItem(languageStorageKey)

// هذه الموارد تجمع ترجمات كل لغة في ملفات مستقلة وسهلة التوسع.
const resources = {
  ar: { translation: ar },
  en: { translation: en },
}

// هذا الإعداد يربط i18next مع React ويجعل العربية اللغة الافتراضية.
i18n.use(initReactI18next).init({
  resources,
  lng: savedLanguage === 'en' ? 'en' : 'ar',
  fallbackLng: 'en',
  interpolation: {
    // React يتعامل مع حماية النصوص، لذلك لا نحتاج escape إضافي هنا.
    escapeValue: false,
  },
})

// نصدر نفس كائن i18n ليستعمله الـ Header في تبديل اللغة.
export default i18n
