// Global error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error(`Error: ${err.message}`);

  // Set status code
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

  // Send error response
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

// Not Found middleware
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export { errorHandler, notFound };
