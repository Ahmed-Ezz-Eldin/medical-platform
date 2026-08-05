const SecurityEvent = require('../models/SecurityEvent')
const User = require('../models/User')

// هذه الدالة تقرأ أرقام الصفحات بأمان حتى لا يطلب العميل آلاف السجلات دفعة واحدة.
function getPositiveInteger(value, fallback, maximum) {
  const parsedValue = Number.parseInt(value, 10)
  if (!Number.isInteger(parsedValue) || parsedValue < 1) return fallback
  return Math.min(parsedValue, maximum)
}

// هذا الـ controller يعيد بيانات عرض آمنة ومقسّمة لصفحات؛ لا يعيد كلمة المرور أو بصمة الجهاز.
async function listUsers(request, response, next) {
  try {
    // نسمح فقط بحالتي الحساب المعرّفتين في الـ schema، أو بكل الحسابات عند عدم اختيار فلتر.
    const status = request.query.status
    const accountStatus = status === 'active' || status === 'blocked' ? status : undefined
    const page = getPositiveInteger(request.query.page, 1, 100000)
    const limit = getPositiveInteger(request.query.limit, 20, 50)
    const filter = { role: 'user', ...(accountStatus && { accountStatus }) }

    // ننفذ العدد والاستعلام معاً لتقليل زمن انتظار صفحة الإدارة.
    const [total, users] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter)
        .select('name email role accountStatus trustedDevice.linkedAt trustedDevice.lastSeenAt security.blockedAt security.blockReason createdAt')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ])

    // نرجع بيانات العرض وبيانات التنقل فقط حتى تعرف الواجهة هل يوجد صفحة تالية.
    return response.status(200).json({
      users,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    return next(error)
  }
}

// هذا الـ controller يسمح للأدمن فقط بإلغاء الحظر وحذف الجهاز الموثوق للحساب.
async function resetTrustedDevice(request, response, next) {
  try {
    // نبحث عن الحساب الهدف من الـ id الموجود في رابط الطلب.
    const user = await User.findById(request.params.userId)
    if (!user) {
      const error = new Error('User not found.')
      error.statusCode = 404
      error.code = 'USER_NOT_FOUND'
      throw error
    }

    // لا نسمح بعملية إعادة ضبط لحساب أدمن؛ الحسابات الإدارية لا تُدار من هذه الشاشة.
    if (user.role === 'admin') {
      const error = new Error('Admin accounts cannot be reset from this endpoint.')
      error.statusCode = 403
      error.code = 'ADMIN_ACCOUNT_PROTECTED'
      throw error
    }

    // نمسح بيانات الجهاز والحظر كي يربط المستخدم جهازه التالي عند أول Login.
    user.trustedDevice = {}
    user.accountStatus = 'active'
    user.security = {}
    await user.save()

    // نسجل أن إعادة الضبط حدثت لسهولة المراجعة داخل لوحة الأدمن لاحقًا.
    await SecurityEvent.create({
      user: user.id,
      type: 'device_reset',
      requestInfo: { ipAddress: request.ip, userAgent: request.get('user-agent') || 'Unknown' },
    })

    // نرجع رسالة واضحة للأدمن بدل أي بيانات حساسة.
    return response.status(200).json({ message: 'Trusted device reset. The user can log in from a new device.' })
  } catch (error) {
    return next(error)
  }
}

// نصدر controller لاستخدامه في Route الإدارة.
module.exports = { listUsers, resetTrustedDevice }
