# 🔐 Security Implementation Guide - 90PlusStore

This document provides step-by-step instructions for implementing and testing the security hardening applied to the 90PlusStore e-commerce application.

## Table of Contents

1. [Installation & Setup](#installation--setup)
2. [Environment Configuration](#environment-configuration)
3. [Rate Limiting Setup](#rate-limiting-setup)
4. [Testing Security Features](#testing-security-features)
5. [Frontend Integration](#frontend-integration)
6. [Production Deployment](#production-deployment)

---

## Installation & Setup

### 1. Install Dependencies

All required packages are already in `package.json`. Install them if not already done:

```bash
cd backend
npm install

# Verify key security packages:
npm list bcryptjs cors express-validator jsonwebtoken redis
```

**Key Security Packages:**

- `bcryptjs` - Password hashing
- `express-validator` - Input validation
- `redis` - Distributed rate limiting
- `cors` - Cross-Origin Resource Sharing protection
- `jsonwebtoken` - JWT token management

### 2. Verify New Middleware Files

Ensure these new security middleware files exist:

```bash
backend/middleware/
├── rateLimiter.js           # Rate limiting (Redis + fallback)
├── securityHeaders.js       # HTTP security headers
├── csrfProtection.js        # CSRF token protection
├── validation.js            # Input validation & sanitization
├── securityLogging.js       # Audit logging
└── auth.js                  # (already exists - Enhanced)

backend/logs/                # Auto-created directory for logs
├── auth-attempts.log
├── security.log
├── admin-actions.log
└── payment-events.log
```

### 3. Verify Updated Files

These files have been updated with security enhancements:

```bash
backend/
├── server.js                # Added middleware layers
├── package.json             # Dependencies verified
├── models/
│   └── Order.js            # Removed payment card fields
│   └── User.js             # Updated password requirements
├── controllers/
│   ├── authController.js   # Enhanced password validation, logging
│   └── orderController.js  # Server-side price validation
└── routes/
    ├── authRoutes.js       # Rate limiting, CSRF, removed make-admin
    ├── orderRoutes.js      # Added rate limiting, CSRF
    └── productRoutes.js    # Added rate limiting, CSRF
```

---

## Environment Configuration

### 1. Create `.env` File

Create `backend/.env` with secure values:

```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/90plusstore

# JWT Secret (use 32+ character random string!)
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_random

# Redis (optional, for distributed rate limiting)
REDIS_URL=redis://localhost:6379
# For Redis Cloud: redis://default:password@host:port

# Application
NODE_ENV=development  # Change to 'production' when deploying
PORT=5000

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000,http://localhost:5173

# Payment Gateway (when integrated)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
# Or Razorpay:
# RAZORPAY_KEY_ID=rzp_test_...
# RAZORPAY_KEY_SECRET=...
```

### 2. Generate Secure JWT Secret

```bash
# On Linux/Mac:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# On Windows (PowerShell):
$bytes = [byte[]][char[]]"$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")"
$hex = [System.BitConverter]::ToString($bytes) -replace '-'
Write-Host $hex
```

Copy the output and use as `JWT_SECRET`.

### 3. Verify Environment Variables

```bash
# Test that env variables are loaded:
node -e "require('dotenv').config(); console.log('MONGODB_URI:', !!process.env.MONGODB_URI); console.log('JWT_SECRET:', !!process.env.JWT_SECRET);"
```

---

## Rate Limiting Setup

### Option A: Redis-Based Rate Limiting (Recommended for Production)

#### 1. Install Redis Locally (Development)

**Windows:**

```bash
# Using Scoop
scoop install redis

# Start Redis:
redis-server
```

**Linux/Mac:**

```bash
# Using Homebrew:
brew install redis

# Start Redis:
redis-server

# Install globally (Ubuntu):
sudo apt-get install redis-server
sudo service redis-server start
```

#### 2. Configure in `.env`

```bash
REDIS_URL=redis://localhost:6379
```

#### 3. Test Redis Connection

```javascript
// Create test-redis.js
import redis from "redis";

const client = redis.createClient({ url: "redis://localhost:6379" });

client.on("connect", () => {
  console.log("✓ Redis connected");
  client.disconnect();
});

client.on("error", (err) => {
  console.error("✗ Redis error:", err);
});

await client.connect();
```

```bash
node test-redis.js
# Output: ✓ Redis connected
```

#### 4. Redis Cloud (Production)

For managed Redis, use **Redis Cloud** or **AWS ElastiCache**:

```bash
# Redis Cloud connection string format:
REDIS_URL=redis://default:password@host.redis.cloud:port

# Test connection:
redis-cli -u redis://default:password@host:port
```

### Option B: In-Memory Rate Limiting (Fallback)

If Redis is not available, rate limiting falls back to in-memory storage. This works for single-server deployments but won't work across multiple servers.

---

## Testing Security Features

### 1. Test Rate Limiting

#### Login Rate Limiting Test

```bash
#!/bin/bash
# Test that login is limited to 5 attempts per minute

echo "Testing login rate limiting (limit: 5 per minute)..."

for i in {1..7}; do
  echo -e "\n--- Attempt $i ---"

  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}' \
    -w "\nHTTP Status: %{http_code}\n"

  sleep 2
done

# Expected output:
# Attempts 1-5: 401 (Invalid credentials)
# Attempts 6-7: 429 (Too many requests)
```

#### Signup Rate Limiting Test

```bash
#!/bin/bash
# Test signup limited to 10 per hour

echo "Testing signup rate limiting (limit: 10 per hour)..."

for i in {1..12}; do
  echo -e "\n--- Signup Attempt $i ---"

  curl -X POST http://localhost:5000/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Test User '$i'",
      "email": "test'$i'@example.com",
      "password": "TestPass123@'"''"'"'
    }' \
    -w "\nHTTP Status: %{http_code}\n"

  sleep 1
done

# Expected:
# First 10: 201 (Created) or 400 (validation error)
# 11th+: 429 (Rate limit exceeded)
```

### 2. Test CSRF Protection

#### Missing CSRF Token

```bash
# Test that requests without CSRF token are rejected

curl -X PUT http://localhost:5000/api/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token_here>" \
  -d '{"name": "New Name"}'

# Expected response: 403 Forbidden
# {
#   "success": false,
#   "message": "CSRF token missing"
# }
```

#### With CSRF Token

```bash
# 1. Get CSRF token from login/profile response
# Token appears in header: X-CSRF-Token

# 2. Use token in request
curl -X PUT http://localhost:5000/api/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -H "X-CSRF-Token: <csrf_token_from_response>" \
  -d '{"name": "New Name"}'

# Expected: 200 OK (successful)
```

### 3. Test Input Validation

#### Weak Password Rejection

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "weak"
  }'

# Expected: 400 Bad Request
# {
#   "success": false,
#   "message": "Password must be at least 8 characters long"
# }
```

#### Valid Password Registration

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test'$RANDOM'@example.com",
    "password": "SecurePass123@"
  }'

# Expected: 201 Created
# {
#   "success": true,
#   "message": "User registered successfully",
#   "token": "eyJhbGc...",
#   "user": {...}
# }
```

### 4. Test Request Size Limits

```bash
# Create a large payload (> 10KB)

curl -X POST http://localhost:5000/api/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  --data-binary @large_file.json

# Expected: 413 Payload Too Large
```

### 5. Test Security Headers

```bash
# Check if security headers are present

curl -i http://localhost:5000/api/health

# Should include headers:
# X-Frame-Options: SAMEORIGIN
# X-Content-Type-Options: nosniff
# Content-Security-Policy: default-src 'self'; ...
# Strict-Transport-Security: max-age=31536000; ...
# Referrer-Policy: strict-origin-when-cross-origin
```

### 6. Test Price Validation

```bash
# Attempt to manipulate order price

curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -H "X-CSRF-Token: <csrf_token>" \
  -d '{
    "products": [
      {
        "productId": "507f1f77bcf86cd799439011",
        "quantity": 2
      }
    ],
    "clientTotalPrice": 0.01,
    "shippingAddress": {...}
  }'

# Expected: 400 Bad Request
# {
#   "success": false,
#   "message": "Order total mismatch. Please refresh cart and try again."
# }
```

### 7. Check Audit Logs

```bash
# View security audit logs

cat backend/logs/auth-attempts.log | head -10
cat backend/logs/security.log | head -10
cat backend/logs/admin-actions.log | head -10

# Or use jq for pretty formatting:
cat backend/logs/security.log | jq . | head -20
```

---

## Frontend Integration

### 1. CSRF Token Management

```javascript
// In your API service (src/services/api.js)

import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Store CSRF token from responses
let csrfToken = localStorage.getItem("csrfToken");

// Add CSRF token to all requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Add CSRF token for non-GET requests
  if (
    ["POST", "PUT", "PATCH", "DELETE"].includes(config.method?.toUpperCase())
  ) {
    config.headers["X-CSRF-Token"] = csrfToken;
  }

  return config;
});

// Capture CSRF token from response headers
apiClient.interceptors.response.use((response) => {
  const xcsrfToken = response.headers["x-csrf-token"];
  if (xcsrfToken) {
    csrfToken = xcsrfToken;
    localStorage.setItem("csrfToken", xcsrfToken);
  }
  return response;
});

export default apiClient;
```

### 2. Signup Form - Show Password Requirements

```jsx
// src/pages/Register.jsx

function Register() {
  const [password, setPassword] = useState("");

  const passwordRequirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[@$!%*?&-_]/.test(password),
  };

  const isStrongPassword = Object.values(passwordRequirements).every((v) => v);

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter password"
      />

      <div className="password-requirements">
        <h4>Password Requirements:</h4>
        <ul>
          <li className={passwordRequirements.minLength ? "met" : "unmet"}>
            ✓ At least 8 characters
          </li>
          <li className={passwordRequirements.hasUppercase ? "met" : "unmet"}>
            ✓ One uppercase letter (A-Z)
          </li>
          <li className={passwordRequirements.hasLowercase ? "met" : "unmet"}>
            ✓ One lowercase letter (a-z)
          </li>
          <li className={passwordRequirements.hasNumber ? "met" : "unmet"}>
            ✓ One number (0-9)
          </li>
          <li className={passwordRequirements.hasSpecialChar ? "met" : "unmet"}>
            ✓ One special character (@$!%*?&-_)
          </li>
        </ul>
      </div>

      <button disabled={!isStrongPassword} type="submit">
        Register
      </button>
    </form>
  );
}
```

### 3. Handle Rate Limiting Errors

```javascript
// In your API error handler

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 429) {
      // Rate limited
      const retryAfter = error.response.headers["x-ratelimit-reset"];
      showError(
        `Too many requests. Please try again after ${retryAfter} seconds.`,
      );
      return Promise.reject(error);
    }

    if (error.response?.status === 403) {
      // CSRF token invalid
      if (error.response.data?.message?.includes("CSRF")) {
        // Refresh CSRF token and retry
        localStorage.removeItem("csrfToken");
        showError("Security token expired. Retrying...");
      }
    }

    return Promise.reject(error);
  },
);
```

---

## Production Deployment

### 1. Environment Configuration

```bash
# .env (Production)
NODE_ENV=production
MONGODB_URI=mongodb+srv://prod_user:password@prod-cluster.mongodb.net/90plusstore
JWT_SECRET=<32+ char random string>
REDIS_URL=redis://default:password@prod-redis.redis.cloud:port
FRONTEND_URL=https://yourdomain.com,https://www.yourdomain.com
PORT=5000
```

### 2. HTTPS/TLS Setup

#### Using Nginx

```nginx
# /etc/nginx/sites-available/90plusstore

upstream backend {
  server localhost:5000;
}

server {
  listen 80;
  server_name yourdomain.com;

  # Redirect HTTP to HTTPS
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  server_name yourdomain.com;

  # SSL Certificate
  ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

  # Security headers
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
  add_header X-Frame-Options "SAMEORIGIN" always;
  add_header X-Content-Type-Options "nosniff" always;

  # Proxy to backend
  location /api/ {
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }

  # Frontend
  location / {
    proxy_pass http://frontend-app;  # Your frontend server
  }
}
```

### 3. Process Management

#### Using PM2

```bash
# Install PM2
npm install -g pm2

# Create ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: '90plusstore-backend',
      script: './server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log'
    }
  ]
};
EOF

# Start application
pm2 start ecosystem.config.js

# Monitor
pm2 monit

# Logs
pm2 logs
```

### 4. Database Backups

```bash
# Automated MongoDB backup (daily)

cat > backup-mongodb.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/backups/mongodb"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="$BACKUP_DIR/backup_$TIMESTAMP"

mkdir -p $BACKUP_DIR

mongodump \
  --uri="mongodb+srv://user:password@cluster/90plusstore" \
  --out=$BACKUP_PATH

# Keep only last 30 days
find $BACKUP_DIR -mindepth 1 -maxdepth 1 -type d -mtime +30 -exec rm -rf {} +

echo "Backup completed: $BACKUP_PATH"
EOF

chmod +x backup-mongodb.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /path/to/backup-mongodb.sh
```

### 5. Monitoring & Alerts

```javascript
// monitoring.js - Basic health check

import http from "http";

setInterval(() => {
  const startTime = Date.now();

  http
    .get("http://localhost:5000/api/health", (res) => {
      const duration = Date.now() - startTime;
      console.log(
        `[${new Date().toISOString()}] Health: ${res.statusCode} (${duration}ms)`,
      );

      if (duration > 5000) {
        console.warn("⚠️  Slow response detected");
        // Alert: send to monitoring service
      }
    })
    .on("error", (err) => {
      console.error("❌ Health check failed:", err);
      // Alert: send to monitoring service
    });
}, 60000); // Every minute
```

---

## Troubleshooting

### Issue: Rate limiter not working

**Solution:**

```bash
# Check Redis connection
redis-cli ping
# Should output: PONG

# If Redis not available, check logs for fallback to memory:
grep "falling back to memory" logs/app.log

# Memory-based rate limiting works for single instance
# For multi-instance deployments, Redis is required
```

### Issue: CSRF token mismatch

**Solution:**

```bash
# 1. Verify token is being sent in header:
curl -v -X PUT http://localhost:5000/api/auth/profile \
  -H "X-CSRF-Token: <token>"

# 2. Check if header is being received by server:
# Review securityLogging output

# 3. Client-side: Verify token is stored after login
console.log(localStorage.getItem('csrfToken'));
```

### Issue: Password validation too strict

**Solution:**
Adjust `validatePasswordStrength()` in `authController.js`:

```javascript
// Make requirements less strict (NOT recommended for production):
const validatePasswordStrength = (password) => {
  if (password.length < 6) return false; // Lowered from 8
  // Remove uppercase/special char requirements...
  return true;
};
```

---

## Contact & Support

For security-related questions or to report vulnerabilities:

- 📧 **Email:** security@yourdomain.com
- 🔒 **Security Policy:** See `SECURITY.md`
- 📋 **Issues:** Report security issues privately, not on GitHub

---

**Last Updated:** March 18, 2024  
**Version:** 1.0.0  
**Maintained By:** Security Engineering Team
