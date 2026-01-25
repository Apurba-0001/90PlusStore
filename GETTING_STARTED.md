# Getting Started with 90PlusStore

Welcome! This guide covers everything you need to set up 90PlusStore locally.

## Prerequisites

Before you begin, ensure you have:

- **Node.js** v14 or higher ([Download](https://nodejs.org/))
- **Git** ([Download](https://git-scm.com/))
- **MongoDB Atlas account** (free tier) ([Create here](https://www.mongodb.com/cloud/atlas))
- **ImageKit account** (free tier) ([Create here](https://imagekit.io/))

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Apurba-0001/90PlusStore.git
cd 90PlusStore
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/90plusstore
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
PORT=5000
NODE_ENV=development
REDIS_URL=redis://localhost:6379 (optional)
```

Start the backend server:

```bash
npm start
```

The backend will run on **http://localhost:5000**

### 3. Frontend Setup

In a new terminal:

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend development server:

```bash
npm run dev
```

The frontend will run on **http://localhost:5173**

## Demo Accounts

Use these credentials to test all features:

### Regular User

- **Email**: `user@example.com`
- **Password**: `password123`

### Admin User

- **Email**: `admin@example.com`
- **Password**: `admin123`

**Note**: In production, create your own admin account through a proper registration process.

## MongoDB Atlas Setup

### Step 1: Create Project and Cluster

1. Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up or log in
3. Create a new project (or use default)
4. Create a new cluster:
   - Choose **M0 (free tier)**
   - Select your region
   - Click "Create Cluster"

### Step 2: Create Database User

1. Go to **Database Access** in the left menu
2. Click **Add New Database User**
3. Enter username and password
4. Select **Atlas admin** role
5. Click **Add User**

### Step 3: Whitelist IP Address

1. Go to **Network Access** in the left menu
2. Click **Add IP Address**
3. Select **Allow access from anywhere** (for development)
   - **Note**: For production, enter specific IP addresses
4. Click **Confirm**

### Step 4: Get Connection String

1. Go back to **Clusters**
2. Click **Connect** button on your cluster
3. Choose **Connect your application**
4. Copy the MongoDB URI
5. Replace `<username>` and `<password>` with your database user credentials
6. Paste into your `.env` file as `MONGODB_URI`

**Example Connection String**:

```
mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/90plusstore?retryWrites=true&w=majority
```

## ImageKit Setup

### Step 1: Create ImageKit Account

1. Visit [ImageKit](https://imagekit.io/)
2. Sign up with email or GitHub
3. Create a new project

### Step 2: Get Your Credentials

1. Go to **Settings** → **Developer options**
2. Note your **Public Key** and **URL Endpoint**

### Step 3: Upload Product Images

1. Go to **Media Library**
2. Create a folder called `products`
3. Upload your product images
4. Copy the ImageKit URL for each image (shown in the file details)

### Step 4: Add Images to Products

MongoDB product document structure:

```javascript
{
  "name": "Jersey Name",
  "price": 99.99,
  "images": [
    {
      "url": "https://ik.imagekit.io/your-key/products/jersey-front.jpg",
      "alt": "Front view"
    },
    {
      "url": "https://ik.imagekit.io/your-key/products/jersey-back.jpg",
      "alt": "Back view"
    }
  ]
}
```

**No backend code integration needed** - just store the URLs in MongoDB!

## Environment Variables

### Backend `.env` File

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/90plusstore

# Authentication
JWT_SECRET=your_secret_key_min_32_characters_recommended
JWT_EXPIRY=7d

# Server
PORT=5000
NODE_ENV=development

# Cache (optional)
REDIS_URL=redis://localhost:6379

# Email (future use)
MAIL_SERVICE=gmail
MAIL_EMAIL=your-email@gmail.com
MAIL_PASS=your-app-password
```

### Frontend `.env` File

```env
VITE_API_URL=http://localhost:5000/api
```

## Troubleshooting

### MongoDB Connection Errors

**Error**: `MongoNetworkError`

**Solutions**:

- Check your MongoDB URI in `.env`
- Verify IP whitelist includes your current IP
- Ensure database user has correct password
- Check network connectivity

### CORS Errors

**Error**: `Access to XMLHttpRequest at 'http://localhost:5000/api...' from origin 'http://localhost:5173' has been blocked by CORS policy`

**Solutions**:

- Verify backend is running on port 5000
- Check `VITE_API_URL` in frontend `.env` matches backend URL
- Restart both frontend and backend servers

### Port Already in Use

**Error**: `Error: listen EADDRINUSE :::5000`

**Windows**:

```bash
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**Mac/Linux**:

```bash
lsof -i :5000
kill -9 <PID>
```

### JWT Token Errors

**Error**: `JsonWebTokenError: invalid signature`

**Solutions**:

- Ensure `JWT_SECRET` is the same in `.env` and backend code
- Check token hasn't expired (default: 7 days)
- Try logging out and logging back in

### npm install Fails

**Solutions**:

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### ImageKit URLs Not Loading

**Solutions**:

- Verify ImageKit URLs are correct format: `https://ik.imagekit.io/your-key/...`
- Check images are uploaded to ImageKit
- Verify URL endpoints in CORS settings

### Build Errors

**Frontend build fails**:

```bash
# Clear Vite cache
rm -rf frontend/.vite

# Rebuild
cd frontend && npm run build
```

**Backend issues**:

```bash
# Check Node version
node --version  # Should be v14+

# Verify all dependencies installed
npm ls
```

## Development Tips

### Useful Backend Commands

```bash
# Start with auto-reload (requires nodemon)
npm run dev

# Run migrations
npm run migrate

# Clear cache
npm run clear-cache
```

### Frontend Development

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint and format
npm run lint
npm run format
```

### Database Management

**View Collections**:

1. Open MongoDB Atlas
2. Click **Browse Collections**
3. View/edit documents directly

**Export Data**:

1. Click **Data Export** in the left menu
2. Select collections to export
3. Download as JSON

## Next Steps

- **Explore the [Live Demo](https://nine0plusstore.onrender.com)**
- **Read [API Documentation](./API_DOCUMENTATION.md)**
- **Check [Deployment Guide](./DEPLOYMENT_GUIDE.md)** for production setup
- **Review [Contributing Guide](./README.md#contributing)**

## Getting Help

- 📖 **Documentation**: Check [README.md](./README.md)
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/Apurba-0001/90PlusStore/issues)
- 💬 **Questions**: [GitHub Discussions](https://github.com/Apurba-0001/90PlusStore/discussions)
- 📧 **Email**: [90plusstore0@gmail.com](mailto:90plusstore0@gmail.com)
