const SecurityEvent = require('../models/SecurityEvent')
const User = require('../models/User')

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
module.exports = { resetTrustedDevice }
