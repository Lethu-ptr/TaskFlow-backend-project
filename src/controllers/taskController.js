// ============================================================
//  TaskFlow Backend – controllers/taskController.js
//  Full CRUD for tasks. All routes are user-scoped.
//
//  GET    /api/tasks           — list user's tasks
//  POST   /api/tasks           — create task
//  GET    /api/tasks/:id       — get single task
//  PUT    /api/tasks/:id       — update task
//  DELETE /api/tasks/:id       — delete task
// ============================================================

const { validationResult } = require('express-validator');
const db = require('../models/db');

// ── Helpers ───────────────────────────────────────────────────
function toFrontend(row) {
  // Map snake_case DB columns → camelCase for the frontend
  return {
    id:          row.id,
    title:       row.title,
    description: row.description || '',
    priority:    row.priority,
    status:      row.status,
    category:    row.category || 'General',
    dueDate:     row.due_date || '',
    createdAt:   row.created_at,
    updatedAt:   row.updated_at,
  };
}

function ownerGuard(task, userId, res) {
  if (!task) { res.status(404).json({ message: 'Task not found.' }); return false; }
  if (task.user_id !== userId) { res.status(403).json({ message: 'Access denied.' }); return false; }
  return true;
}

// ── GET /api/tasks ────────────────────────────────────────────
exports.getAll = (req, res, next) => {
  try {
    const { status, priority, search, sort } = req.query;

    let query  = 'SELECT * FROM tasks WHERE user_id = ?';
    const args = [req.user.id];

    if (status)   { query += ' AND status = ?';        args.push(status); }
    if (priority) { query += ' AND priority = ?';      args.push(priority); }
    if (search)   { query += ' AND (title LIKE ? OR description LIKE ?)';
                    args.push(`%${search}%`, `%${search}%`); }

    const ORDER = {
      priority: "ORDER BY CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END",
      due:      'ORDER BY due_date ASC',
      oldest:   'ORDER BY created_at ASC',
    };
    query += ` ${ORDER[sort] || 'ORDER BY created_at DESC'}`;

    const rows = db.prepare(query).all(...args);
    return res.json({ tasks: rows.map(toFrontend) });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/tasks/:id ────────────────────────────────────────
exports.getOne = (req, res, next) => {
  try {
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
    if (!ownerGuard(task, req.user.id, res)) return;
    return res.json({ task: toFrontend(task) });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/tasks ───────────────────────────────────────────
exports.create = (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { title, description, priority, status, category, dueDate } = req.body;

    const stmt = db.prepare(`
      INSERT INTO tasks (user_id, title, description, priority, status, category, due_date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      req.user.id,
      title.trim(),
      (description || '').trim(),
      priority   || 'medium',
      status     || 'pending',
      (category  || 'General').trim(),
      dueDate    || null
    );

    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
    return res.status(201).json({ message: 'Task created.', task: toFrontend(task) });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/tasks/:id ────────────────────────────────────────
exports.update = (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ message: 'Validation failed', errors: errors.array() });
    }

    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
    if (!ownerGuard(task, req.user.id, res)) return;

    const { title, description, priority, status, category, dueDate } = req.body;

    db.prepare(`
      UPDATE tasks SET
        title       = COALESCE(?, title),
        description = COALESCE(?, description),
        priority    = COALESCE(?, priority),
        status      = COALESCE(?, status),
        category    = COALESCE(?, category),
        due_date    = ?,
        updated_at  = datetime('now')
      WHERE id = ?
    `).run(
      title       !== undefined ? title.trim()       : null,
      description !== undefined ? description.trim() : null,
      priority    || null,
      status      || null,
      category    !== undefined ? category.trim()    : null,
      dueDate     !== undefined ? dueDate || null : task.due_date,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
    return res.json({ message: 'Task updated.', task: toFrontend(updated) });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/tasks/:id ─────────────────────────────────────
exports.remove = (req, res, next) => {
  try {
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
    if (!ownerGuard(task, req.user.id, res)) return;

    db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
    return res.json({ message: 'Task deleted.' });
  } catch (err) {
    next(err);
  }
};
