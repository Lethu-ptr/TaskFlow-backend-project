//  TaskFlow Backend – models/db.js
//  SQLite database setup using better-sqlite3.
//  Tables: users, tasks

const Database = require('better-sqlite3');
const path     = require('path');
require('dotenv').config();

const DB_PATH = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : path.join(__dirname, '../../taskflow.db');

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Schema 
db.exec(`
  -- Users table
  CREATE TABLE IF NOT EXISTS users (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL,
    email      TEXT    NOT NULL UNIQUE,
    password   TEXT    NOT NULL,               -- bcrypt hash
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  -- Tasks table (belongs to a user)
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

module.exports = db;
