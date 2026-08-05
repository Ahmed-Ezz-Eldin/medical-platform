const path = require('path')
const dotenv = require('dotenv')
const mongoose = require('mongoose')

// نقرأ إعدادات قاعدة البيانات من ملف البيئة في جذر المشروع، ولا نخزن كلمة مرور الأدمن فيه.
dotenv.config({ path: path.resolve(__dirname, '../../../.env') })

const User = require('../models/User')

// هذا الأمر المحلي ينشئ أول أدمن فقط من متغيرات الطرفية، وليس عبر API يمكن الوصول لها من الإنترنت.
async function createAdmin() {
  const name = process.env.ADMIN_NAME?.trim()
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD

  // نتحقق من البيانات قبل فتح اتصال قاعدة البيانات أو إنشاء أي سجل غير مكتمل.
  if (!name || !/^\S+@\S+\.\S+$/.test(email || '') || !password || password.length < 10) {
    throw new Error('Set ADMIN_NAME, ADMIN_EMAIL, and an ADMIN_PASSWORD of at least 10 characters before running this command.')
  }

  await mongoose.connect(process.env.MONGODB_URI)

  // لا نرفع صلاحية مستخدم موجود تلقائياً؛ التوقف هنا يمنع تغييراً غير مقصود في الحسابات.
  if (await User.exists({ email })) {
    throw new Error('An account already exists with this email. Use a new email for the first admin.')
  }

  // الـ User model يشفّر كلمة المرور تلقائياً من خلال pre-save hook قبل الحفظ.
  await User.create({ name, email, password, role: 'admin' })
  console.log(`Admin account created for ${email}.`)
}

// نفصل عن MongoDB دائماً حتى ينتهي الأمر المحلي ولا يظل مفتوحاً في الطرفية.
createAdmin()
  .catch((error) => {
    console.error('Could not create admin:', error.message)
    process.exitCode = 1
  })
  .finally(async () => {
    await mongoose.disconnect()
  })
