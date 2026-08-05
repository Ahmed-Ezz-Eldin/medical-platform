import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { LockKeyhole, Mail } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { AdminTopBar } from '../components/AdminTopBar.jsx'
import { login, logout } from '../services/authService.js'

// صفحة الدخول تتحقق من المدخلات محلياً قبل تنفيذ أي طلب للشبكة.
export function AdminLoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const loginSchema = z.object({
    email: z.string().email(t('login.invalidEmail')),
    password: z.string().min(10, t('login.passwordLength')),
  })
  const form = useForm({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } })

  // React Query يمنع تكرار منطق التحميل والخطأ ويجعل الطلب قابلاً لإعادة الاستخدام لاحقاً.
  const loginMutation = useMutation({ mutationFn: login })

  // بعد تسجيل الدخول نتحقق من الدور؛ حساب المستخدم العادي لا يستطيع فتح لوحة الإدارة.
  async function handleSubmit(credentials) {
    form.clearErrors('root')
    try {
      const result = await loginMutation.mutateAsync(credentials)
      if (result.user.role !== 'admin') {
        await logout()
        form.setError('root', { message: t('login.adminOnly') })
        return
      }
      navigate('/', { replace: true })
    } catch (_error) {
      form.setError('root', { message: t('login.failed') })
    }
  }

  return (
    <main className="min-h-screen bg-admin-bg">
      <AdminTopBar />
      <section className="mx-auto grid min-h-[calc(100vh-73px)] max-w-lg place-items-center px-5 py-10">
        <div className="w-full rounded-2xl border border-admin-border bg-admin-surface p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold text-admin-text">{t('login.title')}</h1>
          <p className="mt-2 text-sm text-admin-muted">{t('login.subtitle')}</p>
          <form className="mt-8 space-y-5" onSubmit={form.handleSubmit(handleSubmit)} noValidate>
            <label className="block text-sm font-semibold text-admin-text">
              {t('login.email')}
              <span className="relative mt-2 block">
                <Mail className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-admin-muted" aria-hidden="true" />
                <input type="email" autoComplete="email" aria-invalid={Boolean(form.formState.errors.email)} {...form.register('email')} className="w-full rounded-xl border border-admin-border bg-admin-bg py-3 pe-3 ps-10 outline-none transition focus:border-admin-brand focus:ring-2 focus:ring-admin-brand/20" />
              </span>
              {form.formState.errors.email && <span className="mt-1 block text-xs text-rose-600">{form.formState.errors.email.message}</span>}
            </label>
            <label className="block text-sm font-semibold text-admin-text">
              {t('login.password')}
              <span className="relative mt-2 block">
                <LockKeyhole className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-admin-muted" aria-hidden="true" />
                <input type="password" autoComplete="current-password" aria-invalid={Boolean(form.formState.errors.password)} {...form.register('password')} className="w-full rounded-xl border border-admin-border bg-admin-bg py-3 pe-3 ps-10 outline-none transition focus:border-admin-brand focus:ring-2 focus:ring-admin-brand/20" />
              </span>
              {form.formState.errors.password && <span className="mt-1 block text-xs text-rose-600">{form.formState.errors.password.message}</span>}
            </label>
            {form.formState.errors.root && <p className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-950 dark:bg-rose-950/40 dark:text-rose-200" role="alert">{form.formState.errors.root.message}</p>}
            <button type="submit" disabled={loginMutation.isPending} className="w-full rounded-xl bg-linear-to-r from-admin-brand to-admin-brand-strong px-4 py-3 font-bold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60">
              {loginMutation.isPending ? t('login.loading') : t('login.submit')}
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}
