// ============================================
// Standardized API Response Helpers
// ============================================

/**
 * Send success response
 * @param {Response} res - Express response object
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 */
export const successResponse = (res, data = null, message = "Success", statusCode = 200) => {
  const response = {
    success: true,
    message,
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send error response
 * @param {Response} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {*} errors - Additional error details
 */
export const errorResponse = (res, message = "Something went wrong", statusCode = 400, errors = null) => {
  const response = {
    success: false,
    message,
  };

  if (errors !== null) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

// ============================================
// Common Response Shortcuts
// ============================================

// 200 OK
export const ok = (res, data, message = "Success") => {
  return successResponse(res, data, message, 200);
};

// 201 Created
export const created = (res, data, message = "Created successfully") => {
  return successResponse(res, data, message, 201);
};

// 204 No Content
export const noContent = (res) => {
  return res.status(204).send();
};

// 400 Bad Request
export const badRequest = (res, message = "Bad request", errors = null) => {
  return errorResponse(res, message, 400, errors);
};

// 401 Unauthorized
export const unauthorized = (res, message = "Unauthorized access") => {
  return errorResponse(res, message, 401);
};

// 403 Forbidden
export const forbidden = (res, message = "Access forbidden") => {
  return errorResponse(res, message, 403);
};

// 404 Not Found
export const notFound = (res, message = "Resource not found") => {
  return errorResponse(res, message, 404);
};

// 409 Conflict
export const conflict = (res, message = "Resource already exists") => {
  return errorResponse(res, message, 409);
};

// 422 Unprocessable Entity (Validation errors)
export const validationError = (res, errors, message = "Validation failed") => {
  return errorResponse(res, message, 422, errors);
};

// 429 Too Many Requests
export const tooManyRequests = (res, message = "Too many requests, please try again later") => {
  return errorResponse(res, message, 429);
};

// 500 Internal Server Error
export const serverError = (res, message = "Internal server error") => {
  return errorResponse(res, message, 500);
};

// ============================================
// Paginated Response
// ============================================

/**
 * Send paginated response
 * @param {Response} res - Express response object
 * @param {Array} data - Array of items
 * @param {Object} pagination - Pagination metadata
 * @param {string} message - Success message
 */
export const paginatedResponse = (res, data, pagination, message = "Success") => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination,
  });
};

// ============================================
// Response with Token (for auth)
// ============================================

/**
 * Send response with auth token
 * @param {Response} res - Express response object
 * @param {*} data - User data
 * @param {string} token - JWT token
 * @param {string} message - Success message
 */
export const authResponse = (res, data, token, message = "Success") => {
  return res.status(200).json({
    success: true,
    message,
    data,
    token,
  });
};

// ============================================
// Usage Examples
// ============================================
/*
import { ok, created, notFound, badRequest, validationError, authResponse } from "./apiResponse.js";

// GET - Fetch users
const getUsers = async (req, res) => {
  const users = await User.find();
  return ok(res, users, "Users fetched successfully");
};

// POST - Create user
const createUser = async (req, res) => {
  const user = await User.create(req.body);
  return created(res, user, "User created successfully");
};

// GET - Single user
const getUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return notFound(res, "User not found");
  }
  return ok(res, user);
};

// POST - Login
const login = async (req, res) => {
  const { email, password } = req.body;
  
  const user = await User.findOne({ email });
  if (!user || !user.matchPassword(password)) {
    return badRequest(res, "Invalid email or password");
  }
  
  const token = user.generateToken();
  return authResponse(res, user, token, "Login successful");
};

// POST - With validation errors
const register = async (req, res) => {
  const errors = validateUser(req.body);
  if (errors.length > 0) {
    return validationError(res, errors, "Please fix the following errors");
  }
  // Continue registration...
};

// Response Examples:

// Success Response
{
  "success": true,
  "message": "Users fetched successfully",
  "data": [...]
}

// Error Response
{
  "success": false,
  "message": "User not found"
}

// Validation Error Response
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email format" },
    { "field": "password", "message": "Password must be at least 8 characters" }
  ]
}

// Auth Response
{
  "success": true,
  "message": "Login successful",
  "data": { "id": "...", "name": "John", "email": "john@example.com" },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
*/
