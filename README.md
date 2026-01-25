<div align="center">

# ⚽ 90PlusStore

#### A Production-Ready MERN Stack E-Commerce Application for Football Merchandise

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v14+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v18-blue.svg)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-darkgreen.svg)](https://www.mongodb.com/cloud/atlas)
[![Status](https://img.shields.io/badge/Status-Active-brightgreen.svg)](#)

[Live Demo](https://nine0plusstore.onrender.com) • [Documentation](#-documentation) • [Issues](https://github.com/Apurba-0001/90PlusStore/issues) • [Support](#-support)

</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Deployment](#-deployment)
- [Environment Setup](#-environment-variables)
- [Documentation](#-documentation)
- [Security](#-security-considerations)
- [Contributing](#-contributing)
- [Support](#-support)
- [License](#-license)

---

## ✨ What Makes This Special

**Complete Platform:** Full e-commerce solution from product browsing to order tracking  
**Production-Ready:** JWT auth, RBAC, input validation, secure deployments  
**Optimized:** Redis caching, CDN images, lazy loading, paginated queries  
**Modular & Extensible:** Clean architecture makes it easy to add features

### Core Features

- 🛒 Complete shopping workflow (search, filters, cart, checkout)
- 👤 User authentication & secure multi-address checkout
- ⭐ Product reviews, ratings, wishlist system
- 📊 Admin dashboard with product & order management
- 📱 Mobile-first responsive design
- 🖼️ CDN-optimized images via ImageKit

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

## 🚀 Quick Start

**Need:** Node.js (v14+), MongoDB Atlas (free), Git

```bash
# Clone and setup
git clone https://github.com/Apurba-0001/90PlusStore.git
cd 90PlusStore

# Backend (Terminal 1)
cd backend && npm install && npm start

# Frontend (Terminal 2)
cd frontend && npm install && npm run dev
```

👉 **[See GETTING_STARTED.md for:](#-documentation)**

- Demo credentials
- MongoDB Atlas setup
- ImageKit configuration
- Environment variables
- Troubleshooting

---

## 🌐 Deployment

**Both frontend and backend deploy on [Render](https://render.com) - Quick setup, free tier available**

👉 **[See DEPLOYMENT_GUIDE.md for:](#-documentation)**

- Step-by-step deployment instructions
- Environment variables configuration
- Security checklist
- Performance optimization
- Custom domain setup

---

## 📚 Documentation

| Document                                       | Purpose                                                    |
| ---------------------------------------------- | ---------------------------------------------------------- |
| [GETTING_STARTED.md](./GETTING_STARTED.md)     | Setup, credentials, environment variables, troubleshooting |
| [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)   | Production deployment, security checklist, performance     |
| [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) | Complete API reference and endpoints                       |
| [TECHNOLOGIES_USED.md](./TECHNOLOGIES_USED.md) | Detailed tech stack with versions                          |
| [DEPLOY_FREE.md](./DEPLOY_FREE.md)             | Free hosting options and alternatives                      |

## 🔐 Security

✅ JWT authentication (7-day expiration)  
✅ bcryptjs password hashing (10 rounds)  
✅ Role-based access control (RBAC)  
✅ Environment variable protection  
✅ Input validation (client & server)  
✅ CORS configuration

👉 **[Full security checklist in DEPLOYMENT_GUIDE.md](#-documentation)**

## ⚡ Performance

✅ Redis caching for products & featured items  
✅ Pagination for large datasets  
✅ Indexed MongoDB queries  
✅ Vite fast build, React Router lazy loading  
✅ CDN-optimized images (ImageKit)  
✅ Production-optimized builds

👉 **[Detailed optimization guide in DEPLOYMENT_GUIDE.md](#-documentation)**

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

## 💬 Support

Need help? Multiple ways to get support:

### Get Help

| Channel              | Purpose           | Response Time   |
| -------------------- | ----------------- | --------------- |
| 📧 **Email**         | General inquiries | 24-48 hours     |
| 🐛 **Bug Reports**   | Report issues     | 48-72 hours     |
| 💬 **Discussions**   | Q&A & ideas       | Community-based |
| 📖 **Documentation** | Read guides       | Anytime         |
| 🚀 **Live Demo**     | Try it live       | Anytime         |

### Contact Methods

- 📧 **Email**: [90plusstore0@gmail.com](mailto:90plusstore0@gmail.com)
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/Apurba-0001/90PlusStore/issues)
- 💬 **Questions**: [GitHub Discussions](https://github.com/Apurba-0001/90PlusStore/discussions)
- 🔗 **Try Live**: [Visit Demo](https://nine0plusstore.onrender.com)

### Before Asking for Help

1. ✅ Check [Documentation](#-documentation)
2. ✅ Search [existing issues](https://github.com/Apurba-0001/90PlusStore/issues)
3. ✅ Read [Troubleshooting](#-troubleshooting) section
4. ✅ Review [FAQ](#faq)

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
