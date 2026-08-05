const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')

// هذا الـ schema يصف بيانات الحساب والصلاحية وحالة الجهاز الموثوق.
const userSchema = new mongoose.Schema(
  {
    // الاسم الظاهر للأدمن ولصاحب الحساب.
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    // البريد هو معرف الدخول الفريد لكل حساب.
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // نخزن كلمة المرور مشفرة فقط ولا نعيدها في أي Query عادي.
    password: { type: String, required: true, select: false },
    // الدور يحدد هل هذا مستخدم عادي أم مسؤول منصة.
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    // الحظر يمنع أي طلب محمي، وليس محاولة الدخول فقط.
    accountStatus: { type: String, enum: ['active', 'blocked'], default: 'active' },
    // هذا الجزء يخزن بصمة الجهاز بشكل مشفر ووقت أول وآخر استخدام.
    trustedDevice: {
      deviceHash: { type: String, select: false },
      linkedAt: { type: Date },
      lastSeenAt: { type: Date },
    },
    // هذه المعلومات تساعد الأدمن على معرفة سبب الحظر عند طلب الدعم.
    security: {
      blockedAt: { type: Date },
      blockReason: { type: String, maxlength: 200 },
    },
  },
  // نضيف وقت الإنشاء والتعديل تلقائيًا لكل حساب.
  { timestamps: true },
)

// قبل حفظ كلمة مرور جديدة، نحولها إلى hash لا يمكن استرجاعه.
userSchema.pre('save', async function hashPassword() {
  // لا نعيد تشفير كلمة مرور لم تتغير.
  if (!this.isModified('password')) return

  // 12 جولة توازن بين الأمان وسرعة الاستجابة محليًا.
  this.password = await bcrypt.hash(this.password, 12)
})

// هذه الدالة تقارن كلمة المرور المدخلة بالـ hash المحفوظ بأمان.
userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

// هذا الفهرس يسرّع ترتيب وفصل الحسابات حسب الحالة في صفحة إدارة المستخدمين.
userSchema.index({ accountStatus: 1, createdAt: -1 })

// نصدر الـ Model لاستخدامه في Routes التسجيل والدخول والإدارة.
module.exports = mongoose.model('User', userSchema)
