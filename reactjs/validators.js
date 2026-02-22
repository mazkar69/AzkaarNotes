// ============================================
// Email Validator
// ============================================

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
export const isValidEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
};

/**
 * Validate email with detailed response
 * @param {string} email - Email to validate
 * @returns {Object} Validation result with message
 */
export const validateEmail = (email) => {
    if (!email) {
        return { isValid: false, message: "Email is required" };
    }

    if (typeof email !== "string") {
        return { isValid: false, message: "Email must be a string" };
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (trimmedEmail.length > 254) {
        return { isValid: false, message: "Email is too long" };
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(trimmedEmail)) {
        return { isValid: false, message: "Invalid email format" };
    }

    return { isValid: true, message: "Valid email", email: trimmedEmail };
};

// ============================================
// Phone Validator
// ============================================

/**
 * Validate phone number (Indian format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} Is valid phone
 */
export const isValidPhone = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
};

/**
 * Validate international phone number
 * @param {string} phone - Phone with country code
 * @returns {boolean} Is valid phone
 */
export const isValidInternationalPhone = (phone) => {
    const phoneRegex = /^\+?[1-9]\d{6,14}$/;
    return phoneRegex.test(phone.replace(/[\s-]/g, ""));
};

// ============================================
// Password Validator
// ============================================

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with details
 */
export const validatePassword = (password) => {
    const errors = [];

    if (!password || password.length < 8) {
        errors.push("Password must be at least 8 characters long");
    }
    if (!/[A-Z]/.test(password)) {
        errors.push("Password must contain at least one uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
        errors.push("Password must contain at least one lowercase letter");
    }
    if (!/[0-9]/.test(password)) {
        errors.push("Password must contain at least one number");
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push("Password must contain at least one special character");
    }

    return {
        isValid: errors.length === 0,
        errors,
        strength: getPasswordStrength(password),
    };
};

/**
 * Get password strength score
 * @param {string} password - Password to check
 * @returns {string} Strength level
 */
const getPasswordStrength = (password) => {
    let score = 0;
    if (!password) return "weak";

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

    if (score <= 2) return "weak";
    if (score <= 4) return "medium";
    return "strong";
};

// ============================================
// URL Validator
// ============================================

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} Is valid URL
 */
export const isValidURL = (url) => {
    const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    return urlRegex.test(url);
};

/**
 * Validate URL with protocol required
 * @param {string} url - URL to validate
 * @returns {boolean} Is valid URL with protocol
 */
export const isValidURLStrict = (url) => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

// ============================================
// Username Validator
// ============================================

/**
 * Validate username
 * @param {string} username - Username to validate
 * @returns {Object} Validation result
 */
export const validateUsername = (username) => {
    const errors = [];

    if (!username || username.length < 3) {
        errors.push("Username must be at least 3 characters long");
    }
    if (username.length > 20) {
        errors.push("Username must not exceed 20 characters");
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        errors.push("Username can only contain letters, numbers, and underscores");
    }
    if (/^[0-9]/.test(username)) {
        errors.push("Username cannot start with a number");
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
};

// ============================================
// Common Regex Patterns
// ============================================
export const REGEX_PATTERNS = {
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    phoneIndia: /^[6-9]\d{9}$/,
    phoneInternational: /^\+?[1-9]\d{6,14}$/,
    url: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
    alphanumeric: /^[a-zA-Z0-9]+$/,
    alphanumericWithSpace: /^[a-zA-Z0-9 ]+$/,
    onlyLetters: /^[a-zA-Z]+$/,
    onlyNumbers: /^[0-9]+$/,
    mongoObjectId: /^[a-fA-F0-9]{24}$/,
    uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    ipv4: /^(\d{1,3}\.){3}\d{1,3}$/,
    hexColor: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
    creditCard: /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13})$/,
    postalCodeIndia: /^[1-9][0-9]{5}$/,
    panCard: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
    aadhaar: /^[2-9]{1}[0-9]{11}$/,
    gst: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
};

// ============================================
// Usage Example
// ============================================
/*
import { validateEmail, validatePassword, isValidPhone } from "./validators.js";

// In your controller
const registerUser = async (req, res) => {
  const { email, password, phone } = req.body;

  // Validate email
  const emailCheck = validateEmail(email);
  if (!emailCheck.isValid) {
    return res.status(400).json({ success: false, message: emailCheck.message });
  }

  // Validate password
  const passwordCheck = validatePassword(password);
  if (!passwordCheck.isValid) {
    return res.status(400).json({ success: false, errors: passwordCheck.errors });
  }

  // Validate phone
  if (!isValidPhone(phone)) {
    return res.status(400).json({ success: false, message: "Invalid phone number" });
  }

  // Continue with registration...
};
*/
