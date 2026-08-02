const jwt = require('jsonwebtoken')

// اسم Cookie ثابت حتى تقرأه كل Routes المحمية بنفس الطريقة.
const authCookieName = 'medical_platform_session'

// هذا العمر القصير نسبيًا يقلل ضرر Cookie لو سُرق من جهاز المستخدم.
const authCookieMaxAge = 12 * 60 * 60 * 1000

// هذه الدالة تنشئ JWT يحتوي فقط على هوية الحساب والدور.
function createAuthToken(user) {
  return jwt.sign({ role: user.role }, process.env.JWT_SECRET, {
    subject: user.id,
    expiresIn: process.env.JWT_EXPIRES_IN || '12h',
  })
}

// هذه الدالة تضع JWT في Cookie لا يستطيع JavaScript قراءتها.
function setAuthCookie(response, user) {
  const token = createAuthToken(user)

  response.cookie(authCookieName, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: authCookieMaxAge,
  })
}

// هذه الدالة تمسح Cookie عند تسجيل الخروج أو عند الحاجة المستقبلية.
function clearAuthCookie(response) {
  response.clearCookie(authCookieName, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
}

// نصدر الاسم والدوال لاستخدامها في middleware وcontroller الحساب.
module.exports = { authCookieName, clearAuthCookie, createAuthToken, setAuthCookie }
