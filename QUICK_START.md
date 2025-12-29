# 90PlusStore - Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Prerequisites

- Node.js (v14+)
- MongoDB Atlas Account (Free)

### Step 1: Setup MongoDB (2 min)

1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Sign up for free account
3. Create a free cluster
4. Create user: Username `admin`, generate password
5. Click "Connect" → "Connect your application"
6. Copy the connection string

### Step 2: Configure Backend (1 min)

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
MONGODB_URI=mongodb+srv://admin:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/90plusstore?retryWrites=true&w=majority
JWT_SECRET=supersecretkey123456789012345678901234567890
PORT=5000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000
EOF

# Update MONGODB_URI with your actual connection string!
# Update JWT_SECRET with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 3: Configure Frontend (1 min)

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
REACT_APP_API_BASE_URL=http://localhost:5000/api
EOF
```

### Step 4: Run Applications (1 min)

**Terminal 1 - Start Backend:**

```bash
cd backend
npm run dev
```

Expected output: `Server is running on port 5000`

**Terminal 2 - Start Frontend:**

```bash
cd frontend
npm start
```

Expected output: Browser opens at `http://localhost:3000`

---

## ✅ Your App is Ready!

### Test the Application

**User Features:**

1. Go to `http://localhost:3000`
2. Click "Register" and create an account
3. Browse products on home page
4. Click product to view details
5. Add product to cart with size
6. Go to cart and place order
7. View order in "Orders" page

**Admin Features:**

1. Click "Login"
2. Use demo account:
   - Email: `admin@90plusstore.com`
   - Password: `admin123`
3. Click "Admin" in navbar
4. Add products, view orders, update status

---

## 📝 Environment Variables

### Backend `.env`

- `MONGODB_URI`: MongoDB connection string (from Atlas)
- `JWT_SECRET`: Secret key for JWT tokens (generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment (development/production)
- `ALLOWED_ORIGINS`: CORS allowed origins

### Frontend `.env`

- `REACT_APP_API_BASE_URL`: Backend API URL (default: `http://localhost:5000/api`)

---

## 🔑 Demo Accounts

### Admin Account

```
Email: admin@90plusstore.com
Password: admin123
```

Access: Admin Dashboard for managing products and orders

### User Account

```
Email: user@90plusstore.com
Password: user123
```

Access: Browse products and place orders

### Create Your Own

Go to Register page and create a new account

---

## 🛠️ Troubleshooting

### Backend won't start

```bash
# Check if port 5000 is in use
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Try different port
PORT=5001 npm run dev
```

### Frontend can't connect to backend

1. Ensure backend is running on port 5000
2. Check browser console (F12) for CORS errors
3. Verify `REACT_APP_API_BASE_URL` is correct in `.env`
4. Restart frontend after changing `.env`

### MongoDB connection fails

1. Check connection string in `.env`
2. Ensure IP address is whitelisted in MongoDB Atlas:
   - Atlas Dashboard → Network Access → Allow current IP
3. Verify password contains no special chars (or URL encode them)

### npm install fails

```bash
# Clear cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Documentation

- **README_COMPLETE.md** - Full project documentation
- **PROJECT_SUMMARY.md** - Feature list and API endpoints
- **This file** - Quick start guide

---

## 🚀 Next Steps

1. **Explore the Code**

   - Backend routes in `backend/routes/`
   - Frontend pages in `frontend/src/pages/`
   - API service in `frontend/src/services/api.js`

2. **Customize**

   - Change brand colors in CSS files
   - Add more product categories
   - Modify database models
   - Add new pages

3. **Deploy** (when ready)

   - Frontend to Vercel (free)
   - Backend to Render (free)
   - Database already on MongoDB Atlas (free)

4. **Learn More**
   - See full documentation in README_COMPLETE.md
   - Check API endpoints in PROJECT_SUMMARY.md

---

## 💡 Pro Tips

- Use demo accounts to quickly test features
- Check browser console (F12) for error messages
- Check terminal for backend error logs
- Products are stored in MongoDB (persisted across restarts)
- Cart is stored in browser localStorage (persisted across page reloads)
- JWT tokens expire after 7 days

---

## ❓ Quick Reference

| Action         | Command                           |
| -------------- | --------------------------------- |
| Start backend  | `cd backend && npm run dev`       |
| Start frontend | `cd frontend && npm start`        |
| Install deps   | `npm install`                     |
| View logs      | Check terminal/console output     |
| Restart apps   | Ctrl+C then run command again     |
| Check MongoDB  | Visit mongodb.com/cloud/atlas     |
| Reset DB       | Delete cluster and create new one |

---

**Everything is ready! Start coding! 🚀**

_Questions? Check README_COMPLETE.md for detailed documentation_
