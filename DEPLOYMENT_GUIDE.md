# Deployment Guide

Complete guide to deploy 90PlusStore to production using free services.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Client Browser                                             │
│      ↓                                                       │
│  Vercel/Netlify (Frontend)  ←──────────→  Render (Backend)  │
│      ↓                                       ↓              │
│  React App                                Express API        │
│                                             ↓              │
│                              MongoDB Atlas (Database)       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Prerequisites

- GitHub account
- MongoDB Atlas account (free)
- Vercel or Netlify account (free)
- Render account (free)

---

## Step 1: Prepare Code for Deployment

### 1.1 Update Backend Configuration

Edit `backend/.env`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/90plusstore
JWT_SECRET=generate_a_strong_random_string_here
PORT=5000
NODE_ENV=production
```

### 1.2 Update Frontend Configuration

Edit `frontend/.env`:

```env
VITE_API_URL=https://your-backend-app.onrender.com/api
```

### 1.3 Commit Changes

```bash
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

---

## Step 2: Deploy Backend on Render

### 2.1 Create Render Account

1. Visit [Render](https://render.com)
2. Click "Get Started"
3. Sign up with GitHub (recommended)
4. Authorize GitHub access

### 2.2 Create Web Service

1. Dashboard → New → Web Service
2. Select your GitHub repository
3. Connect (authorize if needed)
4. Choose `90plusstore` repository
5. Configure:
   - **Name**: `90plusstore-api`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: `backend`

### 2.3 Add Environment Variables

Click "Advanced" and add:

| Key           | Value                                                                                                |
| ------------- | ---------------------------------------------------------------------------------------------------- |
| `MONGODB_URI` | Your MongoDB Atlas connection string                                                                 |
| `JWT_SECRET`  | Generate a random string: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `NODE_ENV`    | `production`                                                                                         |

### 2.4 Deploy

1. Click "Create Web Service"
2. Wait for deployment (2-3 minutes)
3. Copy the URL (e.g., `https://90plusstore-api.onrender.com`)
4. Keep this URL for frontend deployment

**Test Backend:**

```bash
curl https://your-api-url.onrender.com/api/health
```

---

## Step 3: Deploy Frontend on Vercel

### 3.1 Create Vercel Account

1. Visit [Vercel](https://vercel.com)
2. Click "Sign Up"
3. Sign up with GitHub (recommended)
4. Authorize GitHub access

### 3.2 Import Project

1. Dashboard → "Add New..." → "Project"
2. Import Git Repository
3. Select your `90plusstore` repository
4. Click "Import"

### 3.3 Configure Project

1. **Project Name**: `90plusstore`
2. **Framework**: Select "Vite"
3. **Root Directory**: Click "Edit" and select `frontend`
4. **Build and Output Settings**:
   - Build Command: `npm run build`
   - Output Directory: `dist`

### 3.4 Add Environment Variables

Before deploying, add:

| Key            | Value                                   |
| -------------- | --------------------------------------- |
| `VITE_API_URL` | `https://your-api-url.onrender.com/api` |

### 3.5 Deploy

1. Click "Deploy"
2. Wait for deployment (1-2 minutes)
3. Get the frontend URL (e.g., `https://90plusstore.vercel.app`)

**Test Frontend:**
Open `https://90plusstore.vercel.app` in browser

---

## Step 4: Deploy Frontend on Netlify (Alternative)

### 4.1 Create Netlify Account

1. Visit [Netlify](https://netlify.com)
2. Click "Sign up"
3. Sign up with GitHub (recommended)

### 4.2 Import Project

1. Dashboard → "Add new site" → "Import an existing project"
2. Connect to GitHub
3. Select `90plusstore` repository
4. Click "Next"

### 4.3 Configure Build Settings

1. **Base directory**: `frontend`
2. **Build command**: `npm run build`
3. **Publish directory**: `dist`
4. Click "Show advanced"

### 4.4 Add Environment Variables

```
Key: VITE_API_URL
Value: https://your-api-url.onrender.com/api
```

### 4.5 Deploy

1. Click "Deploy site"
2. Wait for deployment
3. Get the Netlify URL

---

## Step 5: Update Backend with Frontend URL (Optional but Recommended)

If you want to restrict CORS to only your frontend:

1. Go to Render dashboard
2. Select your backend service
3. Go to "Environment"
4. Add or update if needed (frontend URL is used by CORS in server.js)

---

## Step 6: Verify Deployment

### Test Authentication

```bash
# Register
curl -X POST https://your-api.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123"
  }'
```

### Test Frontend

1. Open your frontend URL
2. Register a new account
3. Browse products
4. Add to cart and test checkout
5. Login as admin and test dashboard

---

## Step 7: Custom Domain (Optional)

### Vercel Custom Domain

1. Vercel Dashboard → Select Project → Settings → Domains
2. Add your domain
3. Follow DNS instructions from your domain registrar

### Netlify Custom Domain

1. Netlify Dashboard → Site settings → Domain management
2. Add custom domain
3. Follow DNS instructions

### Render Custom Domain

1. Render Dashboard → Select Service → Settings
2. Add custom domain
3. Follow DNS instructions

---

## Step 8: Monitoring & Maintenance

### Check Backend Status

Render Dashboard:

- View logs: Click service → "Logs"
- Check resource usage: Click service → "Metrics"
- Restart service: Click "Manual Deploy"

### Check Frontend Status

Vercel Dashboard:

- View deployments: Click project → "Deployments"
- Check analytics: Click "Analytics"
- View logs: Select deployment → "Logs"

Netlify Dashboard:

- View deployments: "Deploys" tab
- Check analytics: "Analytics" tab
- View logs: Select deployment → "Deploy log"

### Monitor Database

MongoDB Atlas:

- Cluster status: Main page
- Data usage: Analytics → Collections
- Connection issues: Logs → MongoDB logs

---

## Step 9: Troubleshooting Deployment

### Backend Won't Start

**Error**: "Cannot find module"

- SSH to Render service (if available)
- Check `npm install` runs correctly
- Verify all dependencies in `package.json`

**Error**: "MongoDB connection failed"

- Check `MONGODB_URI` environment variable
- Verify IP whitelist includes Render's IPs
- Test MongoDB Atlas connection: `mongosh <connection-string>`

### Frontend Build Fails

**Error**: "Module not found"

- Check `vite.config.js` configuration
- Verify `package.json` has all dependencies
- Check for `import` errors in code

**Error**: "API calls not working"

- Verify `VITE_API_URL` is correct
- Check backend CORS allows frontend URL
- Check network tab in browser DevTools

### CORS Errors

```javascript
// Error: "Access to XMLHttpRequest blocked by CORS policy"
```

**Solution**:

1. Backend `server.js` has CORS configured
2. Verify frontend URL matches CORS allowed origins
3. Check browser console for actual error details

### Slow Loading

**Solutions**:

- Render free tier can be slow
- Consider upgrade to paid plan
- Enable caching headers in Vercel
- Optimize images in products

---

## Step 10: Environment-Specific Configuration

### Development

```env
NODE_ENV=development
VITE_API_URL=http://localhost:5000/api
```

### Production

```env
NODE_ENV=production
VITE_API_URL=https://your-api.onrender.com/api
```

---

## Step 11: Backup & Recovery

### MongoDB Backup

MongoDB Atlas automatically backs up free tier:

1. Atlas Dashboard → Clusters → "Backup"
2. Scheduled backups enabled by default
3. Can restore from backup if needed

### Code Backup

GitHub automatically stores versions:

1. GitHub Dashboard → Repository → "Releases"
2. Tag releases: `git tag v1.0.0 && git push origin v1.0.0`

---

## Step 12: Performance Optimization

### Backend (Render)

- Use Redis for caching (paid)
- Enable compression: Already in Express
- Database indexing: Create indexes in MongoDB

### Frontend (Vercel/Netlify)

- Enable image optimization
- Use code splitting
- Enable gzip compression (automatic)
- Cache static assets

### Database (MongoDB Atlas)

- Create indexes on frequently queried fields
- Use aggregation pipeline for complex queries
- Monitor query performance

---

## Cost Breakdown (Free Tier)

| Service       | Free Limit              | Cost |
| ------------- | ----------------------- | ---- |
| Vercel        | 100 deployments/month   | Free |
| Netlify       | 300 build minutes/month | Free |
| Render        | 750 hours/month         | Free |
| MongoDB Atlas | 5GB storage             | Free |
| GitHub        | Unlimited public repos  | Free |

---

## Scaling to Paid (If Needed)

### When to Upgrade

- Database exceeds 5GB
- Backend needs more resources
- Need custom domains
- Want faster deployments

### Recommended Plans

- **MongoDB Atlas**: $9/month (M2 shared)
- **Render**: $7/month (Web service)
- **Vercel Pro**: $20/month (optional)

---

## Maintenance Checklist

- [ ] Monitor backend logs weekly
- [ ] Check database storage monthly
- [ ] Update dependencies quarterly
- [ ] Backup important data monthly
- [ ] Test backup restoration procedure
- [ ] Review security settings monthly
- [ ] Update environment variables as needed
- [ ] Monitor error logs for issues

---

## Security Checklist

- [ ] JWT_SECRET is strong and random
- [ ] Environment variables are not in Git
- [ ] CORS is properly configured
- [ ] Passwords are hashed (bcryptjs)
- [ ] Sensitive data not logged
- [ ] HTTPS enabled (automatic on all platforms)
- [ ] Database credentials are secure
- [ ] IP whitelist is appropriate

---

## Common Deployment Issues & Solutions

| Issue             | Cause                      | Solution                    |
| ----------------- | -------------------------- | --------------------------- |
| 502 Bad Gateway   | Backend crashed            | Check logs, restart service |
| CORS Error        | Wrong frontend URL in CORS | Update backend CORS config  |
| Slow API          | DB query timeout           | Add indexes to MongoDB      |
| File upload fails | Size limit exceeded        | Check express.json limit    |
| Token not working | JWT_SECRET mismatch        | Verify secret on all envs   |

---

## Need Help?

- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- Netlify Docs: https://docs.netlify.com
- MongoDB Docs: https://docs.mongodb.com
- Express Docs: https://expressjs.com
- React Docs: https://react.dev

---

**Deployment Complete! Your app is now live on the internet. 🚀**
