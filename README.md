# ✦ TaskFlow — Full-Stack Task Manager

**Student:** Lethukuthula  
**Module:** INFS 202  
**Project:** Midterm Individual Project (Frontend + Backend)

---

## 📋 Project Description

TaskFlow is a full-stack productivity web application that allows users to manage their daily tasks. Users can register, log in, and perform full CRUD operations on their tasks — including adding, editing, deleting, filtering by priority/status, and marking tasks complete.

The application consists of:
- A **React** single-page frontend (Vite + React Router v6)
- A **Node.js / Express** REST API backend with JWT authentication
- A **SQLite** database for persistent storage

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | Component-based UI |
| React Router v6 | Client-side routing |
| Vite | Build tool & dev server |
| Custom CSS | Responsive styling |
| Context API | Global state management |

### Backend
| Technology | Purpose |
|---|---|
| Node.js | Runtime environment |
| Express.js | REST API framework |
| better-sqlite3 | SQL database |
| bcryptjs | Secure password hashing |
| jsonwebtoken | JWT authentication |
| express-validator | Input validation |
| helmet | Security headers |
| cors | Cross-origin resource sharing |
| express-rate-limit | Rate limiting / abuse prevention |
| morgan | HTTP request logging |

---

## 📁 Project Structure

```
taskflow/                    ← Frontend (React + Vite)
├── src/
│   ├── components/
│   │   ├── Navbar.jsx       ← Site navigation
│   │   ├── TaskCard.jsx     ← Individual task display card
│   │   └── StatsBar.jsx     ← Task summary statistics
│   ├── context/
│   │   ├── AuthContext.jsx  ← JWT auth state
│   │   └── TaskContext.jsx  ← Task CRUD state (API-connected)
│   ├── pages/
│   │   ├── HomePage.jsx     ← Landing page (route: /)
│   │   ├── ListPage.jsx     ← Task list with filters (route: /tasks)
│   │   ├── DetailPage.jsx   ← View/edit task (route: /tasks/:id)
│   │   ├── AddTaskPage.jsx  ← Add task form (route: /add)
│   │   └── LoginPage.jsx    ← Login / Register (route: /login)
│   ├── services/
│   │   └── api.js           ← All HTTP calls to backend
│   ├── App.jsx              ← Routes + auth guard
│   └── main.jsx             ← React entry point
├── index.html
├── package.json
└── vite.config.js

taskflow-backend/            ← Backend (Node.js + Express)
├── src/
│   ├── controllers/
│   │   ├── authController.js   ← Register, login, me
│   │   └── taskController.js   ← Full CRUD for tasks
│   ├── middleware/
│   │   ├── auth.js             ← JWT verification middleware
│   │   └── errorHandler.js     ← Centralised error handling
│   ├── models/
│   │   └── db.js               ← SQLite schema + connection
│   ├── routes/
│   │   ├── auth.js             ← /api/auth/* routes
│   │   └── tasks.js            ← /api/tasks/* routes
│   └── app.js                  ← Express server entry point
├── .env.example
├── package.json
└── taskflow.db                 ← Auto-created on first run
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js v18 or higher
- npm v8 or higher

---

### 1 — Backend Setup

```bash
# Navigate to the backend folder
cd taskflow-backend

# Install dependencies
npm install

# Create your environment file
cp .env.example .env
```

Open `.env` and set your values:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5173
DB_PATH=./taskflow.db
```

> **Generate a secure JWT_SECRET:**  
> `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

```bash
# Start the backend (development mode with auto-reload)
npm run dev

# OR start without nodemon
npm start
```

The API will be running at: **http://localhost:5000**  
Health check: **http://localhost:5000/health**

---

### 2 — Frontend Setup

```bash
# Navigate to the frontend folder
cd taskflow

# Install dependencies
npm install

# Create your environment file
cp .env.example .env
```

Open `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

```bash
# Start the development server
npm run dev
```

The app will open at: **http://localhost:5173**

---

### 3 — Using the App

1. Open **http://localhost:5173** in your browser
2. Click **Register** to create a new account
3. After login you will be redirected to the Home page
4. Use **+ Add Task** to create tasks
5. Browse and filter tasks on the **Browse** page
6. Click any task to view full details, edit, or delete it

---

## 🌐 API Reference

### Authentication

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/auth/register` | Create a new account | ✗ |
| POST | `/api/auth/login` | Login and receive JWT token | ✗ |
| GET | `/api/auth/me` | Get current logged-in user | ✓ |

### Tasks (all require `Authorization: Bearer <token>`)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tasks` | Get all tasks for logged-in user |
| GET | `/api/tasks/:id` | Get a single task |
| POST | `/api/tasks` | Create a new task |
| PUT | `/api/tasks/:id` | Update an existing task |
| DELETE | `/api/tasks/:id` | Delete a task |

#### Query Parameters for GET /api/tasks

| Param | Values | Description |
|---|---|---|
| `status` | pending, active, completed | Filter by status |
| `priority` | high, medium, low | Filter by priority |
| `search` | any string | Search title & description |
| `sort` | oldest, priority, due | Sort order (default: newest) |

---

## 🔒 Security Features

- Passwords hashed with **bcrypt** (12 salt rounds)
- **JWT** tokens with configurable expiry
- **Helmet.js** sets secure HTTP headers
- **CORS** configured to allow only the frontend origin
- **Rate limiting**: 200 req/15min global; 20 req/15min for auth routes
- Input validated with **express-validator** on all endpoints
- Users can only access **their own tasks** (ownership enforced server-side)
- Secrets stored in **environment variables** (never hardcoded)

---

## 🗃 Database Schema

```sql
-- Users
CREATE TABLE users (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL,
  email      TEXT    NOT NULL UNIQUE,
  password   TEXT    NOT NULL,      -- bcrypt hash
  created_at TEXT    DEFAULT (datetime('now'))
);

-- Tasks (belongs to users via foreign key)
CREATE TABLE tasks (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT    NOT NULL,
  description TEXT    DEFAULT '',
  priority    TEXT    DEFAULT 'medium' CHECK(priority IN ('high','medium','low')),
  status      TEXT    DEFAULT 'pending' CHECK(status IN ('pending','active','completed')),
  category    TEXT    DEFAULT 'General',
  due_date    TEXT    DEFAULT NULL,
  created_at  TEXT    DEFAULT (datetime('now')),
  updated_at  TEXT    DEFAULT (datetime('now'))
);
```

---

## 🌍 Deployment

### Deploy Backend (Render.com — free)

1. Push `taskflow-backend/` to a GitHub repository
2. Go to [render.com](https://render.com) → **New Web Service**
3. Connect your GitHub repo
4. Set:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Add environment variables in Render dashboard (same as `.env`)
6. Deploy — Render gives you a live URL like `https://taskflow-api.onrender.com`

### Deploy Frontend (Vercel — free)

1. Push `taskflow/` to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import your repo
4. Set environment variable:
   - `VITE_API_URL` = your Render backend URL + `/api`  
     e.g. `https://taskflow-api.onrender.com/api`
5. Deploy — Vercel gives you a live URL

---

## 📝 Academic Notes

### Rubric Coverage

| Criteria | Implementation |
|---|---|
| React components (min 5) | Navbar, TaskCard, StatsBar, LoginPage, AddTaskPage, DetailPage, ListPage, HomePage — **8 components/pages** |
| React Router routing | `/`, `/tasks`, `/tasks/:id`, `/add`, `/login` |
| Form + validation | Add task form, Login/Register form — both with controlled inputs + field-level validation |
| Responsive design | Custom CSS with media queries, mobile hamburger nav |
| Code organisation | Separated into components/, pages/, context/, services/ |
| README | This file |
| RESTful API | Full CRUD via Express — GET, POST, PUT, DELETE |
| Authentication | JWT register/login, protected routes, token stored in localStorage |
| Error handling | Centralised errorHandler middleware, try/catch on all controllers |
| Environment variables | All secrets in `.env`, documented in `.env.example` |
| SQL database | SQLite with users + tasks tables, foreign key relationship |
| Data integrity | CHECK constraints, bcrypt password hashing, ownership checks |
| CORS | Configured to allow frontend origin only |

---

*INFS 202 — Midterm Project*
