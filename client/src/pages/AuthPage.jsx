import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { loginAccount, registerAccount } from '../services/authService'

// هذه القواعد تعرّف صحة بيانات تسجيل الدخول في مكان واحد.
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(10) })
// هذه القواعد تضيف الاسم الإلزامي فوق قواعد تسجيل الدخول عند إنشاء الحساب.
const registerSchema = loginSchema.extend({ name: z.string().trim().min(2).max(80) })

// هذه الدالة تحول أخطاء الجهاز إلى رسالة يمكن للمستخدم فهمها.
function getRequestError(error, t) {
  const code = error.response?.data?.code
  if (code === 'DEVICE_MISMATCH' || code === 'ACCOUNT_BLOCKED') return t('auth.deviceBlocked')

  return t('auth.genericError')
}

// هذا المكون يبني نموذجًا بسيطًا للدخول أو التسجيل باستخدام React Hook Form.
function AuthPage({ mode }) {
  const isLogin = mode === 'login'
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()

  // React Hook Form يدير الحقول دون إعادة رسم كل الصفحة في كل ضغطة.
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(isLogin ? loginSchema : registerSchema),
    // نتحقق عند الخروج من الحقل بدل التحقق مع كل ضغطة لتحسين سلاسة النموذج.
    mode: 'onBlur',
    defaultValues: { name: '', email: '', password: '' },
  })

  // React Query ينفذ الطلب ويعطي حالة تحميل وخطأ بسيطة للنموذج.
  const authMutation = useMutation({
    mutationFn: (values) => (isLogin ? loginAccount(values) : registerAccount(values)),
    onSuccess: () => {
      if (!isLogin) navigate('/login', { replace: true, state: { registered: true } })
    },
  })

  // هذا يرسل فقط القيم التي نجحت في قواعد Zod.
  function submitForm(values) {
    authMutation.mutate(values)
  }

  // هذه الرسالة تظهر بعد التسجيل أو عند نجاح الدخول.
  const successMessage = isLogin && authMutation.isSuccess ? t('auth.loginDone') : location.state?.registered ? t('auth.registrationDone') : ''

  return (
    <section className="relative grid min-h-[85vh] w-full flex-1 place-items-center overflow-hidden bg-app-bg p-4 transition-colors duration-300">
      
      {/* تأثيرات الإضاءة الخلفية المضيئة (Ambient Glow & Lighting) */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-80 w-80 rounded-full bg-brand/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 -bottom-32 h-80 w-80 rounded-full bg-brand-end/10 blur-3xl" />

      {/* الحاوية الرئيسية (Card Container) مع ظل مضيء وتصميم زجاجي خفيف */}
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-app-border/80 bg-app-surface/90 p-8 shadow-2xl shadow-brand/10 backdrop-blur-xl sm:p-10">
        
        <header className="text-center sm:text-start">
          <p className="mb-2 text-xs font-extrabold tracking-[0.2em] text-brand uppercase">{t('brand')}</p>
          <h1 className="text-3xl font-black tracking-tight text-app-text sm:text-4xl">{t(isLogin ? 'auth.loginTitle' : 'auth.registerTitle')}</h1>
          <p className="mt-3 text-sm leading-6 text-app-text-muted">{t(isLogin ? 'auth.loginHint' : 'auth.registerHint')}</p>
        </header>

        <form className="mt-8 grid gap-5" onSubmit={handleSubmit(submitForm)} noValidate>
          
          {/* حقل الاسم */}
          {!isLogin && (
            <label className="grid gap-2 text-sm font-bold text-app-text-muted">
              <span>{t('auth.name')}</span>
              <input 
                className="rounded-xl border border-app-border-strong bg-app-surface-muted/50 px-4 py-3.5 font-normal text-app-text outline-none transition-all focus:border-brand focus:bg-app-surface focus:ring-4 focus:ring-brand/20" 
                autoComplete="name" 
                {...register('name')} 
              />
              {errors.name && <small className="text-xs font-medium text-danger">{t('auth.formError')}</small>}
            </label>
          )}

          {/* حقل البريد الإلكتروني */}
          <label className="grid gap-2 text-sm font-bold text-app-text-muted">
            <span>{t('auth.email')}</span>
            <input 
              className="rounded-xl border border-app-border-strong bg-app-surface-muted/50 px-4 py-3.5 font-normal text-app-text outline-none transition-all focus:border-brand focus:bg-app-surface focus:ring-4 focus:ring-brand/20" 
              type="email" 
              autoComplete="email" 
              {...register('email')} 
            />
            {errors.email && <small className="text-xs font-medium text-danger">{t('auth.formError')}</small>}
          </label>

          {/* حقل كلمة المرور */}
          <label className="grid gap-2 text-sm font-bold text-app-text-muted">
            <span>{t('auth.password')}</span>
            <input 
              className="rounded-xl border border-app-border-strong bg-app-surface-muted/50 px-4 py-3.5 font-normal text-app-text outline-none transition-all focus:border-brand focus:bg-app-surface focus:ring-4 focus:ring-brand/20" 
              type="password" 
              autoComplete={isLogin ? 'current-password' : 'new-password'} 
              {...register('password')} 
            />
            {!isLogin && <small className="text-xs font-normal text-app-text-subtle">{t('auth.passwordHint')}</small>}
            {errors.password && <small className="text-xs font-medium text-danger">{t('auth.formError')}</small>}
          </label>

          {/* رسالة الخطأ */}
          {authMutation.isError && (
            <p className="rounded-xl border border-dashed border-danger bg-danger/10 p-3.5 text-sm leading-6 text-danger-contrast">
              {getRequestError(authMutation.error, t)}
            </p>
          )}

          {/* رسالة النجاح */}
          {successMessage && (
            <p className="rounded-xl border border-brand/30 bg-brand/10 p-3.5 text-sm leading-6 text-brand-strong">
              {successMessage}
            </p>
          )}

          {/* زر الإرسال مع تدرج لوني سينمائي وإضاءة خفيفة عند التحويم */}
          <button 
            className="mt-2 min-h-12 w-full rounded-xl bg-gradient-to-r from-brand via-brand-strong to-brand-end px-4 py-3.5 font-bold text-brand-contrast shadow-lg shadow-brand/25 transition-all hover:brightness-110 active:scale-[0.99] disabled:cursor-wait disabled:opacity-60" 
            type="submit" 
            disabled={authMutation.isPending}
          >
            {authMutation.isPending ? t('auth.loading') : t(isLogin ? 'auth.loginButton' : 'auth.registerButton')}
          </button>
        </form>

        {/* رابط التبديل بين الدخول والتسجيل */}
        <p className="mt-8 text-center text-sm text-app-text-muted">
          {t(isLogin ? 'auth.noAccount' : 'auth.hasAccount')}{' '}
          <Link className="font-bold text-brand underline underline-offset-4 transition-colors hover:text-brand-strong" to={isLogin ? '/register' : '/login'}>
            {t(isLogin ? 'auth.registerLink' : 'auth.loginLink')}
          </Link>
        </p>

      </div>
    </section>
  )
}

export default AuthPage
