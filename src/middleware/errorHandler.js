// ============================================================
//  TaskFlow Backend – middleware/errorHandler.js
//  Centralised error handler. Must be registered LAST in app.js
// ============================================================

module.exports = function errorHandler(err, req, res, next) {
  // Log in dev, suppress in prod
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[ERROR] ${req.method} ${req.path}`, err);
  }

  // Express-validator errors forwarded as { status, errors }
  if (err.status && err.errors) {
    return res.status(err.status).json({ message: 'Validation failed', errors: err.errors });
  }

  // SQLite constraint violations
  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    return res.status(409).json({ message: 'That email is already registered.' });
  }

  // Default 500
  const status  = err.statusCode || err.status || 500;
  const message = status < 500 ? err.message : 'Something went wrong. Please try again.';
  return res.status(status).json({ message });
};
