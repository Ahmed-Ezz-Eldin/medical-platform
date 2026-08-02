// هذه القيم لا يمكن للسيرفر العمل بأمان من دونها.
const requiredVariables = ['MONGODB_URI', 'JWT_SECRET']

// هذه الدالة توقف التشغيل مبكرًا برسالة واضحة عند نقص إعداد مهم.
function validateEnvironment() {
  // نجمع أسماء القيم الناقصة بدل أن نكتشف الخطأ أثناء استخدام المنصة.
  const missingVariables = requiredVariables.filter((name) => !process.env[name])

  // نرمي خطأ يمنع تشغيل سيرفر ناقص الإعدادات.
  if (missingVariables.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVariables.join(', ')}`)
  }
}

module.exports = { validateEnvironment }
