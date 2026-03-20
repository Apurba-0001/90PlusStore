/**
 * Input Validation and Sanitization Utilities
 * Protects against XSS, injection, and data validation attacks
 */

import { body, validationResult, query, param } from "express-validator";

/**
 * Sanitize and validate email
 */
export const validateEmail = body("email")
  .trim()
  .toLowerCase()
  .isEmail()
  .withMessage("Invalid email format")
  .normalizeEmail();

/**
 * Validate and sanitize password
 * Requirements: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
 */
export const validatePassword = body("password")
  .trim()
  .isLength({ min: 8 })
  .withMessage("Password must be at least 8 characters long")
  .matches(/[A-Z]/)
  .withMessage("Password must contain at least one uppercase letter")
  .matches(/[a-z]/)
  .withMessage("Password must contain at least one lowercase letter")
  .matches(/[0-9]/)
  .withMessage("Password must contain at least one number")
  .matches(/[@$!%*?&]/)
  .withMessage(
    "Password must contain at least one special character (@$!%*?&)",
  );

/**
 * Validate strong password (alternative for admin)
 */
export const validateStrongPassword = body("password")
  .trim()
  .isLength({ min: 12 })
  .withMessage("Password must be at least 12 characters long")
  .matches(/[A-Z]/)
  .withMessage("Password must contain uppercase letters")
  .matches(/[a-z]/)
  .withMessage("Password must contain lowercase letters")
  .matches(/[0-9]/)
  .withMessage("Password must contain numbers")
  .matches(/[@$!%*?&-_]/)
  .withMessage("Password must contain special characters");

/**
 * Sanitize and validate username/name
 */
export const validateName = body("name")
  .trim()
  .isLength({ min: 2, max: 100 })
  .withMessage("Name must be between 2 and 100 characters")
  .matches(/^[a-zA-Z\s'-]+$/)
  .withMessage(
    "Name can only contain letters, spaces, hyphens, and apostrophes",
  )
  .escape();

/**
 * Validate product price (no negative, reasonable limits)
 */
export const validatePrice = body("price")
  .isFloat({ min: 0, max: 999999.99 })
  .withMessage("Price must be between 0 and 999,999.99")
  .toFloat();

/**
 * Validate quantity (positive integer, reasonable limits)
 */
export const validateQuantity = body("quantity")
  .isInt({ min: 1, max: 10000 })
  .withMessage("Quantity must be between 1 and 10,000")
  .toInt();

/**
 * Validate product ID (MongoDB ObjectId format)
 */
export const validateMongoId = param("id")
  .matches(/^[0-9a-fA-F]{24}$/)
  .withMessage("Invalid product ID format");

/**
 * Validate search query (prevent injection)
 */
export const validateSearchQuery = query("search")
  .optional()
  .trim()
  .isLength({ max: 200 })
  .withMessage("Search query too long")
  .escape();

/**
 * Sanitize strings to prevent XSS
 */
export const sanitizeString = (str) => {
  return String(str).replace(
    /[&<>"'`=]/g,
    (s) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#x27;",
        "`": "&#x60;",
        "=": "&#x3D;",
      })[s],
  );
};

/**
 * Validate shipping/billing address
 */
export const validateAddress = body("address")
  .if((value) => value !== undefined && value !== null)
  .isObject()
  .withMessage("Address must be an object")
  .custom((address) => {
    if (address.houseNo) {
      if (typeof address.houseNo !== "string" || address.houseNo.length > 20) {
        throw new Error("House number is invalid");
      }
    }
    if (
      address.street &&
      (typeof address.street !== "string" || address.street.length > 100)
    ) {
      throw new Error("Street name is too long");
    }
    if (
      address.city &&
      (typeof address.city !== "string" || address.city.length > 50)
    ) {
      throw new Error("City name is too long");
    }
    if (
      address.state &&
      (typeof address.state !== "string" || address.state.length > 50)
    ) {
      throw new Error("State name is too long");
    }
    if (
      address.country &&
      (typeof address.country !== "string" || address.country.length > 50)
    ) {
      throw new Error("Country name is too long");
    }
    if (
      address.zipCode &&
      (typeof address.zipCode !== "string" || address.zipCode.length > 20)
    ) {
      throw new Error("Zip code is invalid");
    }
    return true;
  });

/**
 * Handle validation errors middleware
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((err) => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

/**
 * Validate request body is JSON (only for requests with body)
 * Skip GET, HEAD, OPTIONS requests
 */
export const validateJsonBody = (req, res, next) => {
  // Skip validation for methods that typically do not include a body.
  if (["GET", "HEAD", "OPTIONS", "DELETE"].includes(req.method)) {
    return next();
  }

  // For POST, PUT, PATCH - require application/json
  if (!req.is("application/json")) {
    return res.status(400).json({
      success: false,
      message: "Content-Type must be application/json",
    });
  }
  next();
};

/**
 * Prevent unusual request patterns (only for requests with body)
 */
export const validateBasePayload = (req, res, next) => {
  // Skip validation for methods that typically do not include a body.
  if (["GET", "HEAD", "OPTIONS", "DELETE"].includes(req.method)) {
    return next();
  }

  // Check for suspicious patterns in body
  if (req.body && typeof req.body === "object") {
    for (const [key, value] of Object.entries(req.body)) {
      // Check for prototype pollution
      if (key === "__proto__" || key === "constructor" || key === "prototype") {
        return res.status(400).json({
          success: false,
          message: "Invalid request payload",
        });
      }

      // Check for excessively nested objects (can cause parsing attacks)
      const depth = JSON.stringify(value).length;
      if (depth > 100000) {
        return res.status(400).json({
          success: false,
          message: "Request payload too large",
        });
      }
    }
  }

  next();
};
