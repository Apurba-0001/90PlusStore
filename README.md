# 🛒 90PlusStore

<div align="center">

## Professional Full-Stack E-Commerce Platform

**A production-ready, enterprise-grade e-commerce platform specializing in football merchandise, built with the modern MERN stack.**

_Designed for scalability, security, and optimal user experience across all devices._

</div>

---

<div align="center">

### 🚀 Technology Stack

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)

</div>

---

---
## 🚀 Live Demo

https://nine0plusstore.onrender.com

## ✨ Key Features

### 👥 Customer Features

- 🔐 **Authentication & Security** - Secure user registration and JWT-based authentication
- 🔍 **Product Discovery** - Advanced browsing with category filters, search functionality, and product recommendations
- 🛍️ **Shopping Experience** - Intuitive shopping cart, checkout process, and order management
- 📦 **Order Management** - Real-time order tracking and comprehensive order history
- 👤 **Account Management** - User profile management with order and wishlist functionality
- 📱 **Responsive Design** - Fully optimized for mobile, tablet, and desktop devices

### ⚙️ Administrative Features

- 📊 **Dashboard Analytics** - Comprehensive performance metrics and business intelligence
- 📦 **Product Management** - Complete CRUD operations with inventory management
- 📋 **Order Administration** - Order processing, tracking, and status management
- 👥 **User Management** - Administrative user oversight and role-based access control
- ⭐ **Content Management** - Featured products and inventory optimization

---

## 📚 Technology Stack

### 🎨 Frontend Architecture

|                                                      Technology                                                      | Purpose                                  |
| :------------------------------------------------------------------------------------------------------------------: | :--------------------------------------- |
|            ![React](https://img.shields.io/badge/React%2018-61DAFB?logo=react&logoColor=black&style=flat)            | Component-based UI framework             |
|                ![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white&style=flat)                | Lightning-fast build tool and dev server |
| ![React Router](https://img.shields.io/badge/React%20Router%20v6-CA4245?logo=reactrouter&logoColor=white&style=flat) | Client-side routing and navigation       |
|   ![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?logo=tailwindcss&logoColor=white&style=flat)    | Utility-first CSS framework              |
|              ![Axios](https://img.shields.io/badge/Axios-5A29E4?logo=axios&logoColor=white&style=flat)               | HTTP client for API communication        |
|            ![EmailJS](https://img.shields.io/badge/EmailJS-3D3D3D?logo=gmail&logoColor=white&style=flat)             | Email notification service               |

### 🔧 Backend Architecture

|                                              Technology                                               | Purpose                        |
| :---------------------------------------------------------------------------------------------------: | :----------------------------- |
|   ![Node.js](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white&style=flat)   | JavaScript runtime environment |
| ![Express.js](https://img.shields.io/badge/Express.js-000000?logo=express&logoColor=white&style=flat) | RESTful API framework          |
|    ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white&style=flat)    | NoSQL database                 |
|    ![Mongoose](https://img.shields.io/badge/Mongoose-800?logo=mongoose&logoColor=white&style=flat)    | Object data modeling (ODM)     |
|     ![JWT](https://img.shields.io/badge/JWT-000000?logo=jsonwebtokens&logoColor=white&style=flat)     | Secure authentication          |
|       ![Axios](https://img.shields.io/badge/Axios-5A29E4?logo=axios&logoColor=white&style=flat)       | HTTP client for API calls      |
|       ![Redis](https://img.shields.io/badge/Redis-DC382D?logo=redis&logoColor=white&style=flat)       | In-memory caching layer        |

### 🚀 Deployment Infrastructure

|                                                   Platform                                                    | Purpose                       |
| :-----------------------------------------------------------------------------------------------------------: | :---------------------------- |
|         ![Render](https://img.shields.io/badge/Render-46E3B7?logo=render&logoColor=white&style=flat)          | Frontend & Backend Deployment |
| ![MongoDB Atlas](https://img.shields.io/badge/MongoDB%20Atlas-47A248?logo=mongodb&logoColor=white&style=flat) | Database Hosting              |

---

## Project Architecture

### Directory Structure

````
90plusstore/
│
├── backend/                        # Node.js/Express API Server
│   ├── config/                     # Configuration files
│   ├── controllers/                # Request handlers
│   ├── middleware/                 # Authentication & caching
│   ├── models/                     # Database schemas
│   ├── routes/                     # API endpoints
│   ├── migrations/                 # Database migrations
│   ├── server.js                   # Entry point
│   └── package.json
│
├── frontend/                       # React Application
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   ├── context/                # State management
│   │   ├── pages/                  # Route pages
│   │   │   └── admin/              # Admin dashboard
│   │   ├── services/               # API services
│   │   ├── styles/                 # Global styles
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
└── Documentation files

---

## 📋 System Requirements

| Requirement | Version |
| :--- | :--- |
| 🟢 **Node.js** | v18 - v20 |
| 📦 **npm** or **yarn** | Latest version |
| 🗄️ **MongoDB Atlas** | Free tier account |
| 📂 **Git** | Latest version |

---

## ✅ Validation Rules (Frontend + Backend Synced)

These input constraints are intentionally kept identical in both apps to avoid false positives in UI and 400 errors from API validation.

### Name Fields

- **name** (register/profile/admin): English letters and spaces only, length **2-100**
- **contact name** (contact form): English letters and spaces only, length **2-80**

### Address Text Fields

- **city**, **state**, **country**: English letters and spaces only, length **2-60**

### Source Of Truth

- Backend rules live in: `backend/utils/validationRules.js`
- Frontend rules live in: `frontend/src/utils/validationRules.js`

When changing any validation constraint, update both files in the same commit.

---

## 🎯 Getting Started

### 1️⃣ Repository Setup

```bash
git clone https://github.com/yourusername/90plusstore.git
cd 90plusstore
````

### 2️⃣ Backend Configuration

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env

# Update .env with your credentials:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/test
# JWT_SECRET=your_super_secret_key
# NODE_ENV=development

# Start development server
npm run dev
```

**Backend runs on**: `http://localhost:5000`

### 3️⃣ Frontend Configuration

```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env

# Update .env:
# VITE_API_URL=http://localhost:5000/api

# Start development server
npm run dev
```

**Frontend runs on**: `http://localhost:3000`

---

## 🔑 Demo Credentials

### 🛡️ Administrator Account

```
Email:    admin@90plusstore.com
Password: admin123
```

### 👤 Standard User Account

```
Email:    user@90plusstore.com
Password: user123
```

---

## 🗄️ MongoDB Atlas Configuration

To set up your database:

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new free tier cluster
3. Configure database user (username & password)
4. Whitelist your IP address
5. Obtain connection string
6. Add to backend `.env`:

```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/90plusstore?retryWrites=true&w=majority
```

---

## 🚀 Deployment Guide

### Deploy Frontend & Backend to Render

Both frontend and backend are deployed on Render:

#### 1. Deploy Backend

1. Push code to GitHub
2. Access [Render Dashboard](https://dashboard.render.com)
3. Create new Web Service
4. Connect GitHub repository
5. Configure deployment:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: `backend`
6. Set environment variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Secure secret key
   - `NODE_ENV`: `production`
7. Deploy

**Backend URL**: `https://your-app-name.onrender.com`

#### 2. Deploy Frontend

1. In [Render Dashboard](https://dashboard.render.com), create another Web Service
2. Connect same GitHub repository
3. Configure settings:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run preview`
   - **Root Directory**: `frontend`
4. Set environment variable:
   - `VITE_API_URL`: `https://your-backend-url.onrender.com/api`
5. Deploy

**Frontend URL**: `https://your-frontend-app.onrender.com`

### ImageKit Configuration for Product Images

Product images are managed externally using ImageKit:

1. Upload images to [ImageKit](https://imagekit.io)
2. Copy the ImageKit URL for each image
3. Store the image URL in MongoDB product documents
4. Frontend fetches and displays images from the stored URLs in MongoDB

_Note: ImageKit integration is handled manually during product setup, not directly in the application code._

---

## 📦 Building for Production

### 🔧 Backend Production Build

```bash
cd backend
npm start  # Runs server on PORT specified in .env
```

### 🎨 Frontend Production Build

```bash
cd frontend
npm run build  # Creates optimized production build in dist/
npm run preview  # Preview production build locally
```

---

## ⚙️ Environment Configuration

### 🔐 Backend Environment Variables (`.env`)

```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/hbujio
JWT_SECRET=your_super_secret_jwt_key_change_in_production
PORT=5000
NODE_ENV=production
```

### 🎨 Frontend Environment Variables (`.env`)

```env
VITE_API_URL=https://your-backend-url.onrender.com/api
```

---

## 🔒 Security Best Practices

| Practice                  | Description                                      |
| ------------------------- | ------------------------------------------------ |
| **JWT Secret Management** | Use strong, unique secret in production          |
| **CORS Configuration**    | Backend includes proper CORS setup               |
| **Password Encryption**   | bcryptjs hashing for all passwords               |
| **Environment Variables** | Store sensitive data in .env (never commit)      |
| **Input Validation**      | All inputs validated client-side and server-side |
| **Role-Based Access**     | Admin routes protected with role verification    |
| **HTTPS Only**            | Use secure connections in production             |

---

## ⚡ Performance Optimization

- **Frontend Build**: Vite provides optimized, fast builds
- **Code Splitting**: Lazy-loaded components and routes
- **Image Optimization**: Lazy loading in product cards
- **API Pagination**: Products and orders use pagination
- **Caching Strategy**: Browser caching headers configured
- **Minification**: Production builds automatically minified

---

## 🐛 Troubleshooting

### MongoDB Connection Issues

**Problem**: Cannot connect to MongoDB

- Verify IP whitelist in MongoDB Atlas
- Check connection string in `.env`
- Ensure database user has appropriate permissions

### CORS Errors

**Problem**: Frontend cannot reach backend API

- Verify backend CORS configuration
- Confirm frontend API URL matches backend URL
- Check browser console for specific error messages

### Port Already in Use

**Windows**:

```bash
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**Linux/Mac**:

```bash
lsof -i :5000
kill -9 <PID>
```

### JWT Token Expiration

**Problem**: "Token expired" error

- Tokens expire after 7 days
- Users must login again to refresh token
- Implement token refresh logic for better UX

---

## 🧪 API Testing with cURL

### User Registration

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"John Doe",
    "email":"john@example.com",
    "password":"securepass123"
  }'
```

### User Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"john@example.com",
    "password":"securepass123"
  }'
```

### Get Products

```bash
curl http://localhost:5000/api/products
```

### Get Product Categories

```bash
curl http://localhost:5000/api/products/categories
```

---

## 🤝 Contributing

We welcome contributions! To contribute:

1. **Fork** the repository
2. **Create** a feature branch:
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit** your changes:
   ```bash
   git commit -m 'Add AmazingFeature'
   ```
4. **Push** to the branch:
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open** a Pull Request

---

## 🗺️ Roadmap

Future enhancements planned for this platform:

- [ ] Payment gateway integration (Stripe, PayPal)
- [ ] Email notification system
- [ ] Advanced sales analytics and reporting
- [ ] Multi-language support (i18n)
- [ ] Dark mode interface
- [ ] Two-factor authentication (2FA)
- [ ] Social media login integration
- [ ] Customer reviews and ratings
- [ ] Inventory alerts and notifications

---

## 📞 Support

For technical support or inquiries:

- **Email**: 90plusstore0@gmail.com
- **Issues**: Open an issue on GitHub
  
---

## 👨‍💻 Author

**Apurba Maji** - Full Stack Developer

---

_Last Updated: January 2026_
