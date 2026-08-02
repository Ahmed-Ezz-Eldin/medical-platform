// هذا المفتاح هو الاسم الذي سنستخدمه لحفظ معرف الجهاز داخل المتصفح الحالي.
const deviceStorageKey = 'medical-platform.device-id'

// هذه الدالة تنشئ معرفًا عشوائيًا أول مرة ثم تعيد نفس المعرف في كل Login لاحق.
export function getDeviceId() {
  // نقرأ المعرف القديم إن كان هذا المتصفح هو الجهاز الموثوق سابقًا.
  const existingDeviceId = window.localStorage.getItem(deviceStorageKey)
  if (existingDeviceId) return existingDeviceId

  // crypto.randomUUID ينتج معرفًا عشوائيًا قويًا لا يعتمد على بيانات شخصية.
  const newDeviceId = window.crypto.randomUUID()
  // نحفظه محليًا لكي يعرف السيرفر هذا المتصفح في كل محاولة دخول.
  window.localStorage.setItem(deviceStorageKey, newDeviceId)

  return newDeviceId
}
