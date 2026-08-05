import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, ChevronLeft, ChevronRight, Laptop, RefreshCcw, ShieldCheck, Users } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { listAdminUsers, resetTrustedDevice } from '../services/adminUsersService.js'

// هذه الدالة تعرض التاريخ بلغة لوحة الأدمن، أو شرطة عند عدم وجود قيمة.
function formatDate(value, language) {
  if (!value) return '—'
  return new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

// هذه الصفحة تجمع إدارة الحسابات المحظورة والجهاز الموثوق في مكان واحد للأدمن.
export function UsersSecurityPage() {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const [status, setStatus] = useState('blocked')
  const [page, setPage] = useState(1)
  const filters = ['', 'blocked', 'active']
  const usersQuery = useQuery({
    queryKey: ['admin-users', status, page],
    queryFn: () => listAdminUsers({ status, page }),
    placeholderData: keepPreviousData,
  })

  // بعد Reset نحدّث بيانات القائمة من السيرفر بدلاً من تعديلها محلياً بشكل قد يخطئ.
  const resetMutation = useMutation({
    mutationFn: resetTrustedDevice,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  })

  // تغيير الفلتر يعيد المستخدم دائماً إلى أول صفحة حتى لا يظل على صفحة غير موجودة.
  function changeStatus(nextStatus) {
    setStatus(nextStatus)
    setPage(1)
  }

  // نافذة التأكيد تمنع تنفيذ Reset بالخطأ لأن العملية تفك حظر الحساب بالفعل.
  async function handleReset(user) {
    if (!window.confirm(t('usersSecurity.confirmReset', { name: user.name }))) return
    try {
      await resetMutation.mutateAsync(user._id)
    } catch (_error) {
      // React Query يحتفظ بحالة الخطأ لتظهر الرسالة داخل الصفحة دون إيقاف الواجهة.
    }
  }

  const data = usersQuery.data
  const users = data?.users || []
  const pagination = data?.pagination

  return (
    <section className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-admin-brand"><ShieldCheck size={20} aria-hidden="true" /><span className="text-sm font-bold">{t('brand')}</span></div>
            <h1 className="mt-2 text-3xl font-bold text-admin-text">{t('usersSecurity.title')}</h1>
            <p className="mt-2 text-admin-muted">{t('usersSecurity.subtitle')}</p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {filters.map((filter) => {
            const label = t(`usersSecurity.${filter || 'all'}`)
            const isSelected = status === filter
            return <button key={filter || 'all'} type="button" onClick={() => changeStatus(filter)} className={`rounded-xl px-4 py-2 text-sm font-bold transition ${isSelected ? 'bg-admin-brand text-white' : 'border border-admin-border bg-admin-surface text-admin-muted hover:text-admin-text'}`}>{label}</button>
          })}
        </div>

        <section className="mt-5 overflow-hidden rounded-2xl border border-admin-border bg-admin-surface">
          <div className="flex items-center gap-3 border-b border-admin-border px-5 py-4"><Users className="text-admin-brand" size={20} aria-hidden="true" /><h2 className="font-bold text-admin-text">{t('usersSecurity.users')}</h2>{pagination && <span className="text-sm text-admin-muted">({pagination.total})</span>}</div>
          {usersQuery.isLoading && <p className="p-8 text-center text-admin-muted">{t('loading')}</p>}
          {usersQuery.isError && <p className="m-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{t('usersSecurity.failed')}</p>}
          {!usersQuery.isLoading && !usersQuery.isError && users.length === 0 && <p className="p-8 text-center text-admin-muted">{t('usersSecurity.empty')}</p>}
          <div className="divide-y divide-admin-border">
            {users.map((user) => {
              const isBlocked = user.accountStatus === 'blocked'
              const isResetting = resetMutation.isPending && resetMutation.variables === user._id
              return (
                <article key={user._id} className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto] lg:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2"><h3 className="truncate font-bold text-admin-text">{user.name}</h3><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${isBlocked ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>{t(`usersSecurity.${user.accountStatus}`)}</span></div>
                    <p className="mt-1 truncate text-sm text-admin-muted">{user.email}</p>
                    <p className="mt-2 text-xs text-admin-muted">{t('usersSecurity.createdAt')}: {formatDate(user.createdAt, i18n.language)}</p>
                  </div>
                  <div className="rounded-xl bg-admin-bg p-3 text-sm">
                    <div className="flex items-center gap-2 font-semibold text-admin-text"><Laptop size={16} className="text-admin-brand" aria-hidden="true" />{t('usersSecurity.device')}</div>
                    <p className="mt-1 text-admin-muted">{user.trustedDevice?.linkedAt ? `${t('usersSecurity.deviceLinked')} · ${formatDate(user.trustedDevice.linkedAt, i18n.language)}` : t('usersSecurity.noDevice')}</p>
                    {isBlocked && user.security?.blockReason && <p className="mt-2 flex gap-1.5 text-xs text-rose-600"><AlertTriangle className="mt-0.5 shrink-0" size={14} aria-hidden="true" />{user.security.blockReason}</p>}
                  </div>
                  {isBlocked && user.role === 'user' && <button type="button" onClick={() => handleReset(user)} disabled={isResetting} className="inline-flex items-center justify-center gap-2 rounded-xl border border-admin-border px-4 py-2.5 text-sm font-bold text-admin-text transition hover:bg-admin-bg disabled:cursor-not-allowed disabled:opacity-60"><RefreshCcw className={isResetting ? 'animate-spin' : ''} size={16} aria-hidden="true" />{isResetting ? t('usersSecurity.resetting') : t('usersSecurity.reset')}</button>}
                </article>
              )
            })}
          </div>
          {resetMutation.isError && <p className="mx-5 mb-5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{t('usersSecurity.resetFailed')}</p>}
          {pagination?.totalPages > 1 && <footer className="flex items-center justify-between border-t border-admin-border px-5 py-4"><button type="button" onClick={() => setPage((currentPage) => currentPage - 1)} disabled={page === 1} className="inline-flex items-center gap-1 text-sm font-bold text-admin-text disabled:opacity-40"><ChevronRight size={16} aria-hidden="true" />{t('usersSecurity.previous')}</button><span className="text-sm text-admin-muted">{t('usersSecurity.page', { page, total: pagination.totalPages })}</span><button type="button" onClick={() => setPage((currentPage) => currentPage + 1)} disabled={page === pagination.totalPages} className="inline-flex items-center gap-1 text-sm font-bold text-admin-text disabled:opacity-40">{t('usersSecurity.next')}<ChevronLeft size={16} aria-hidden="true" /></button></footer>}
        </section>
    </section>
  )
}
