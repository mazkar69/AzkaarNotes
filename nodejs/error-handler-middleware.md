# Node.js Error Handler Middleware

This document provides a comprehensive guide on implementing global error handling middleware in Node.js Express applications.

## Overview

Error handling middleware is essential for catching and processing errors in Express applications. It provides a centralized way to handle errors and send consistent error responses to clients.

## Implementation

### 1. Error Handler Middleware File

Create a file `middleware/errorHandler.js` with the following content:

```javascript
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
```

### 2. Server Implementation

In your main server file (usually `server.js` or `app.js`), add the middleware:

```javascript
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Your other middleware and routes...

// Error handling middleware
// 404 handler for undefined routes
app.use(notFound);

// Global error handler - must be the last middleware
app.use(errorHandler);
```

## Middleware Components

### Error Handler (`errorHandler`)

- **Purpose**: Catches all errors that occur in the application
- **Parameters**:
  - `err`: The error object
  - `req`: Express request object
  - `res`: Express response object
  - `next`: Express next function
- **Functionality**:
  - Logs the error message to console
  - Sets appropriate status code (uses existing status or defaults to 500)
  - Returns JSON response with error details
  - Conditionally includes stack trace (only in development)

### Not Found Handler (`notFound`)

- **Purpose**: Handles requests to undefined routes
- **Parameters**:
  - `req`: Express request object
  - `res`: Express response object
  - `next`: Express next function
- **Functionality**:
  - Creates a 404 error for undefined routes
  - Sets status code to 404
  - Passes error to the global error handler

## Key Features

### 1. Environment-Aware Stack Traces
```javascript
stack: process.env.NODE_ENV === 'production' ? null : err.stack
```
- Shows detailed error stack traces in development
- Hides stack traces in production for security

### 2. Consistent Error Response Format
```javascript
{
  success: false,
  message: "Error message",
  stack: "Error stack trace (development only)"
}
```

### 3. Proper Status Code Handling
- Uses existing status code if already set
- Defaults to 500 (Internal Server Error) if not set
- 404 specifically handled for undefined routes

## Usage Examples

### Basic Error Throwing
```javascript
// In your route handlers
app.get('/api/users/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    res.json(user);
  } catch (error) {
    next(error); // Pass error to error handler
  }
});
```

### Custom Error with Status Code
```javascript
app.post('/api/users', async (req, res, next) => {
  try {
    const { email } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400);
      throw new Error('User already exists');
    }
    // Create user logic...
  } catch (error) {
    next(error);
  }
});
```

## Best Practices

### 1. Middleware Order
- Place error handling middleware **after** all routes and other middleware
- The `notFound` middleware should come before the `errorHandler`
- Error handling middleware must be the **last** middleware

### 2. Error Logging
- Always log errors for debugging purposes
- Consider using a logging library like Winston for production
- Include relevant context (user ID, request ID, etc.)

### 3. Security Considerations
- Never expose sensitive information in error messages
- Hide stack traces in production
- Sanitize error messages before sending to client

### 4. Environment Configuration
Make sure to set `NODE_ENV` environment variable:
```bash
# Development
NODE_ENV=development

# Production
NODE_ENV=production
```

## Common Error Scenarios

### 1. Database Connection Errors
```javascript
// MongoDB connection error handling
mongoose.connect(process.env.MONGO_URI)
  .catch(err => {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  });
```

### 2. Validation Errors
```javascript
// Express validator error handling
const { validationResult } = require('express-validator');

app.post('/api/users', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    const error = new Error('Validation failed');
    error.details = errors.array();
    return next(error);
  }
  // Continue with user creation...
});
```

### 3. Async/Await Error Handling
```javascript
// Utility function to wrap async route handlers
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Usage
app.get('/api/users', asyncHandler(async (req, res) => {
  const users = await User.find();
  res.json(users);
}));
```

## Testing Error Handlers

### Unit Testing
```javascript
const request = require('supertest');
const app = require('../app');

describe('Error Handling', () => {
  test('should return 404 for undefined routes', async () => {
    const response = await request(app)
      .get('/api/nonexistent')
      .expect(404);
    
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Not Found');
  });

  test('should handle server errors', async () => {
    // Test with a route that throws an error
    const response = await request(app)
      .get('/api/error-test')
      .expect(500);
    
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBeDefined();
  });
});
```

## Related Resources

- [Express.js Error Handling Documentation](https://expressjs.com/en/guide/error-handling.html)
- [Node.js Error Handling Best Practices](https://nodejs.org/en/docs/guides/error-handling/)
- [HTTP Status Codes Reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)

## Conclusion

Implementing proper error handling middleware is crucial for building robust Node.js applications. This setup provides a solid foundation for catching, logging, and responding to errors in a consistent manner while maintaining security best practices.
