const express = require('express')
const rateLimit = require('express-rate-limit')

const { getCurrentUser, login, logout, register } = require('../controllers/authController')
const { requireAuth } = require('../middlewares/authMiddleware')

// Router يجمع كل المسارات التابعة للحساب في مكان واحد.
const router = express.Router()

// هذا الحد يطبق على التسجيل والدخول فقط، ولا يعيق قراءة الحساب أو الخروج.
const authenticationRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts. Try again later.' },
})

// إنشاء حساب جديد لا يحتاج إلى جلسة سابقة.
router.post('/register', authenticationRateLimit, register)
// تسجيل الدخول يربط أول جهاز أو يتحقق من الجهاز المحفوظ.
router.post('/login', authenticationRateLimit, login)
// قراءة بيانات الحساب الحالي تحتاج إلى جلسة صحيحة.
router.get('/me', requireAuth, getCurrentUser)
// تسجيل الخروج يمسح Cookie الجلسة الحالية.
router.post('/logout', requireAuth, logout)

// نصدر Router ليركبه app.js تحت /api/v1/auth.
module.exports = router
