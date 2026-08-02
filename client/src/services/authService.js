import api from './api'

// هذا الطلب ينشئ حسابًا ولا يسجّل دخوله؛ أول Login هو ما يربط الجهاز.
export function registerAccount(accountData) {
  return api.post('/auth/register', accountData)
}

// هذا الطلب يسجل الدخول، وapi.js يضيف X-Device-Id تلقائيًا للحماية.
export function loginAccount(credentials) {
  return api.post('/auth/login', credentials)
}

// هذا الطلب يعيد بيانات صاحب الجلسة عند فتح الصفحة مرة أخرى.
export function getCurrentAccount() {
  return api.get('/auth/me')
}

// هذا الطلب يطلب من السيرفر مسح Cookie الجلسة الحالية.
export function logoutAccount() {
  return api.post('/auth/logout')
}
