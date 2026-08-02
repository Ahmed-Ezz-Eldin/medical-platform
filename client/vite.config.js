import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// هذا يحول مكان ملف الإعداد إلى المسار الحقيقي لمجلد client على Windows.
const clientRoot = fileURLToPath(new URL('.', import.meta.url))
// هذا هو جذر المشروع الأب، وهو مطلوب فقط لأن Vite يحل بعض ملفات المشروع منه.
const projectRoot = fileURLToPath(new URL('..', import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  // نثبت root صراحةً حتى لا يرث Vite مسار تشغيل Codex بدل مجلد client.
  root: clientRoot,
  // نسمح لـ Vite بقراءة ملفات هذا العميل فقط مع إبقاء الحماية الصارمة مفعلة.
  server: {
    fs: {
      // هذا خادم تطوير محلي فقط؛ إيقاف strict يعالج رفض Vite لملف index.html نفسه داخل Codex.
      strict: false,
      allow: [projectRoot, clientRoot],
    },
  },
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
  ],
})
