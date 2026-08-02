const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { authCookieName, clearAuthCookie } = require('../utils/authCookie')

// هذا middleware يتحقق من JWT ويجلب المستخدم الحالي من قاعدة البيانات.
async function requireAuth(request, response, next) {
  try {
    // نقرأ الجلسة من Cookie الآمنة فقط.
    const token = request.cookies[authCookieName]
    if (!token) {
      const error = new Error('Authentication is required.')
      error.statusCode = 401
      error.code = 'UNAUTHENTICATED'
      throw error
    }

    // نتحقق أن توقيع الجلسة سليم وغير منتهي الصلاحية.
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(payload.sub)

    // نرفض الجلسة إذا حُذف الحساب أو حُظر بعد إنشاء الـ token.
    if (!user || user.accountStatus !== 'active') {
      clearAuthCookie(response)
      const error = new Error('This session is no longer allowed.')
      error.statusCode = 403
      error.code = 'SESSION_NOT_ALLOWED'
      throw error
    }

    // نضع المستخدم في الطلب ليستعمله أي Controller محمي بعد ذلك.
    request.user = user
    return next()
  } catch (error) {
    // نمسح الجلسة غير الصالحة حتى لا يحاول المتصفح إرسالها باستمرار.
    clearAuthCookie(response)
    if (!error.statusCode) {
      error.statusCode = 401
      error.code = 'INVALID_SESSION'
      error.message = 'Your session is invalid or expired.'
    }
    return next(error)
  }
}

// هذا middleware يمنع المستخدم العادي من استدعاء مسارات الأدمن.
function allowRoles(...roles) {
  return (request, _response, next) => {
    // نتحقق من أن الدور الحالي موجود في قائمة الأدوار المسموحة.
    if (!request.user || !roles.includes(request.user.role)) {
      const error = new Error('You do not have permission for this action.')
      error.statusCode = 403
      error.code = 'FORBIDDEN'
      return next(error)
    }

    return next()
  }
}

// نصدر middleware تسجيل الدخول والصلاحيات للمسارات الأخرى.
module.exports = { allowRoles, requireAuth }
