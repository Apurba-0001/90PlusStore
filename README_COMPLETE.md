# 90PlusStore - Football Merchandise E-Commerce Platform

A full-stack, JavaScript-only e-commerce platform for football merchandise. Built with React, Node.js/Express, and MongoDB. Designed to be deployed on free tiers (Vercel, Render, and MongoDB Atlas).

**Status**: ✅ Complete Frontend & Backend Structure Ready

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Installation & Setup](#installation--setup)
- [Environment Configuration](#environment-configuration)
- [Running Locally](#running-locally)
- [API Documentation](#api-documentation)
- [Deployment Guide](#deployment-guide)
- [Demo Accounts](#demo-accounts)
- [Database Models](#database-models)

---

## 🎯 Project Overview

**90PlusStore** is a university portfolio project demonstrating a modern full-stack e-commerce application. It showcases:

- **Frontend**: Responsive React UI with routing, state management, and Axios API integration
- **Backend**: RESTful API with JWT authentication, role-based access control, and input validation
- **Database**: MongoDB with proper schema design and relationships
- **Architecture**: Clean separation of concerns, modular code structure, and best practices

**Target Audience**: University students, developers learning full-stack development, and portfolio showcase.

---

## 🛠️ Tech Stack

### Frontend

- **React 18** - UI Framework
- **React Router DOM 6** - Client-side routing
- **Axios** - HTTP client
- **CSS3** - Styling (no CSS framework, pure CSS for learning)
- **Context API** - State management (Auth & Cart)

### Backend

- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin requests

### Deployment

- **Frontend**: Vercel (Free tier)
- **Backend**: Render (Free tier)
- **Database**: MongoDB Atlas (Free tier)

---

## 📁 Project Structure

```
90PlusStore/
├── backend/
│   ├── config/
│   │   └── database.js                 # MongoDB connection config
│   ├── middleware/
│   │   └── auth.js                     # JWT verification & role-based access
│   ├── models/
│   │   ├── User.js                     # User schema with password hashing
│   │   ├── Product.js                  # Product with sizes & reviews
│   │   └── Order.js                    # Order with products & status
│   ├── routes/
│   │   ├── authRoutes.js               # Register, Login, Get User
│   │   ├── productRoutes.js            # CRUD products (admin), browse
│   │   ├── orderRoutes.js              # Create, view, update orders
│   │   └── userRoutes.js               # User profile management
│   ├── server.js                       # Express server setup
│   ├── package.json                    # Dependencies
│   ├── .env.example                    # Environment variables template
│   └── .gitignore
│
├── frontend/
│   ├── public/
│   │   └── index.html                  # Entry HTML
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navigation.js           # Header with navbar
│   │   │   ├── Footer.js               # Footer
│   │   │   ├── ProductCard.js          # Reusable product card
│   │   │   └── Alert.js                # Alert notifications
│   │   ├── context/
│   │   │   ├── AuthContext.js          # Auth state & methods
│   │   │   └── CartContext.js          # Cart state & management
│   │   ├── pages/
│   │   │   ├── Home.js                 # Landing page with hero
│   │   │   ├── ProductListing.js       # Products with filters
│   │   │   ├── ProductDetails.js       # Single product details
│   │   │   ├── Cart.js                 # Shopping cart & checkout
│   │   │   ├── Login.js                # User login
│   │   │   ├── Register.js             # User registration
│   │   │   ├── Orders.js               # Order history
│   │   │   └── AdminDashboard.js       # Admin panel
│   │   ├── services/
│   │   │   └── api.js                  # Axios instance & API calls
│   │   ├── App.js                      # Main app component with routing
│   │   ├── App.css                     # Global styles
│   │   └── index.js                    # React entry point
│   ├── package.json                    # Dependencies
│   ├── .env.example                    # Environment variables template
│   └── .gitignore
│
└── README.md                           # This file
```

---

## ✨ Features

### User Features

- ✅ Browse football products by category (Jerseys, Boots, Balls, Accessories)
- ✅ View product details with images, descriptions, sizes, and availability
- ✅ Add/remove products from shopping cart
- ✅ Persistent cart (localStorage)
- ✅ User registration and login (JWT-based)
- ✅ View order history with detailed status tracking
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Search products by name and description

### Admin Features

- ✅ Secure admin login (role-based access)
- ✅ Add new products with multiple sizes and stock management
- ✅ Edit and delete products
- ✅ View all orders in real-time
- ✅ Update order status (Pending → Confirmed → Shipped → Delivered)
- ✅ View user accounts and order details

### Technical Features

- ✅ JWT authentication with token expiration (7 days)
- ✅ Password hashing with bcrypt
- ✅ Protected routes and APIs
- ✅ Role-based access control (Admin vs User)
- ✅ Centralized error handling
- ✅ API request/response interceptors
- ✅ Clean, documented code
- ✅ Mobile-responsive UI

---

## 🚀 Installation & Setup

### Prerequisites

Before you begin, ensure you have installed:

- **Node.js** (v14+) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **Git** - For version control
- **MongoDB Atlas Account** - Free tier at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)

### Step 1: Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/90PlusStore.git
cd 90PlusStore
```

### Step 2: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file from template
cp .env.example .env

# Edit .env with your configuration (see next section)
# Then start the server
npm run dev
```

### Step 3: Frontend Setup

```bash
# From project root, go to frontend
cd frontend

# Install dependencies
npm install

# Create .env file from template
cp .env.example .env

# Start development server
npm start
```

The frontend will open at `http://localhost:3000`

---

## 🔧 Environment Configuration

### Backend (.env)

```env
# MongoDB Connection String
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/90plusstore?retryWrites=true&w=majority

# JWT Secret (use a strong random string)
JWT_SECRET=your_super_secret_key_change_this_12345678901234567890

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Settings (allowed origins)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,https://your-frontend-domain.com
```

### Frontend (.env)

```env
# Backend API Base URL
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

### Generating JWT Secret

Use this command to generate a secure JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 💻 Running Locally

### Development Mode (Both services running)

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
# Output: Server is running on port 5000
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm start
# Output: Application opens at http://localhost:3000
```

### Test the Application

1. **Register** a new account at `http://localhost:3000/register`
2. **Browse products** on the home page
3. **Add products to cart** from product listing
4. **Checkout** and place an order
5. **View orders** in the Orders page
6. **Login as admin** (use demo account) to access admin panel

---

## 📚 API Documentation

### Authentication Endpoints

#### Register User

```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123",
  "confirmPassword": "securepass123"
}

Response: { success: true, token: "jwt_token", user: {...} }
```

#### Login User

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepass123"
}

Response: { success: true, token: "jwt_token", user: {...} }
```

#### Get Current User

```
GET /api/auth/me
Authorization: Bearer {token}

Response: { success: true, user: {...} }
```

### Product Endpoints

#### Get All Products (with filtering)

```
GET /api/products?page=1&limit=10&category=jerseys&search=jersey

Response: {
  success: true,
  data: [...],
  pagination: { total: 50, page: 1, limit: 10, pages: 5 }
}
```

#### Get Product by ID

```
GET /api/products/{id}

Response: { success: true, data: {...} }
```

#### Create Product (Admin only)

```
POST /api/products
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "Football Jersey",
  "description": "Premium quality...",
  "category": "jerseys",
  "price": 1999,
  "image": "https://...",
  "sku": "JERSEY-001",
  "sizes": [
    { "size": "XS", "stock": 10 },
    { "size": "S", "stock": 15 }
  ]
}
```

### Order Endpoints

#### Create Order

```
POST /api/orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "products": [
    {
      "product": "product_id",
      "quantity": 2,
      "size": "M"
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Delhi",
    "state": "Delhi",
    "zipCode": "110001",
    "country": "India"
  },
  "paymentMethod": "card"
}

Response: { success: true, data: {...} }
```

#### Get My Orders

```
GET /api/orders/my-orders
Authorization: Bearer {token}

Response: { success: true, data: [...] }
```

#### Update Order Status (Admin only)

```
PUT /api/orders/{id}
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "status": "shipped"
}
```

---

## 🚢 Deployment Guide

### Deploy Backend to Render

1. **Create account** at [render.com](https://render.com)
2. **Connect GitHub** repository
3. **Create New Web Service**:
   - Connect your GitHub repo
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `node backend/server.js`
4. **Add Environment Variables**:

   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Generate a secure secret
   - `NODE_ENV`: production
   - `ALLOWED_ORIGINS`: Your frontend URL

5. **Deploy** - Render will automatically deploy on push to main branch

### Deploy Frontend to Vercel

1. **Create account** at [vercel.com](https://vercel.com)
2. **Import Project** from GitHub
3. **Configure**:
   - Framework: React
   - Root Directory: `frontend`
4. **Add Environment Variables**:
   - `REACT_APP_API_BASE_URL`: Your Render backend URL
5. **Deploy** - Vercel will auto-deploy on push

### Setup MongoDB Atlas

1. **Create account** at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. **Create Cluster**:
   - Choose free tier (M0)
   - Select region closest to you
3. **Create Database User**:
   - Username: `admin`
   - Password: Generate strong password
4. **Get Connection String**:
   - Click "Connect"
   - Choose "Connect your application"
   - Copy MongoDB+SRV connection string
   - Replace `<password>` and `<database>`

---

## 👤 Demo Accounts

Pre-configured demo accounts for testing:

### Admin Account

```
Email: admin@90plusstore.com
Password: admin123
Role: Admin (Full access to dashboard)
```

### User Account

```
Email: user@90plusstore.com
Password: user123
Role: Regular User (Can browse, order, view orders)
```

> **Note**: Use these accounts to test the application. You can create your own accounts through the registration page.

---

## 📊 Database Models

### User Schema

```javascript
{
  name: String (required, max 100 chars),
  email: String (required, unique),
  password: String (hashed with bcrypt),
  isAdmin: Boolean (default: false),
  profileImage: String (optional URL),
  phone: String (optional),
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Product Schema

```javascript
{
  name: String (required),
  description: String (required),
  category: String (enum: ['jerseys', 'boots', 'balls', 'accessories']),
  price: Number (required, min: 0),
  image: String (URL),
  sizes: [
    {
      size: String,
      stock: Number (default: 0)
    }
  ],
  rating: Number (0-5),
  reviews: [
    {
      user: ObjectId (ref: User),
      rating: Number,
      comment: String,
      createdAt: Date
    }
  ],
  isActive: Boolean (default: true),
  sku: String (unique),
  createdAt: Date,
  updatedAt: Date
}
```

### Order Schema

```javascript
{
  user: ObjectId (ref: User, required),
  products: [
    {
      product: ObjectId (ref: Product),
      quantity: Number,
      size: String,
      price: Number
    }
  ],
  totalPrice: Number (required),
  status: String (enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']),
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  paymentMethod: String (enum: ['card', 'upi', 'netbanking']),
  paymentStatus: String (enum: ['pending', 'completed', 'failed']),
  notes: String (optional),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔐 Security Features

- ✅ **Password Hashing**: bcryptjs with salt rounds
- ✅ **JWT Authentication**: Tokens expire in 7 days
- ✅ **Role-Based Access Control**: Admin-only endpoints protected
- ✅ **Token Validation**: Every protected request verified
- ✅ **Input Validation**: Server-side validation on all endpoints
- ✅ **CORS Protection**: Configurable allowed origins
- ✅ **Error Handling**: Centralized error handling, no sensitive data exposure
- ✅ **Auto-Logout**: Frontend redirects to login on 401

---

## 📱 Mobile Responsiveness

The application is fully responsive with breakpoints for:

- **Mobile**: 320px - 480px
- **Tablet**: 481px - 768px
- **Desktop**: 769px and up

All pages and components adapt seamlessly across devices.

---

## 📝 Code Quality

- **Comments**: JSDoc comments on all functions
- **Naming**: Clear, descriptive variable and function names
- **Structure**: Modular code with separation of concerns
- **Error Handling**: Try-catch blocks with user-friendly messages
- **Validation**: Input validation on client and server
- **Accessibility**: Semantic HTML, proper labels, ARIA attributes

---

## 🤝 Contributing

This is a portfolio project. Feel free to fork and customize:

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit changes (`git commit -m 'Add amazing feature'`)
3. Push to branch (`git push origin feature/amazing-feature`)
4. Open Pull Request

---

## 📄 License

This project is open source and available under the MIT License.

---

## 🆘 Troubleshooting

### Backend won't connect to MongoDB

- Check MongoDB Atlas connection string in `.env`
- Ensure IP address is whitelisted in MongoDB Atlas
- Verify database name exists in connection string

### Frontend can't reach backend API

- Ensure backend is running on `http://localhost:5000`
- Check `.env` `REACT_APP_API_BASE_URL` is correct
- Verify CORS is enabled in backend

### Npm install fails

- Delete `node_modules` and `package-lock.json`
- Clear npm cache: `npm cache clean --force`
- Run `npm install` again

### Port already in use

- Change port in `.env` and update CORS origins
- Or kill process using the port: `lsof -i :5000` (macOS/Linux)

---

## 📞 Support

For issues or questions:

1. Check the troubleshooting section above
2. Review API documentation
3. Check browser console and backend logs
4. Create an issue with detailed error messages

---

## ✨ Future Enhancements

Potential features for future versions:

- Real payment gateway integration (Stripe, Razorpay)
- Email notifications for order updates
- Product reviews and ratings system
- Wishlist functionality
- Advanced search and filtering
- Newsletter subscription
- Analytics dashboard
- Inventory management alerts
- Multi-language support
- Dark mode

---

## 🎓 Learning Resources

This project demonstrates:

- **React**: Hooks, Context API, Routing, Component Lifecycle
- **Node.js/Express**: RESTful APIs, Middleware, Authentication
- **MongoDB**: Schema design, Relationships, Aggregation
- **Security**: Password hashing, JWT, CORS, Role-based access
- **Responsive Design**: Mobile-first, CSS Grid, Flexbox
- **Best Practices**: Error handling, validation, code organization

---

**Happy coding! 🚀 Make this project your own and showcase it in your portfolio!**

Last Updated: December 2025
