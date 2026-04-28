// ============================================================
//  TaskFlow Backend – routes/tasks.js
// ============================================================

const router   = require('express').Router();
const { body } = require('express-validator');
const auth     = require('../middleware/auth');
const ctrl     = require('../controllers/taskController');

// All task routes are protected
router.use(auth);

const createRules = [
  body('title').trim().notEmpty().withMessage('Title is required.')
               .isLength({ min: 3, max: 100 }).withMessage('Title must be 3–100 characters.'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description too long.'),
  body('priority').optional().isIn(['high', 'medium', 'low']).withMessage('Invalid priority.'),
  body('status').optional().isIn(['pending', 'active', 'completed']).withMessage('Invalid status.'),
  body('category').optional().trim().isLength({ max: 60 }).withMessage('Category too long.'),
  body('dueDate').optional({ checkFalsy: true }).isISO8601().withMessage('Invalid date format.'),
];

const updateRules = [
  body('title').optional().trim().isLength({ min: 3, max: 100 }).withMessage('Title must be 3–100 characters.'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description too long.'),
  body('priority').optional().isIn(['high', 'medium', 'low']).withMessage('Invalid priority.'),
  body('status').optional().isIn(['pending', 'active', 'completed']).withMessage('Invalid status.'),
  body('category').optional().trim().isLength({ max: 60 }).withMessage('Category too long.'),
  body('dueDate').optional({ checkFalsy: true }).isISO8601().withMessage('Invalid date format.'),
];

router.get('/',     ctrl.getAll);
router.get('/:id',  ctrl.getOne);
router.post('/',    createRules, ctrl.create);
router.put('/:id',  updateRules, ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
