const mongoose = require('mongoose')

// هذا الـ schema يسجل أحداث الأمان المهمة ليراجعها الأدمن لاحقًا.
const securityEventSchema = new mongoose.Schema(
  {
    // نربط الحدث بالحساب عند معرفة صاحب المحاولة.
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // نوع الحدث يجعل الفلترة في لوحة الأدمن واضحة.
    type: {
      type: String,
      enum: ['first_device_bound', 'login_success', 'blocked_device_mismatch', 'device_reset'],
      required: true,
    },
    // نخزن الـ IP وUser-Agent للمراجعة، ولا نخزن أي كلمة مرور أو token.
    requestInfo: {
      ipAddress: { type: String, maxlength: 100 },
      userAgent: { type: String, maxlength: 500 },
    },
  },
  // وقت إنشاء الحدث هو وقت حدوثه، لذلك نستخدم createdAt فقط.
  { timestamps: { createdAt: true, updatedAt: false } },
)

// نصدر الـ Model لكتابة سجل الأمن من عمليات الدخول وإعادة الضبط.
module.exports = mongoose.model('SecurityEvent', securityEventSchema)
