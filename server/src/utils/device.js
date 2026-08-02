const crypto = require('crypto')

// هذا النمط يرفض معرفات الأجهزة الفارغة أو الطويلة جدًا قبل حفظها.
const deviceIdPattern = /^[a-zA-Z0-9-]{20,200}$/

// هذه الدالة تقرأ معرف الجهاز من Header مخصص بدل وضعه في جسم كلمة المرور.
function getDeviceId(request) {
  const deviceId = request.get('x-device-id')

  // نرفض الطلب إن لم يرسل المتصفح معرف الجهاز المطلوب للحماية.
  if (!deviceId || !deviceIdPattern.test(deviceId)) {
    const error = new Error('A valid device identifier is required.')
    error.statusCode = 400
    throw error
  }

  return deviceId
}

// هذه الدالة تخزن hash فقط، فلا تظهر بصمة الجهاز الأصلية في قاعدة البيانات.
function hashDeviceId(deviceId) {
  return crypto.createHash('sha256').update(deviceId).digest('hex')
}

// نصدر الدوال لاستخدامها في Controller تسجيل الدخول.
module.exports = { getDeviceId, hashDeviceId }
