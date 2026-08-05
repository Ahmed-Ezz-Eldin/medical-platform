import axios from 'axios'

// هذا العميل يرسل Cookie الجلسة تلقائياً، ولا نضع التوكن في localStorage لأسباب أمنية.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true,
})
