import { RouterProvider } from 'react-router-dom'
import { router } from './router.jsx'

// هذا المكوّن يربط التطبيق فقط بالـ router؛ الصفحات تبقى في ملفات مستقلة.
function App() {
  return <RouterProvider router={router} />
}

export default App
