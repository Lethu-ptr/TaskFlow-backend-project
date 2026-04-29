// TaskFlow Backend - models/db.js
// SQLite database setup using better-sqlite3 (synchronous).
// Tables: users, tasks

const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

const DB_PATH = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : path.join(__dirname, '../../taskflow.db');

let db;

try {
  db = new Database(DB_PATH);
  console.log(`Connected to SQLite database at ${DB_PATH}`);

  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT    NOT NULL,
      email      TEXT    NOT NULL UNIQUE,
      password   TEXT    NOT NULL,
      created_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );

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
  `);

  console.log('Users table ready');
  console.log('Tasks table ready');
} catch (err) {
  console.error('Error opening or initializing database:', err.message);
  process.exit(1);
}

module.exports = db;
