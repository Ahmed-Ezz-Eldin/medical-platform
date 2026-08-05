import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// هذا المفتاح يضمن بقاء اللغة المختارة بعد تحديث الصفحة.
export const languageStorageKey = 'medical-platform.admin-language'

// نحتفظ بنصوص صفحة الدخول في ملف واحد ليسهل استكمال اللغات والصفحات لاحقاً.
const resources = {
  ar: {
    translation: {
      brand: 'MediLearn Admin',
      login: { title: 'تسجيل دخول الإدارة', subtitle: 'أدخل بيانات حساب الإدارة للمتابعة.', email: 'البريد الإلكتروني', password: 'كلمة المرور', submit: 'تسجيل الدخول', loading: 'جارٍ التحقق...', invalidEmail: 'أدخل بريداً إلكترونياً صحيحاً.', passwordLength: 'كلمة المرور يجب أن تكون 10 أحرف على الأقل.', failed: 'تعذر تسجيل الدخول. راجع البيانات وحاول مرة أخرى.', adminOnly: 'هذا الحساب لا يملك صلاحية الدخول إلى لوحة الإدارة.' },
      home: { title: 'مرحباً في لوحة الإدارة', subtitle: 'سنبدأ في الصفحة التالية بإدارة حسابات المستخدمين وأجهزتهم.', signOut: 'تسجيل الخروج' },
      actions: { changeLanguage: 'تغيير اللغة', changeTheme: 'تغيير المظهر' },
      loading: 'جارٍ التحميل...',
    },
  },
  en: {
    translation: {
      brand: 'MediLearn Admin',
      login: { title: 'Admin sign in', subtitle: 'Enter your admin account details to continue.', email: 'Email address', password: 'Password', submit: 'Sign in', loading: 'Checking...', invalidEmail: 'Enter a valid email address.', passwordLength: 'Password must be at least 10 characters.', failed: 'We could not sign you in. Check your details and try again.', adminOnly: 'This account is not allowed to access the admin dashboard.' },
      home: { title: 'Welcome to the admin dashboard', subtitle: 'The next page will manage user accounts and trusted devices.', signOut: 'Sign out' },
      actions: { changeLanguage: 'Change language', changeTheme: 'Change theme' },
      loading: 'Loading...',
    },
  },
}

// نبدأ باللغة المحفوظة، والعربية هي القيمة الافتراضية للمنصة.
i18n.use(initReactI18next).init({
  resources,
  lng: window.localStorage.getItem(languageStorageKey) === 'en' ? 'en' : 'ar',
  fallbackLng: 'ar',
  interpolation: { escapeValue: false },
})

// هذه النصوص تخص صفحة أمان المستخدمين، وتبقى منفصلة عن صفحة الدخول لتسهيل توسعة اللوحة.
i18n.addResourceBundle('ar', 'translation', {
  usersSecurity: { title: 'أمان المستخدمين', subtitle: 'مراجعة حالة الحسابات والأجهزة الموثوقة.', all: 'الكل', active: 'نشط', blocked: 'محظور', users: 'المستخدمون', device: 'الجهاز الموثوق', createdAt: 'تاريخ الإنشاء', reset: 'إعادة ضبط الجهاز', resetting: 'جارٍ إعادة الضبط...', noDevice: 'لا يوجد جهاز مرتبط', deviceLinked: 'مرتبط', empty: 'لا توجد حسابات بهذه الحالة.', failed: 'تعذر تحميل المستخدمين. حاول مرة أخرى.', resetFailed: 'تعذر إعادة ضبط الجهاز. حاول مرة أخرى.', confirmReset: 'هل تريد إزالة الجهاز وفك حظر حساب {{name}}؟ سيتمكن من الدخول من جهاز جديد.', previous: 'السابق', next: 'التالي', page: 'صفحة {{page}} من {{total}}', signOut: 'تسجيل الخروج' },
}, true, true)
i18n.addResourceBundle('en', 'translation', {
  usersSecurity: { title: 'User security', subtitle: 'Review account states and trusted devices.', all: 'All', active: 'Active', blocked: 'Blocked', users: 'Users', device: 'Trusted device', createdAt: 'Created', reset: 'Reset device', resetting: 'Resetting...', noDevice: 'No device linked', deviceLinked: 'Linked', empty: 'No accounts match this status.', failed: 'We could not load users. Try again.', resetFailed: 'We could not reset the device. Try again.', confirmReset: 'Remove the device and unblock {{name}}? They will be able to sign in from a new device.', previous: 'Previous', next: 'Next', page: 'Page {{page}} of {{total}}', signOut: 'Sign out' },
}, true, true)

// هذه النصوص تخص هيكل لوحة الأدمن المشترك بين كل صفحات الإدارة.
i18n.addResourceBundle('ar', 'translation', {
  layout: { security: 'أمان المستخدمين', navigation: 'التنقل', menu: 'فتح القائمة', closeMenu: 'إغلاق القائمة', signOut: 'تسجيل الخروج', footer: 'منصة MediLearn التعليمية' },
}, true, true)
i18n.addResourceBundle('en', 'translation', {
  layout: { security: 'User security', navigation: 'Navigation', menu: 'Open menu', closeMenu: 'Close menu', signOut: 'Sign out', footer: 'MediLearn learning platform' },
}, true, true)

export default i18n
