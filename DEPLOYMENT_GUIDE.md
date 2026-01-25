# Deployment Guide for 90PlusStore

Complete guide to deploy 90PlusStore to production using Render for both frontend and backend.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Deploy Backend to Render](#deploy-backend-to-render)
- [Deploy Frontend to Render](#deploy-frontend-to-render)
- [Environment Variables](#environment-variables)
- [Security Checklist](#security-checklist)
- [Performance Optimization](#performance-optimization)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Troubleshooting](#troubleshooting)
- [Custom Domain Setup](#custom-domain-setup)

## Prerequisites

Before deploying, ensure you have:

- **GitHub account** (for hosting code)
- **Render account** (https://render.com - free)
- **MongoDB Atlas account** (with a cluster created)
- **ImageKit account** (with images uploaded)
- Backend and frontend pushed to GitHub

## Deploy Backend to Render

### Step 1: Create Render Account & Connect GitHub

1. Visit [Render Dashboard](https://dashboard.render.com)
2. Sign up or log in
3. Click **Dashboard** → **New Web Service**
4. Click **Build and deploy from a Git repository**
5. Click **Connect account** (authorize GitHub)
6. Select the 90PlusStore repository

### Step 2: Configure Web Service

Fill in the following settings:

```
Name: 90plusstore-api
Environment: Node
Region: US East (Ohio)
Branch: main
Build Command: npm install
Start Command: npm start
Root Directory: backend
```

### Step 3: Add Environment Variables

1. Scroll to **Environment** section
2. Click **Add Environment Variable** for each:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/90plusstore
JWT_SECRET=your-very-long-random-secret-key-min-32-chars
JWT_EXPIRY=7d
PORT=5000
NODE_ENV=production
REDIS_URL=redis://default:password@localhost:6379 (optional)
```

**Important**: Use strong, random values for `JWT_SECRET` in production!

### Step 4: Deploy

1. Click **Create Web Service**
2. Wait for deployment (3-5 minutes)
3. Copy your backend URL: `https://your-api-name.onrender.com`

**Note**: Render free tier may sleep after 15 minutes of inactivity. Add a keep-alive ping if needed.

---

## Deploy Frontend to Render

### Step 1: Create Static Site

1. Go back to Render Dashboard
2. Click **New** → **Static Site**
3. Click **Connect a repository**
4. Select 90PlusStore repository

### Step 2: Configure Settings

Fill in the following:

```
Name: 90plusstore
Branch: main
Build Command: cd frontend && npm run build
Publish Directory: frontend/dist
```

### Step 3: Add Environment Variable

1. Scroll to **Environment** section
2. Add:

```env
VITE_API_URL=https://your-api-name.onrender.com/api
```

Replace `your-api-name` with your actual backend service name from Step 1.

### Step 4: Deploy

1. Click **Create Static Site**
2. Wait for deployment (2-3 minutes)
3. Your app is now live!

---

## Environment Variables

### Backend Production `.env`

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/90plusstore

# Authentication
JWT_SECRET=use_a_long_random_string_here_at_least_32_characters
JWT_EXPIRY=7d

# Server
PORT=5000
NODE_ENV=production

# Cache (Optional but recommended)
REDIS_URL=redis://username:password@hostname:port

# CORS Origins (Comma-separated)
CORS_ORIGIN=https://your-frontend-url.onrender.com

# Email Notifications (Optional future use)
MAIL_SERVICE=gmail
MAIL_EMAIL=your-email@gmail.com
MAIL_PASSWORD=app-specific-password
```

### Frontend Production `.env`

```env
VITE_API_URL=https://your-api-name.onrender.com/api
```

### MongoDB Atlas Production Setup

1. **Strong Database User Credentials**:
   - Use a strong password (min 12 characters, mixed case, numbers, symbols)
   - Use a specific database user (not the main account)

2. **IP Whitelist**:
   - Remove "Allow access from anywhere"
   - Add Render's IP addresses (approximately `3.104.0.0/14` region-dependent)
   - Or add specific server IPs if known

3. **Network Access**:
   - Go to MongoDB Atlas → **Network Access**
   - Only allow known IP addresses
   - Never use `0.0.0.0/0` in production

---

## Security Checklist

### Before Going Live

- [ ] Change `JWT_SECRET` to a long random string (min 32 characters)
- [ ] Use strong MongoDB password
- [ ] Restrict MongoDB IP whitelist (not `0.0.0.0/0`)
- [ ] Enable HTTPS on custom domain
- [ ] Set `NODE_ENV=production`
- [ ] Disable debug logging in production
- [ ] Remove test/demo accounts
- [ ] Review API authentication middleware
- [ ] Test user input validation
- [ ] Check error messages don't leak sensitive data
- [ ] Verify CORS origins are restricted
- [ ] Enable request rate limiting (consider adding)
- [ ] Use environment variables for all secrets
- [ ] Keep dependencies updated

### Ongoing Security

```bash
# Check for vulnerable dependencies
npm audit

# Update packages
npm update
npm audit fix

# Review access logs
# Check Render dashboard for suspicious activity
```

### API Security Best Practices

1. **Authentication**: All protected routes require valid JWT token
2. **Rate Limiting**: Implement to prevent brute force attacks
3. **Input Validation**: All user inputs validated server-side
4. **CORS**: Configured to allow only your frontend
5. **Password Hashing**: Using bcryptjs with 10 rounds
6. **Environment Variables**: All secrets in `.env` (never committed)

---

## Performance Optimization

### Frontend Optimization

1. **Build Optimization**:
   ```bash
   npm run build  # Creates optimized production build
   ```

2. **Code Splitting**: Vite automatically handles this
3. **Lazy Loading**: React Router lazy loads pages
4. **Image Optimization**: Images served via ImageKit CDN
5. **Caching**: Configure Render cache headers

### Backend Optimization

1. **Database Indexing**:
   ```bash
   # MongoDB Atlas automatically indexes _id
   # Add custom indexes for frequently queried fields
   # Go to MongoDB Atlas → Collections → Indexes
   ```

2. **Redis Caching**:
   - Enable for products, categories, featured items
   - Reduces database queries
   - Speeds up API responses

3. **Pagination**:
   - All list endpoints use pagination
   - Default 10 items per page
   - Reduces payload size

4. **Query Optimization**:
   - Use `.select()` to fetch only needed fields
   - Use `.lean()` for read-only queries

5. **Compression**:
   - Enable gzip compression in Express
   - Configured by default in production

### Monitoring Performance

1. **Render Dashboard**:
   - View CPU, memory, disk usage
   - Monitor request counts and latency
   - Check logs for errors

2. **Database Monitoring**:
   - MongoDB Atlas → **Performance Advisor**
   - View slow queries
   - Get optimization suggestions

3. **Frontend Monitoring**:
   - Use browser DevTools (F12)
   - Check Network tab for slow requests
   - Monitor JavaScript errors in Console

---

## Monitoring & Maintenance

### Regular Checks (Weekly)

- [ ] Check Render dashboard for errors
- [ ] Review MongoDB performance advisor
- [ ] Check error logs for issues
- [ ] Monitor disk usage
- [ ] Test critical user flows

### Regular Maintenance (Monthly)

- [ ] Run `npm audit` and fix vulnerabilities
- [ ] Update critical dependencies
- [ ] Review and optimize slow queries
- [ ] Check MongoDB Atlas notifications
- [ ] Review ImageKit storage usage

### Database Backups

**MongoDB Atlas Free Tier** includes:
- Automatic snapshots (3-day retention)
- Manual export at any time

To backup data:
1. Go to MongoDB Atlas
2. Click **Data Export** (or **Backup** for paid tiers)
3. Select collections to backup
4. Download as JSON/BSON

---

## Troubleshooting

### Deployment Failed

**Check logs**:
1. Go to Render Dashboard
2. Click on your service
3. View deployment logs
4. Look for errors

**Common issues**:
- Missing root directory (`backend` for API)
- Missing build command
- Missing environment variables
- GitHub permission issues

**Solutions**:
- Verify directory structure
- Check all env vars are set
- Ensure `package.json` has correct start script
- Redeploy manually

### Backend Won't Connect to MongoDB

**Error**: `MongoNetworkError`

**Check**:
1. `MONGODB_URI` is correct in Render env vars
2. IP whitelist includes Render's IPs
3. Database user credentials are correct
4. Connection string hasn't expired

**Solution**:
1. Go to MongoDB Atlas
2. **Network Access** → Add Render region IPs
3. Or use "Allow access from anywhere" for testing only

### Frontend Can't Reach API

**Error**: `Failed to fetch from /api/...`

**Check**:
1. `VITE_API_URL` in frontend env var
2. Backend service is running
3. CORS is configured correctly

**Solution**:
```javascript
// In backend, check CORS config
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
```

### Slow API Responses

**Check**:
1. MongoDB queries in logs
2. Redis caching is enabled
3. Database indexes exist
4. API is not making N+1 queries

**Solution**:
- Enable Redis caching
- Add database indexes
- Use `.select()` to fetch specific fields

### High Memory Usage

**Check**:
1. Render dashboard memory stats
2. Memory leaks in code
3. Large response sizes

**Solution**:
- Optimize queries to return less data
- Implement pagination for lists
- Enable response compression

### App Goes to Sleep

**Note**: Render free tier sleeps after 15 minutes of inactivity

**Solution**: Add a keep-alive ping

```javascript
// In backend (optional)
setInterval(() => {
  http.get(`http://${process.env.BACKEND_URL}/api/health`);
}, 14 * 60 * 1000); // Every 14 minutes
```

---

## Custom Domain Setup

### Add Custom Domain on Render

1. Go to your service in Render Dashboard
2. Click **Settings**
3. Scroll to **Custom Domains**
4. Enter your domain (e.g., `api.yourapp.com`)
5. Follow DNS setup instructions

### DNS Configuration

1. Go to your domain registrar (GoDaddy, Namecheap, etc.)
2. Update DNS records:
   - Add CNAME record pointing to Render
   - Wait 24-48 hours for propagation

### Enable HTTPS

- Render automatically provides HTTPS
- Certificate auto-renews
- No additional setup needed

---

## Deployment Architecture

```
GitHub Repository
    ↓
    ├── Push to main branch
    │   ↓
    ├─→ Render Backend (Web Service)
    │   ├─→ MongoDB Atlas (Database)
    │   └─→ ImageKit (Image CDN)
    │
    └─→ Render Frontend (Static Site)
        └─→ Backend API via VITE_API_URL
```

---

## Rollback Strategy

### If Deployment Has Issues

1. **In Render Dashboard**:
   - Go to your service
   - Click **Deployments**
   - Find previous working deployment
   - Click **Redeploy**

2. **Force rollback**:
   - Push previous commit to GitHub
   - Render auto-redeploys on push

### Database Rollback

1. **Use MongoDB snapshots**:
   - Go to MongoDB Atlas
   - Click **Backup** (paid) or **Data Export**
   - Restore from snapshot

---

## Scaling for Growth

### When You Need More Power

1. **Upgrade Render plan**:
   - Move from free tier to paid
   - Increases CPU, memory, bandwidth

2. **Upgrade MongoDB**:
   - Move from free M0 to paid M2+
   - Increases storage, throughput

3. **Optimize code**:
   - Add caching (Redis)
   - Implement pagination
   - Optimize database queries

---

## Cost Optimization

### Free Tier Usage

- Render: Free Web Service (limited but sufficient)
- MongoDB Atlas: Free M0 (5GB storage)
- ImageKit: Free tier (20GB/month bandwidth)
- GitHub: Free

**Total Monthly Cost**: $0

### When You Outgrow Free Tier

- Render: Start at $7/month
- MongoDB: Start at $57/month
- ImageKit: Start at $10-100/month

---

## Monitoring Checklist

### Daily
- [ ] Check Render dashboard status
- [ ] Monitor error logs

### Weekly
- [ ] Review performance metrics
- [ ] Test critical user flows
- [ ] Check database performance

### Monthly
- [ ] Update dependencies
- [ ] Run security audit
- [ ] Review cost optimization

---

## Need Help?

- **Render Docs**: https://render.com/docs
- **MongoDB Docs**: https://docs.mongodb.com
- **GitHub Issues**: https://github.com/Apurba-0001/90PlusStore/issues
- **Email Support**: 90plusstore0@gmail.com
