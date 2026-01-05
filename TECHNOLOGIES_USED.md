# Project Technology Stack & Services

This project uses a variety of modern technologies, frameworks, and third-party services. Below is a comprehensive list of the main tools, libraries, and services used throughout the codebase:

## Frontend

- **React.js**: Main frontend framework for building user interfaces.
- **Vite**: Fast build tool and development server for React.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **PostCSS**: Tool for transforming CSS with JavaScript plugins.

## Backend

- **Node.js**: JavaScript runtime for server-side code.
- **Express.js**: Web application framework for Node.js.
- **Mongoose**: ODM (Object Data Modeling) library for MongoDB and Node.js.

## Database

- **MongoDB**: NoSQL database used for storing application data.

## Authentication & Security

- **JWT (JSON Web Token)**: For user authentication and authorization.
- **bcrypt**: For password hashing.

## Third-Party Services

- **Render**: Cloud platform for hosting and deploying the backend and frontend.
- **ImageKit**: Image CDN and optimization service for handling and delivering images efficiently.
- **EmailJS**: Service for sending emails directly from the frontend.

## Other Tools & Libraries

- **dotenv**: Loads environment variables from a `.env` file.
- **CORS**: Middleware for enabling Cross-Origin Resource Sharing.
- **Morgan**: HTTP request logger middleware for Node.js.
- **Nodemon**: Utility for automatically restarting the server during development.

---

## How These Are Used

- **Frontend**: Built with React, styled using Tailwind CSS, and bundled with Vite. Communicates with the backend via REST APIs.
- **Backend**: Node.js/Express server handles API requests, authentication, and business logic. Mongoose manages MongoDB data models.
- **ImageKit**: Used for image uploads, storage, and delivery (e.g., product images).
- **EmailJS**: Sends transactional emails (e.g., order confirmations, password resets) from the frontend.
- **Render**: Hosts both backend and frontend for production deployment.

---

For more details, see the respective `README.md` files or documentation for each technology/service.
