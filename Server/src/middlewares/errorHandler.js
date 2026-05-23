/**
 * Global Express error handler middleware.
 * Catches all errors thrown/passed via next(err) and returns a consistent JSON response.
 * Must be registered AFTER all routes in app.js.
 */
export const errorHandler = (err, req, res, next) => {
  const isDev = process.env.NODE_ENV !== 'production';
  
  // Log full error in development, minimal in production
  if (isDev) {
    console.error('❌ Unhandled Error:', err);
  } else {
    console.error(`❌ Error [${err.status || 500}]: ${err.message}`);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: messages
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(400).json({
      success: false,
      message: `Duplicate value for ${field}`
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expired' });
  }

  // Cast error (invalid MongoDB ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid ID format' });
  }

  // Default server error
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(isDev && { stack: err.stack })
  });
};
