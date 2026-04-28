// ============================================================
//  TaskFlow Backend – routes/auth.js
// ============================================================

const router     = require('express').Router();
const { body }   = require('express-validator');
const auth       = require('../middleware/auth');
const ctrl       = require('../controllers/authController');

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required.')
              .isLength({ max: 80 }).withMessage('Name too long.'),
  body('email').isEmail().withMessage('Valid email required.')
               .normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
];

const loginRules = [
  body('email').isEmail().withMessage('Valid email required.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.'),
];

router.post('/register', registerRules, ctrl.register);
router.post('/login',    loginRules,    ctrl.login);
router.get('/me',        auth,          ctrl.me);

module.exports = router;
