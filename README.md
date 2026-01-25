# 90PlusStore - MERN Stack E-Commerce Application

A production-ready, full-stack e-commerce application for football merchandise built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

## Features

### User Features

- ✅ User authentication (Register/Login)
- ✅ JWT-based session management
- ✅ Product browsing with category filters
- ✅ Search functionality
- ✅ Shopping cart management
- ✅ Checkout and order placement
- ✅ Order tracking
- ✅ User profile management
- ✅ Responsive design (Mobile, Tablet, Desktop)

### Admin Features

- ✅ Admin dashboard with analytics
- ✅ Product management (Create, Read, Update, Delete)
- ✅ Stock management
- ✅ Order management and status updates
- ✅ Order tracking
- ✅ Role-based access control

### Product Categories

- Jerseys
- Boots
- Shirts
- Shorts
- Special Collectibles

## Tech Stack

### Frontend

- React 18
- Vite
- React Router v6
- Axios
- Tailwind CSS
- Context API for state management

### Backend

- Node.js
- Express.js
- MongoDB (Atlas)
- Mongoose
- JWT for authentication
- bcryptjs for password hashing

### Deployment

- Frontend: Vercel or Netlify
- Backend: Render
- Database: MongoDB Atlas (free tier)

## Project Structure

```
90plusstore/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   └── Order.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   └── orderRoutes.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   └── orderController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── ProductDetail.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.jsx
│   │   │       ├── AdminProducts.jsx
│   │   │       ├── AdminProductForm.jsx
│   │   │       └── AdminOrders.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── CartContext.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── services.js
│   │   ├── styles/
│   │   │   └── index.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   ├── .env.example
│   └── .env
│
└── README.md
```

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account (free)
- Git

## Local Setup

### 1. Clone the Repository

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

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)

### Products

- `GET /api/products` - Get all products (with pagination and filtering)
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/categories` - Get all categories
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Orders

- `POST /api/orders` - Create order (protected)
- `GET /api/orders/my-orders` - Get user's orders (protected)
- `GET /api/orders/:id` - Get order by ID (protected)
- `PUT /api/orders/:id/status` - Update order status (admin only)
- `GET /api/orders/admin/all-orders` - Get all orders (admin only)

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

## Deployment Guide

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

## Environment Variables

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

## Security Considerations

1. **JWT Secret**: Change the default JWT secret in production
2. **CORS**: Backend includes CORS configuration for secure API access
3. **Password Hashing**: Passwords are hashed using bcryptjs
4. **Environment Variables**: Keep sensitive data in .env files (not in Git)
5. **Validation**: All inputs are validated on both client and server
6. **Role-Based Access**: Admin routes are protected with role verification

## Performance Optimization

- **Frontend**: Vite for fast build times and development
- **Caching**: Browser caching headers configured
- **Pagination**: Products and orders are paginated
- **Lazy Loading**: Images lazy-loaded in product cards
- **Minification**: Production builds are minified

## Troubleshooting

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

## Testing Endpoints with cURL

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

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see LICENSE file for details.

## Support

For support, email 90plusstore0@gmail.com or open an issue on GitHub.

## Future Enhancements

- [ ] Payment gateway integration (Stripe, PayPal)
- [ ] Email notifications
- [ ] Sales analytics
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Two-factor authentication
- [ ] Social media integration

---

**Made with ❤️ by Apurba Maji**
