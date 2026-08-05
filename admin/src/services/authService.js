import { api } from '../lib/api.js'

// هذه الدالة ترسل بيانات الدخول إلى السيرفر وتعيد بيانات المستخدم الآمنة فقط.
export async function login(credentials) {
  const response = await api.post('/auth/login', credentials)
  return response.data
}

// هذه الدالة تتحقق من الجلسة المخزنة في Cookie عند فتح أو تحديث لوحة الأدمن.
export async function getCurrentUser() {
  const response = await api.get('/auth/me')
  return response.data.user
}

// هذه الدالة تمسح Cookie الجلسة عند منع حساب مستخدم عادي من دخول لوحة الإدارة.
export async function logout() {
  await api.post('/auth/logout')
}
