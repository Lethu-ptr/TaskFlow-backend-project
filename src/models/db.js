// TaskFlow Backend – models/db.js
// SQLite database setup using sqlite3 (asynchronous).
// Tables: users, tasks

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const DB_PATH = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : path.join(__dirname, '../../taskflow.db');

// Open database (creates file if missing)
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    process.exit(1); // stop the app if DB fails
  } else {
    console.log(`✅ Connected to SQLite database at ${DB_PATH}`);
    // Enable WAL mode and foreign keys (async)
    db.run('PRAGMA journal_mode = WAL;', (err) => {
      if (err) console.warn('⚠️ Could not enable WAL mode:', err.message);
    });
    db.run('PRAGMA foreign_keys = ON;', (err) => {
      if (err) console.warn('⚠️ Could not enable foreign_keys:', err.message);
    });

    // Create tables (if not exist)
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        name       TEXT    NOT NULL,
        email      TEXT    NOT NULL UNIQUE,
        password   TEXT    NOT NULL,
        created_at TEXT    NOT NULL DEFAULT (datetime('now'))
      );
    `, (err) => {
      if (err) console.error('❌ Error creating users table:', err.message);
      else console.log('✅ Users table ready');
    });

    db.run(`
      CREATE TABLE IF NOT EXISTS tasks (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title       TEXT    NOT NULL,
        description TEXT    DEFAULT '',
        priority    TEXT    NOT NULL DEFAULT 'medium'
                        CHECK(priority IN ('high','medium','low')),
        status      TEXT    NOT NULL DEFAULT 'pending'
                        CHECK(status IN ('pending','active','completed')),
        category    TEXT    DEFAULT 'General',
        due_date    TEXT    DEFAULT NULL,
        created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
        updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
      );
    `, (err) => {
      if (err) console.error('❌ Error creating tasks table:', err.message);
      else console.log('✅ Tasks table ready');
    });
  }
});

module.exports = db;