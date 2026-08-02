import axios from 'axios'

import { getDeviceId } from '../lib/device'

// هذا الكائن هو نقطة الاتصال الموحدة بين واجهة المستخدم والـ API.
const api = axios.create({
  // نستخدم رابطًا محليًا افتراضيًا، ويمكن تغييره لاحقًا من VITE_API_URL.
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  // هذا الخيار يرسل Cookie الجلسة الآمنة مع كل طلب مسموح به.
  withCredentials: true,
})

// هذا interceptor يضيف معرف المتصفح تلقائيًا لكل طلب، ومنه طلب Login.
api.interceptors.request.use((config) => {
  // نضع المعرف في Header منفصل عن كلمة المرور أو بيانات المستخدم.
  config.headers['X-Device-Id'] = getDeviceId()

  return config
})

// نصدر الكائن الجاهز لاستعماله لاحقًا في شاشات التسجيل والدخول والكورسات.
export default api
