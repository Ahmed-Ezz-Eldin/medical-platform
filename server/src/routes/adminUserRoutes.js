const express = require('express')

const { listUsers, resetTrustedDevice } = require('../controllers/adminUserController')
const { allowRoles, requireAuth } = require('../middlewares/authMiddleware')

// Router يجمع أدوات إدارة المستخدمين الخاصة بالأدمن.
const router = express.Router()

// هذا المسار يعيد قائمة المستخدمين بصفحات صغيرة، مع فلتر اختياري للحسابات المحظورة أو النشطة.
router.get('/', requireAuth, allowRoles('admin'), listUsers)

// هذا المسار يعيد ضبط جهاز مستخدم بعد تحقق جلسة ودور الأدمن.
router.patch('/:userId/trusted-device/reset', requireAuth, allowRoles('admin'), resetTrustedDevice)

// نصدر Router ليركبه app.js تحت /api/v1/admin/users.
module.exports = router
