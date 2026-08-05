import { api } from '../lib/api.js'

// هذه الدالة تجلب صفحة واحدة فقط من المستخدمين حسب الفلتر لتبقى الاستجابة سريعة.
export async function listAdminUsers({ status, page }) {
  const response = await api.get('/admin/users', { params: { ...(status && { status }), page, limit: 20 } })
  return response.data
}

// هذه الدالة تطلب من السيرفر حذف الجهاز الموثوق وفك الحظر للحساب المحدد.
export async function resetTrustedDevice(userId) {
  await api.patch(`/admin/users/${userId}/trusted-device/reset`)
}
