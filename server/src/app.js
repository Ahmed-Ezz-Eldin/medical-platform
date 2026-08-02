const cors = require('cors')
const express = require('express')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const cookieParser = require('cookie-parser')

const adminUserRoutes = require('./routes/adminUserRoutes')
const authRoutes = require('./routes/authRoutes')

const app = express()

const allowedOrigins = [process.env.CLIENT_URL, process.env.ADMIN_URL].filter(Boolean)

app.use(helmet())
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true)
      }

      return callback(new Error('Origin is not allowed by CORS'))
    },
    credentials: true,
  }),
)
app.use(express.json({ limit: '20kb' }))
// يقرأ Cookie الجلسة حتى تتمكن المسارات المحمية من التحقق منها.
app.use(cookieParser())
// هذا يمنع إرسال عدد ضخم من الطلبات إلى السيرفر من نفس الشخص أو الـIP:
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 دقيقة
    max: 300, // 300 طلب كحد أقصى في الـ15 دقيقة
    standardHeaders: 'draft-8', // إرجاع معلومات الحد الأقصى في الهيدرز
    legacyHeaders: false,
  }),
)

// هذه المسارات تدير التسجيل والجلسة والجهاز الموثوق.
app.use('/api/v1/auth', authRoutes)
// هذا المسار محمي ويمنح الأدمن صلاحية إعادة ضبط جهاز المستخدم.
app.use('/api/v1/admin/users', adminUserRoutes)

app.get('/api/v1/health', (_request, response) => {
  response.status(200).json({ status: 'ok' })
})

app.use((error, _request, response, _next) => {
  // In development log only safe technical fields; never log a request body containing passwords.
  if (process.env.NODE_ENV !== 'production') {
    console.error('API error:', { name: error.name, message: error.message, code: error.code })
  }

  if (error.message === 'Origin is not allowed by CORS') {
    return response.status(403).json({ message: 'Origin is not allowed' })
  }

  // A duplicate email may occur even after the pre-check when two requests arrive together.
  if (error.code === 11000) {
    return response.status(409).json({ message: 'An account already exists with this email.', code: 'EMAIL_IN_USE' })
  }

  // Mongoose validation failures are malformed input, not internal server failures.
  if (error.name === 'ValidationError') {
    return response.status(400).json({ message: 'The account information is invalid.', code: 'INVALID_REGISTRATION' })
  }

  // نعيد أخطاء الطلب المعروفة، أو رسالة عامة للأخطاء الداخلية فقط.
  return response.status(error.statusCode || 500).json({
    message: error.statusCode ? error.message : 'Unexpected server error',
    code: error.code || 'INTERNAL_SERVER_ERROR',
  })
})

module.exports = { app }
