<div align="center">

# 🏟️ 90PlusStore

#### A Production-Ready MERN Stack E-Commerce Application for Football Merchandise

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v14+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v18-blue.svg)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-darkgreen.svg)](https://www.mongodb.com/cloud/atlas)
[![Status](https://img.shields.io/badge/Status-Active-brightgreen.svg)](#)

[Live Demo](#) • [Documentation](#api-endpoints) • [Issues](https://github.com/Apurba-0001/90PlusStore/issues) • [Support](#support)

</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [API Endpoints](#-api-endpoints)
- [Deployment](#-deployment)
- [Environment Setup](#-environment-variables)
- [Security](#-security-considerations)
- [Contributing](#-contributing)
- [License](#-license)
- [Support](#-support)

---

## ✨ Features

## Features

### User Features

- ✅ User authentication (Register/Login)
- ✅ JWT-based session management
- ✅ Product browsing with category filters
- ✅ Search and filtering functionality
- ✅ Shopping cart management (add, remove, update quantity, clear)
- ✅ Wishlist functionality (save favorites, toggle items)
- ✅ Product reviews and ratings
- ✅ Checkout and order placement
- ✅ Multiple address support (shipping & billing)
- ✅ Order tracking and history
- ✅ User profile management
- ✅ Responsive design (Mobile, Tablet, Desktop)
- ✅ Loading skeletons for better UX

### Admin Features

- ✅ Admin dashboard with analytics
- ✅ Product management (Create, Read, Update, Delete)
- ✅ Featured products management
- ✅ Stock management with size variants
- ✅ Product reviews management (edit, delete reviews)
- ✅ Order management and status updates
- ✅ User management (view, remove users)
- ✅ Role-based access control
- ✅ Make user admin functionality

### Product Features

- ✅ Multiple product images
- ✅ Size variants (XS-XXL for clothing, shoe sizes 6-14)
- ✅ Gender categories (Men, Women, Kids, All)
- ✅ Product ratings and reviews system
- ✅ Featured products showcase
- ✅ Stock tracking per size

### Product Categories

- Jerseys
- Jackets and Sweatshirts
- Footwear
- Shorts
- Tracksuits
- Special Collectibles
- Accessories

## 🔧 Tech Stack

### Frontend

- React 18
- Vite (Fast build tool)
- React Router v6
- Axios
- Tailwind CSS
- Context API for state management (Auth, Cart, Wishlist)

### Backend

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- Redis for caching (optional)
- CORS for secure API access

### Deployment

- Frontend: Render
- Backend: Render
- Database: MongoDB Atlas (free tier)
- Cache: Redis

## 📁 Project Structure

```
90plusstore/
├── backend/
│   ├── models/
│   │   ├── User.js          (User schema with address, avatar, phone)
│   │   ├── Product.js       (Product schema with reviews, ratings, sizes)
│   │   ├── Order.js         (Order schema with shipping/billing address)
│   │   └── Settings.js      (App settings)
│   ├── routes/
│   │   ├── authRoutes.js    (Auth, Cart, Wishlist endpoints)
│   │   ├── productRoutes.js (Products, Reviews, Featured)
│   │   ├── orderRoutes.js   (Order management)
│   │   └── settingsRoutes.js
│   ├── controllers/
│   │   ├── authController.js    (Auth, Cart, Wishlist logic)
│   │   ├── productController.js (Product & Review logic)
│   │   ├── orderController.js   (Order logic)
│   │   └── settingsController.js
│   ├── middleware/
│   │   ├── auth.js              (JWT verification, admin check)
│   │   └── cache.js             (Redis caching middleware)
│   ├── migrations/              (Database migrations)
│   ├── config/
│   │   └── redis.js             (Redis configuration)
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   ├── ProductSkeleton.jsx       (Loading state)
│   │   │   ├── ProductDetailSkeleton.jsx (Loading state)
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── StarRating.jsx            (Rating component)
│   │   │   └── ScrollToTop.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Products.jsx      (With filters & search)
│   │   │   ├── ProductDetail.jsx (With reviews & ratings)
│   │   │   ├── Cart.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Wishlist.jsx
│   │   │   ├── Orders.jsx        (Order history)
│   │   │   ├── About.jsx
│   │   │   ├── Contact.jsx
│   │   │   ├── Shipping.jsx
│   │   │   ├── Returns.jsx
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.jsx  (Analytics & overview)
│   │   │       ├── AdminProducts.jsx   (Product list & management)
│   │   │       ├── AdminProductForm.jsx (Add/Edit products)
│   │   │       ├── AdminOrders.jsx     (Order management)
│   │   │       ├── AdminUsers.jsx      (User management)
│   │   │       ├── AdminFeatured.jsx   (Featured products)
│   │   │       ├── UserCard.jsx
│   │   │       └── UserDetails.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx     (User auth state)
│   │   │   ├── CartContext.jsx     (Cart state)
│   │   │   └── WishlistContext.jsx (Wishlist state)
│   │   ├── services/
│   │   │   ├── api.js              (Axios instance with interceptors)
│   │   │   └── services.js         (API service methods)
│   │   ├── styles/
│   │   │   └── index.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   └── .env
│
└── README.md
```

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account (free)
- Git

## 🚀 Quick Start

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Apurba-0001/90PlusStore.git
cd 90plusstore

# 2. Backend Setup
cd backend
npm install
cp .env.example .env
# Update .env with your MongoDB URI and JWT secret
npm run dev

# 3. Frontend Setup (in a new terminal)
cd frontend
npm install
cp .env.example .env
npm run dev
```

**Backend:** http://localhost:5000  
**Frontend:** http://localhost:3000

### Demo Accounts

| Role  | Email                   | Password   |
| ----- | ----------------------- | ---------- |
| Admin | `admin@90plusstore.com` | `admin123` |
| User  | `user@90plusstore.com`  | `user123`  |

---

## 1. Clone the Repository

```bash
git clone https://github.com/yourusername/90plusstore.git
cd 90plusstore
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file (copy from .env.example)
cp .env.example .env

# Update .env with your credentials:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/90plusstore
# JWT_SECRET=your_super_secret_key

# Start the development server
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file (copy from .env.example)
cp .env.example .env

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:3000`

## 📡 API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)
- `GET /api/auth/users` - Get all users (admin only)
- `DELETE /api/auth/users/:id` - Remove user (admin only)

### Cart Management

- `GET /api/auth/cart` - Get user's cart (protected)
- `POST /api/auth/cart` - Add item to cart (protected)
- `PATCH /api/auth/cart/:productId` - Update cart item quantity (protected)
- `DELETE /api/auth/cart/:productId` - Remove item from cart (protected)
- `DELETE /api/auth/cart` - Clear entire cart (protected)

### Wishlist Management

- `GET /api/auth/wishlist` - Get user's wishlist (protected)
- `PATCH /api/auth/wishlist/:productId` - Toggle product in wishlist (protected)

### Products

- `GET /api/products` - Get all products (with pagination and filtering)
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/categories` - Get all categories
- `GET /api/products/featured` - Get featured products
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `PUT /api/products/:id/featured` - Toggle featured status (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Reviews & Ratings

- `GET /api/products/:id/reviews` - Get product reviews
- `POST /api/products/:id/reviews` - Add review (protected)
- `PUT /api/products/:id/reviews/:reviewId` - Update review (admin only)
- `DELETE /api/products/:id/reviews/:reviewId` - Delete review (admin only)

### Orders

- `POST /api/orders` - Create order (protected)
- `GET /api/orders/my-orders` - Get user's orders (protected)
- `GET /api/orders/:id` - Get order details (protected)
- `PUT /api/orders/:id/status` - Update order status (admin only)
- `GET /api/orders` - Get all orders (admin only)

---

## Demo Credentials

### Admin Account

- Email: `admin@90plusstore.com`
- Password: `admin123`

### Regular User

- Email: `user@90plusstore.com`
- Password: `user123`

## MongoDB Atlas Setup

1. Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (free tier)
4. Create a database user with username and password
5. Add your IP to the whitelist
6. Get the connection string and update `.env`

Example connection string:

```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/90plusstore?retryWrites=true&w=majority
```

## 🌐 Deployment

### Deploy Backend on Render

1. Push your code to GitHub
2. Visit [Render Dashboard](https://dashboard.render.com)
3. Create a new Web Service
4. Connect your GitHub repository
5. Configure settings:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Add environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `NODE_ENV=production`
7. Deploy

Backend URL will be: `https://your-app-name.onrender.com`

### Deploy Frontend on Vercel

1. Visit [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework**: Vite
   - **Root Directory**: `frontend`
5. Add environment variable:
   - `VITE_API_URL=https://your-backend-url.com/api`
6. Deploy

Frontend URL will be: `https://your-app-name.vercel.app`

### Alternative: Deploy Frontend on Netlify

1. Visit [Netlify](https://netlify.com)
2. Click "New site from Git"
3. Connect GitHub repository
4. Configure:
   - **Base Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
5. Add environment variable:
   - `VITE_API_URL=https://your-backend-url.com/api`
6. Deploy

## Building for Production

### Backend

```bash
cd backend
npm start  # Runs on PORT specified in .env
```

### Frontend

```bash
cd frontend
npm run build  # Creates optimized build in dist/
npm run preview  # Preview the build
```

## ⚙️ Environment Variables

### Backend (.env)

```
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/90plusstore
JWT_SECRET=your_super_secret_jwt_key
PORT=5000
NODE_ENV=production
```

### Frontend (.env)

```
VITE_API_URL=https://your-backend-url.com/api
```

## 🔐 Security Considerations

1. **JWT Authentication**: Secure token-based authentication with configurable expiration
2. **JWT Secret**: Change the default JWT secret in production
3. **Password Hashing**: Passwords hashed using bcryptjs (10 rounds)
4. **CORS**: Backend includes CORS configuration for secure API access
5. **Protected Routes**: Both frontend and backend route protection
6. **Admin Middleware**: Role-based access control for admin endpoints
7. **Environment Variables**: Keep sensitive data in .env files (not in Git)
8. **Input Validation**: All inputs validated on both client and server
9. **Address Storage**: Secure address data storage with multiple address support
10. **Token Refresh**: JWT tokens expire after 7 days

## ⚡ Performance Optimization

- **Frontend**:
  - Vite for fast build times and development
  - React Router lazy loading
  - Loading skeletons for better perceived performance
  - Context API for efficient state management
- **Backend**:
  - Redis caching for products, categories, and featured items
  - Pagination for large datasets
  - Indexed MongoDB queries
  - HTTP compression
  - Keep-alive ping endpoint for deployment services

- **General**:
  - Image optimization via URLs
  - CSS minification with Tailwind
  - Production build optimization
  - Lazy image loading in product cards

## 🛠️ Troubleshooting

### MongoDB Connection Error

- Check if your IP is whitelisted in MongoDB Atlas
- Verify connection string in .env
- Ensure database user has correct permissions

### CORS Errors

- Verify backend CORS configuration
- Check if frontend API URL matches backend URL

### Port Already in Use

```bash
# Linux/Mac
lsof -i :5000  # Find process on port 5000
kill -9 <PID>

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### JWT Token Expired

- Token expires after 7 days
- Users need to login again for new token

## 🧪 Testing Endpoints with cURL

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"pass123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"pass123"}'

# Get Products
curl http://localhost:5000/api/products

# Get Categories
curl http://localhost:5000/api/products/categories
```

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Process

1. Fork the repository
2. Create a feature branch
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. Commit your changes
   ```bash
   git commit -m 'Add AmazingFeature'
   ```
4. Push to the branch
   ```bash
   git push origin feature/AmazingFeature
   ```
5. Open a Pull Request

### Guidelines

- Follow existing code style and conventions
- Add tests for new features
- Update documentation as needed
- Keep commits clean and descriptive

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 💬 Support

Need help? We're here for you!

- 📧 **Email**: [90plusstore0@gmail.com](mailto:90plusstore0@gmail.com)
- 🐛 **Issues**: [GitHub Issues](https://github.com/Apurba-0001/90PlusStore/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/Apurba-0001/90PlusStore/discussions)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🎯 Future Enhancements

- [ ] Payment gateway integration (Stripe, PayPal, Razorpay)
- [ ] Email notifications (Order confirmation, Shipping updates)
- [ ] Advanced sales analytics with charts
- [ ] Multi-language support (i18n)
- [ ] Dark mode theme
- [ ] Two-factor authentication (2FA)
- [ ] Social media integration (Login with Google/Facebook)
- [ ] Product recommendations engine
- [ ] Bulk product upload (CSV/Excel)
- [ ] Advanced inventory tracking
- [ ] Customer support chat
- [ ] Product comparison feature

---

<div align="center">

### Made with ❤️ by [Apurba Maji](https://github.com/Apurba-0001)

[![GitHub followers](https://img.shields.io/github/followers/Apurba-0001?style=social)](https://github.com/Apurba-0001)
[![GitHub stars](https://img.shields.io/github/stars/Apurba-0001/90PlusStore?style=social)](https://github.com/Apurba-0001/90PlusStore)

**[⬆ Back to top](#-90plusstore)**

</div>
