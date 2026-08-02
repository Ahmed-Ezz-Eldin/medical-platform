const SecurityEvent = require('../models/SecurityEvent')
const User = require('../models/User')
const { clearAuthCookie, setAuthCookie } = require('../utils/authCookie')
const { getDeviceId, hashDeviceId } = require('../utils/device')

// هذه الدالة تعيد بيانات الحساب الآمنة فقط، دون كلمة مرور أو بصمة جهاز.
function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    accountStatus: user.accountStatus,
  }
}

// هذه الدالة تسجل أي حدث أمني مرتبط بالحساب للمراجعة المستقبلية.
async function logSecurityEvent(request, user, type) {
  await SecurityEvent.create({
    user: user.id,
    type,
    requestInfo: {
      ipAddress: request.ip,
      userAgent: request.get('user-agent') || 'Unknown',
    },
  })
}

// هذه الدالة تنشئ خطأ منظمًا ليقرأه معالج الأخطاء العام.
function createRequestError(message, statusCode, code) {
  const error = new Error(message)
  error.statusCode = statusCode
  error.code = code
  return error
}

// هذا الـ controller ينشئ حسابًا جديدًا لكنه لا يربطه بجهاز إلا عند أول Login.
async function register(request, response, next) {
  try {
    // نقرأ القيم التي سمحنا بها فقط من جسم الطلب.
    const { name, email, password } = request.body
    // ننظف الاسم والبريد قبل التحقق والحفظ.
    const normalizedName = typeof name === 'string' ? name.trim() : ''
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''

    // نرفض البيانات غير الكاملة أو كلمة المرور الضعيفة.
    if (normalizedName.length < 2 || !/^\S+@\S+\.\S+$/.test(normalizedEmail) || typeof password !== 'string' || password.length < 10) {
      throw createRequestError('Name, valid email, and a password of at least 10 characters are required.', 400, 'INVALID_REGISTRATION')
    }

    // نمنع وجود حسابين بنفس البريد.
    const existingUser = await User.exists({ email: normalizedEmail })
    if (existingUser) {
      throw createRequestError('An account already exists with this email.', 409, 'EMAIL_IN_USE')
    }

    // الـ schema سيشفّر كلمة المرور تلقائيًا قبل حفظ الحساب.
    const user = await User.create({ name: normalizedName, email: normalizedEmail, password })

    // نخبر الواجهة أن عليها توجيه المستخدم لتسجيل الدخول لأول مرة.
    return response.status(201).json({ message: 'Account created. Please log in to bind your device.', user: publicUser(user) })
  } catch (error) {
    return next(error)
  }
}

// هذا الـ controller يتحقق من كلمة المرور ويربط الحساب بأول جهاز أو يحظر محاولة جهاز جديد.
async function login(request, response, next) {
  try {
    // نقرأ بيانات الدخول ومعرف الجهاز من Header مخصص.
    const { email, password } = request.body
    const deviceId = getDeviceId(request)
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''

    // نستخدم رسالة عامة حتى لا نكشف إن كان البريد مسجلًا أم لا.
    if (!normalizedEmail || typeof password !== 'string') {
      throw createRequestError('Invalid email or password.', 401, 'INVALID_CREDENTIALS')
    }

    // نطلب كلمة المرور وبصمة الجهاز صراحة لأنهما مخفيان افتراضيًا من أي Query.
    let user = await User.findOne({ email: normalizedEmail }).select('+password +trustedDevice.deviceHash')
    if (!user || !(await user.comparePassword(password))) {
      throw createRequestError('Invalid email or password.', 401, 'INVALID_CREDENTIALS')
    }

    // الحساب المحظور لا يعود للدخول حتى يعيد الأدمن ضبط جهازه.
    if (user.accountStatus === 'blocked') {
      throw createRequestError('This account is blocked. Contact support to reset the trusted device.', 403, 'ACCOUNT_BLOCKED')
    }

    // نحول معرف الجهاز إلى hash قبل مقارنته أو تخزينه.
    const deviceHash = hashDeviceId(deviceId)

    // إن لم يوجد جهاز، نربط أول جهاز بعملية ذرية تمنع ربط جهازين في الوقت نفسه.
    if (!user.trustedDevice?.deviceHash) {
      const firstDeviceUser = await User.findOneAndUpdate(
        { _id: user.id, 'trustedDevice.deviceHash': { $exists: false }, accountStatus: 'active' },
        { $set: { 'trustedDevice.deviceHash': deviceHash, 'trustedDevice.linkedAt': new Date(), 'trustedDevice.lastSeenAt': new Date() } },
        // نطلب الـ hash في النتيجة رغم أنه مخفي افتراضيًا حتى نقارنه فورًا.
        { returnDocument: 'after', select: '+trustedDevice.deviceHash' },
      )

      // إذا سبق جهاز آخر هذه العملية، نقرأ أحدث حالة قبل اتخاذ القرار.
      if (firstDeviceUser) {
        user = firstDeviceUser
        await logSecurityEvent(request, user, 'first_device_bound')
      } else {
        user = await User.findById(user.id).select('+trustedDevice.deviceHash')
      }
    }

    // أي بصمة تختلف عن الجهاز الأول توقف الحساب فورًا حسب سياسة المنصة.
    if (user.trustedDevice.deviceHash !== deviceHash) {
      user.accountStatus = 'blocked'
      user.security.blockedAt = new Date()
      user.security.blockReason = 'Login attempted from a different device.'
      await user.save()
      await logSecurityEvent(request, user, 'blocked_device_mismatch')
      throw createRequestError('Login from another device is not allowed. This account is now blocked.', 403, 'DEVICE_MISMATCH')
    }

    // نسجل آخر استخدام لنفس الجهاز الموثوق.
    user.trustedDevice.lastSeenAt = new Date()
    await user.save()
    await logSecurityEvent(request, user, 'login_success')

    // نضع الجلسة في Cookie آمنة ثم نرجع بيانات العرض فقط.
    setAuthCookie(response, user)
    return response.status(200).json({ message: 'Login successful.', user: publicUser(user) })
  } catch (error) {
    return next(error)
  }
}

// هذا الـ controller يعيد بيانات صاحب الجلسة الحالية للواجهة بعد إعادة فتح الصفحة.
function getCurrentUser(request, response) {
  return response.status(200).json({ user: publicUser(request.user) })
}

// هذا الـ controller يمسح Cookie الجلسة من الجهاز الحالي عند تسجيل الخروج.
function logout(_request, response) {
  clearAuthCookie(response)
  return response.status(204).send()
}

// نصدر controllers لاستخدامها في مسارات الحساب.
module.exports = { getCurrentUser, login, logout, register }
