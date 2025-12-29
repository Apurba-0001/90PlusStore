# Quick Start Guide

## 1. Local Development Setup (2-3 minutes)

### Prerequisites

- Node.js v14+ installed
- MongoDB Atlas account (free)

### Step 1: Clone and Setup Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and add your MongoDB URI:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/90plusstore
JWT_SECRET=dev_secret_key_123
PORT=5000
NODE_ENV=development
```

Start backend:

```bash
npm run dev
```

✅ Backend running on `http://localhost:5000`

### Step 2: Setup Frontend

In another terminal:

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `.env`:

```
VITE_API_URL=http://localhost:5000/api
```

Start frontend:

```bash
npm run dev
```

✅ Frontend running on `http://localhost:3000`

---

## 2. First Test

### Create Admin Account

1. Open `http://localhost:3000/register`
2. Register with:

   - Name: Admin User
   - Email: admin@test.com
   - Password: admin123

3. Open browser console (F12):

```javascript
// Get the token and user from localStorage
console.log(localStorage.getItem("user"));
```

4. Manually set admin role (development only):

```javascript
// In browser console:
let user = JSON.parse(localStorage.getItem("user"));
user.role = "admin";
localStorage.setItem("user", JSON.stringify(user));
```

### Create Test Product

1. Go to `http://localhost:3000/admin/dashboard`
2. Click "Add Product"
3. Fill in:
   - Name: "Test Jersey"
   - Category: "Jerseys"
   - Price: 79.99
   - Stock: 10
   - Description: "Premium quality jersey"
   - Image URL: "https://via.placeholder.com/400x400"
4. Click "Create Product"

### Test Shopping Flow

1. Go home page
2. Add product to cart
3. View cart
4. Proceed to checkout
5. Complete order

---

## 3. Common Commands

### Backend

```bash
npm run dev      # Start development server with hot reload
npm start        # Start production server
npm test         # Run tests (if configured)
```

### Frontend

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build locally
npm run lint     # Run ESLint
```

---

## 4. Database Setup

### MongoDB Atlas (Free)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for free account
3. Create a cluster:

   - Choose "Shared" (free tier)
   - Select a region close to you
   - Create cluster (takes ~3 min)

4. Create database user:

   - Go to Database Access
   - Add New Database User
   - Choose "Password" authentication
   - Save username and password

5. Whitelist IP:

   - Go to Network Access
   - Add IP Address
   - Add "0.0.0.0/0" (allow all - development only)

6. Get connection string:
   - Click "Connect" button on cluster
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database user password

---

## 5. Troubleshooting

### Port Already in Use

```bash
# Find process on port 5000
lsof -i :5000
kill -9 <PID>

# Find process on port 3000
lsof -i :3000
kill -9 <PID>
```

### MongoDB Connection Error

```
Error: connect ECONNREFUSED
```

- Check MongoDB URI in `.env`
- Verify IP is whitelisted in MongoDB Atlas
- Check database user credentials

### CORS Errors

```
Access to XMLHttpRequest blocked by CORS policy
```

- Make sure backend is running
- Check `VITE_API_URL` in frontend `.env`
- Verify URLs match

### Token Expired

- Clear localStorage: `localStorage.clear()`
- Login again

---

## 6. Environment Variables

### Backend `.env`

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/90plusstore
JWT_SECRET=super_secret_key
PORT=5000
NODE_ENV=development
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 7. Testing API with cURL

### Register User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get Products

```bash
curl http://localhost:5000/api/products
```

### Get Categories

```bash
curl http://localhost:5000/api/products/categories
```

---

## 8. File Structure Overview

```
90plusstore/
├── backend/
│   ├── models/        # Database schemas
│   ├── routes/        # API endpoints
│   ├── controllers/    # Business logic
│   ├── middleware/     # Auth, error handling
│   ├── server.js      # Express app
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── pages/     # React pages
│   │   ├── components/ # React components
│   │   ├── context/   # Global state
│   │   ├── services/  # API calls
│   │   └── styles/    # CSS/Tailwind
│   ├── index.html     # Entry HTML
│   └── package.json
└── README.md
```

---

## 9. Next Steps

- [ ] Customize product images
- [ ] Add more products
- [ ] Test all features
- [ ] Read [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [ ] Deploy to production

---

## Support

Need help? Check:

- [Full README](./README.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
