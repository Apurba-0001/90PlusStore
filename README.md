# 90PlusStore

A Production-Ready MERN Stack E-Commerce Application for Football Merchandise

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v14+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v18-blue.svg)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-darkgreen.svg)](https://www.mongodb.com/cloud/atlas)
[![Status](https://img.shields.io/badge/Status-Active-brightgreen.svg)](#)

[Live Demo](https://nine0plusstore.onrender.com) • [Documentation](#documentation) • [Issues](https://github.com/Apurba-0001/90PlusStore/issues) • [Support](#support)

## Who This Is For

**Beginners to intermediate MERN learners** who want to build a complete, real-world e-commerce application without starting from scratch. Perfect for portfolios, learning projects, or as a foundation for customization.

## What You Will Learn

- **JWT Authentication** — Implement secure token-based user authentication
- **Role-Based Access Control** — Build admin-only features with middleware
- **CRUD Operations** — Full MongoDB data operations (Create, Read, Update, Delete)
- **State Management** — React Context API for global app state (auth, cart, wishlist)
- **Deployment** — Deploy a production MERN app for free on Render
- **RESTful API Design** — Build scalable backend endpoints with Express
- **Database Modeling** — Design and query MongoDB schemas
- **Real-World Features** — Shopping cart, orders, reviews, admin dashboard

---

## Why This Project Is Great for Learning

- **Complete Platform** — Full e-commerce solution from product browsing to order tracking
- **Production-Ready** — JWT auth, RBAC, input validation, secure deployments
- **Optimized** — Redis caching, CDN images, lazy loading, paginated queries
- **Modular** — Clean architecture makes it easy to add features

## Features by Learning Concept

**Authentication & Security**

- User registration and JWT-based login
- Password hashing with bcryptjs
- Protected routes (frontend & backend)
- Role-based access control (RBAC) for admin features

**State Management**

- Context API for auth state (login/logout)
- Cart state management (add, remove, update)
- Wishlist persistence across page reloads

**Data & Database**

- MongoDB schema design with Mongoose
- Product catalog with reviews and ratings
- Order management with status tracking
- User profile with multiple addresses

**Admin Workflows**

- Add/edit/delete products
- Manage featured products
- View and update order status
- User management (view, make admin)

**Product Categories:** Jerseys, Jackets, Footwear, Shorts, Tracksuits, Collectibles, Accessories

## Tech Stack

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

### Storage & Services

- **Image Storage**: ImageKit (for product images and user avatars)
- **Database**: MongoDB Atlas
- **Cache**: Redis (optional)

### Deployment

- Frontend: Render
- Backend: Render
- Database: MongoDB Atlas (free tier)
- Image Storage: ImageKit
- Cache: Redis

## Quick Start

**Prerequisites:** Node.js (v14+), MongoDB Atlas (free tier), Git

**Note:** Payment gateways are not implemented yet—orders work with test data. Redis caching is optional and safe to skip for beginners.

### 1. Start the Backend

This runs the Express server with all API endpoints (user auth, products, orders, admin features).

```bash
# Terminal 1
git clone https://github.com/Apurba-0001/90PlusStore.git
cd 90PlusStore/backend
npm install
npm start
```

### 2. Start the Frontend

This runs the React development server with hot reload (auto-refresh on code changes).

```bash
# Terminal 2 (keep terminal 1 running)
cd 90PlusStore/frontend
npm install
npm run dev
```

Browser opens at `http://localhost:5173` — you're ready to explore!

→ **[See GETTING_STARTED.md](./GETTING_STARTED.md)** for demo credentials, MongoDB setup, and troubleshooting

---

## Deployment

Deploy both frontend and backend on **[Render](https://render.com)** (free tier available)

→ **[See DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** for step-by-step instructions, security checklist, and performance optimization

---

## Documentation — Suggested Reading Order

Start here and progress through each guide in order:

| #   | Document                                       | When to Read                      | Purpose                                                              |
| --- | ---------------------------------------------- | --------------------------------- | -------------------------------------------------------------------- |
| 1️⃣  | [GETTING_STARTED.md](./GETTING_STARTED.md)     | **Before running the app**        | Local setup, MongoDB Atlas config, demo credentials, troubleshooting |
| 2️⃣  | [Backend README](./backend/README.md)          | **After Quick Start works**       | Understand backend architecture, controllers, routes, middleware     |
| 3️⃣  | [Frontend README](./frontend/README.md)        | **While exploring frontend code** | Understand component structure, Context API usage, state flow        |
| 4️⃣  | [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) | **When building features**        | Complete endpoint reference (request/response examples)              |
| 5️⃣  | [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)   | **When ready to deploy**          | Deploy to Render, security checklist, production setup               |
| 6️⃣  | [TECHNOLOGIES_USED.md](./TECHNOLOGIES_USED.md) | **For dependency details**        | Package versions, why each tech was chosen                           |
| 7️⃣  | [DEPLOY_FREE.md](./DEPLOY_FREE.md)             | **Exploring alternatives**        | Other free hosting options                                           |

**Optional Services Clarification:**

- **MongoDB Atlas** ✅ Required — Stores all data
- **ImageKit** ✅ Required — Displays product images (already configured with sample images)
- **Redis** ❌ Optional — Speeds up queries; skip it while learning
- **GitHub** ✅ Required — For deployment (code hosting)

## How It Works (High-Level Architecture)

```
User Types: Login in Browser → Frontend (React) → Backend (Express) → MongoDB → Response Back
                                  ↓
                              Context API manages:
                              • Auth state (logged in?)
                              • Shopping cart
                              • Wishlist
```

**Where Business Logic Lives:**

- Backend `/controllers` — Authentication, product CRUD, order processing
- Backend `/middleware` — JWT verification, role checking
- Frontend `/context` — Global state (auth, cart, wishlist)
- Frontend `/pages` — User flows (browse, cart, checkout)
- Frontend `/components` — Reusable UI pieces

**Where Authentication is Enforced:**

- Backend: `auth.js` middleware checks JWT on protected routes
- Frontend: `ProtectedRoute.jsx` redirects non-logged-in users

---

## Security & Performance

**Security:** JWT authentication (7-day expiration) • bcryptjs password hashing (10 rounds) • Role-based access control • Input validation (client & server) • CORS configuration

**Performance:** Redis caching • Pagination for large datasets • Indexed MongoDB queries • Vite fast builds • React Router lazy loading • CDN-optimized images

→ **[Full details in DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)**

## Try This First — Beginner Checklist

After setup completes, test these core features:

- [ ] **Create Account** — Register with your email
- [ ] **Login** — Use your credentials to log in
- [ ] **Browse Products** — Explore the product catalog
- [ ] **Add to Cart** — Click "Add to Cart" on a product
- [ ] **View Cart** — Check your cart items
- [ ] **Place Test Order** — Complete checkout (use test payment)
- [ ] **View Order History** — Check your profile
- [ ] **Admin Dashboard** — Login as admin@example.com, see admin features
- [ ] **Add Product** (Admin) — Try creating a new product

If any step fails, check [GETTING_STARTED.md](./GETTING_STARTED.md#troubleshooting) troubleshooting section.

---

## Common Beginner Mistakes

**CORS Errors?** — Frontend and backend on different ports. Check `.env` has correct `VITE_API_URL`

**MongoDB won't connect?** — IP whitelist issue. Go to MongoDB Atlas → Network Access → whitelist your IP

**"API URL undefined" errors?** — Missing `.env` file in frontend or backend. Copy from `.env.example`

**Can't login?** — Use demo credentials from [GETTING_STARTED.md](./GETTING_STARTED.md#demo-accounts), not random email

**Images not loading?** — ImageKit is set up with sample images; custom uploads require ImageKit dashboard access

---

## Contributing

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

## Support

**Email:** [90plusstore0@gmail.com](mailto:90plusstore0@gmail.com)  
**Issues:** [GitHub Issues](https://github.com/Apurba-0001/90PlusStore/issues)  
**Discussions:** [GitHub Discussions](https://github.com/Apurba-0001/90PlusStore/discussions)  
**Live Demo:** [nine0plusstore.onrender.com](https://nine0plusstore.onrender.com)

Before asking for help, check [Documentation](#documentation) and search [existing issues](https://github.com/Apurba-0001/90PlusStore/issues).

---

## Future Enhancements

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

**Built by [Apurba Maji](https://github.com/Apurba-0001)** • [View on GitHub](https://github.com/Apurba-0001/90PlusStore)
