// ============================================================
//  TaskFlow Backend – controllers/authController.js
//  Handles: POST /api/auth/register, /login, GET /api/auth/me
// ============================================================

const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const db     = require('../models/db');

// ── Helper: sign a JWT ────────────────────────────────────────
function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// ── POST /api/auth/register ───────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { name, email, password } = req.body;

    // Check duplicate email
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (existing) {
      return res.status(409).json({ message: 'An account with that email already exists.' });
    }

    // Hash password (salt rounds = 12)
    const hashed = await bcrypt.hash(password, 12);

    // Insert user
    const stmt   = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
    const result = stmt.run(name.trim(), email.toLowerCase().trim(), hashed);

    const user = { id: result.lastInsertRowid, name: name.trim(), email: email.toLowerCase().trim() };
    const token = signToken(user);

    return res.status(201).json({ message: 'Account created successfully.', token, user });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/auth/login ──────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = db
      .prepare('SELECT * FROM users WHERE email = ?')
      .get(email.toLowerCase().trim());

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const payload = { id: user.id, name: user.name, email: user.email };
    const token   = signToken(payload);

    return res.json({ message: 'Logged in successfully.', token, user: payload });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/auth/me ──────────────────────────────────────────
exports.me = (req, res, next) => {
  try {
    const user = db
      .prepare('SELECT id, name, email, created_at FROM users WHERE id = ?')
      .get(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.json({ user });
  } catch (err) {
    next(err);
  }
};
