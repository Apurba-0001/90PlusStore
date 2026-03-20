/**
 * Security Headers Middleware
 * Implements OWASP security best practices
 */

export const securityHeaders = (req, res, next) => {
  // Prevent clickjacking attacks
  res.setHeader("X-Frame-Options", "SAMEORIGIN");

  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Enable XSS protection in older browsers
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Content Security Policy - restrictive but allows API calls
  // Adjust based on your CDN and API endpoints
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; " +
      "script-src 'self' 'wasm-unsafe-eval'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https:; " +
      "font-src 'self'; " +
      "connect-src 'self' https:; " +
      "frame-ancestors 'self'; " +
      "form-action 'self'; " +
      "base-uri 'self'; " +
      "object-src 'none'",
  );

  // HTTPS enforcement (Strict-Transport-Security)
  // Set to 1 year (31536000 seconds)
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload",
  );

  // Referrer Policy - don't leak referrer to external sites
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions Policy (formerly Feature-Policy)
  res.setHeader(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=(), payment=self",
  );

  // Remove server header to avoid revealing tech stack
  res.removeHeader("X-Powered-By");

  next();
};
