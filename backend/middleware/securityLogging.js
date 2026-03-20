/**
 * Security Logging Middleware
 * Logs security-relevant events for audit trails
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOG_DIR = path.join(__dirname, "..", "logs");

// Create logs directory if it doesn't exist
if (!fs.existsSync(LOG_DIR)) {
  try {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  } catch (err) {
    console.error("Failed to create logs directory:", err);
  }
}

// In-memory log storage (last 1000 events)
const logBuffer = [];
const MAX_LOG_BUFFER = 1000;

/**
 * Write log to file
 */
const writeLogToFile = (logType, data) => {
  const timestamp = new Date().toISOString();
  const logFile = path.join(LOG_DIR, `${logType}.log`);

  const logEntry = {
    timestamp,
    ...data,
  };

  try {
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + "\n", "utf8");
  } catch (err) {
    console.error(`Failed to write to ${logType} log:`, err);
  }

  // Keep in-memory buffer
  logBuffer.push(logEntry);
  if (logBuffer.length > MAX_LOG_BUFFER) {
    logBuffer.shift();
  }
};

/**
 * Log authentication attempts
 */
export const logAuthAttempt = (email, success, ipAddress, userAgent) => {
  writeLogToFile("auth-attempts", {
    email: email || "unknown",
    success,
    ipAddress,
    userAgent: userAgent || "unknown",
    type: "auth_attempt",
  });
};

/**
 * Log failed login attempts
 */
export const logFailedLogin = (
  email,
  ipAddress,
  reason = "invalid_credentials",
) => {
  writeLogToFile("security", {
    event: "failed_login",
    email: email || "unknown",
    ipAddress,
    reason,
  });
};

/**
 * Log password changes
 */
export const logPasswordChange = (userId, email, ipAddress) => {
  writeLogToFile("security", {
    event: "password_changed",
    userId,
    email,
    ipAddress,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Log unauthorized access attempts
 */
export const logUnauthorizedAccess = (userId, endpoint, ipAddress, reason) => {
  writeLogToFile("security", {
    event: "unauthorized_access_attempt",
    userId: userId || "anonymous",
    endpoint,
    ipAddress,
    reason,
  });
};

/**
 * Log suspicious requests
 */
export const logSuspiciousRequest = (ipAddress, reason, details) => {
  writeLogToFile("security", {
    event: "suspicious_request",
    ipAddress,
    reason,
    details,
  });
};

/**
 * Log admin actions
 */
export const logAdminAction = (userId, action, targetId, details = {}) => {
  writeLogToFile("admin-actions", {
    userId,
    action,
    targetId,
    ...details,
  });
};

/**
 * Log payment-related events
 */
export const logPaymentEvent = (
  userId,
  orderId,
  event,
  status,
  details = {},
) => {
  writeLogToFile("payment-events", {
    userId,
    orderId,
    event,
    status,
    ...details,
  });
};

/**
 * Log rate limit violations
 */
export const logRateLimitViolation = (
  ipAddress,
  endpoint,
  limit,
  details = {},
) => {
  writeLogToFile("security", {
    event: "rate_limit_violation",
    ipAddress,
    endpoint,
    limit,
    ...details,
  });
};

/**
 * Security logging middleware
 */
export const securityLoggingMiddleware = (req, res, next) => {
  // Store original send function
  const originalSend = res.send;

  // Override send function to log responses
  res.send = function (data) {
    // Log failed authentications
    if (res.statusCode === 401) {
      logFailedLogin(req.body?.email, req.ip, "authentication_failed");
    }

    // Log unauthorized access attempts
    if (res.statusCode === 403) {
      logUnauthorizedAccess(req.userId, req.path, req.ip, "access_denied");
    }

    // Log admin actions
    if (
      req.path.includes("/admin") &&
      ["POST", "PUT", "DELETE"].includes(req.method)
    ) {
      logAdminAction(req.userId, req.method, req.params.id, {
        path: req.path,
        statusCode: res.statusCode,
      });
    }

    // Call original send
    return originalSend.call(this, data);
  };

  next();
};

/**
 * Get recent logs (for monitoring)
 */
export const getRecentLogs = (count = 100) => {
  return logBuffer.slice(-count);
};

/**
 * Clear old log files (older than threshold)
 */
export const cleanupOldLogs = (thresholdDays = 30) => {
  const threshold = Date.now() - thresholdDays * 24 * 60 * 60 * 1000;

  try {
    const files = fs.readdirSync(LOG_DIR);
    files.forEach((file) => {
      const filePath = path.join(LOG_DIR, file);
      const stat = fs.statSync(filePath);
      if (stat.mtimeMs < threshold) {
        fs.unlinkSync(filePath);
        console.log(`Deleted old log file: ${file}`);
      }
    });
  } catch (err) {
    console.error("Error cleaning up log files:", err);
  }
};

// Schedule log cleanup every day
setInterval(
  () => {
    cleanupOldLogs();
  },
  24 * 60 * 60 * 1000,
);
