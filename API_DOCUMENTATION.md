# API Documentation

## Base URL

- Development: `http://localhost:5000/api`
- Production: `https://your-backend-url.com/api`

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### Register User

**POST** `/auth/register`

Creates a new user account.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (201):**

```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

---

### Login

**POST** `/auth/login`

Authenticates user and returns JWT token.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200):**

```json
{
  "message": "Logged in successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

---

### Get Profile

**GET** `/auth/profile`

Retrieves authenticated user's profile.

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "phone": "+1234567890",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "zipCode": "10001"
  }
}
```

---

### Update Profile

**PUT** `/auth/profile`

Updates user profile information.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "name": "Jane Doe",
  "phone": "+1234567890",
  "address": {
    "street": "456 Oak Ave",
    "city": "Los Angeles",
    "state": "CA",
    "country": "USA",
    "zipCode": "90001"
  }
}
```

**Response (200):**

```json
{
  "message": "Profile updated successfully",
  "user": { ... }
}
```

---

## Product Endpoints

### Get All Products

**GET** `/products`

Retrieves paginated list of products with optional filtering.

**Query Parameters:**

- `category` (optional): Filter by category
- `search` (optional): Search by name or description
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10): Items per page

**Example:**

```
GET /products?category=Jerseys&page=1&search=football
```

**Response (200):**

```json
{
  "products": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Classic Jersey",
      "description": "Premium football jersey",
      "price": 79.99,
      "category": "Jerseys",
      "stock": 50,
      "rating": 4.5,
      "brand": "Nike",
      "sku": "JER-001",
      "images": [
        {
          "url": "https://example.com/image.jpg",
          "alt": "Jersey Front"
        }
      ]
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "pages": 10
  }
}
```

---

### Get Product by ID

**GET** `/products/:id`

Retrieves a specific product by ID.

**Response (200):**

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Classic Jersey",
  "description": "Premium football jersey",
  "price": 79.99,
  "category": "Jerseys",
  "stock": 50,
  "rating": 4.5,
  "brand": "Nike",
  "sku": "JER-001",
  "images": [...]
}
```

---

### Get Categories

**GET** `/products/categories`

Retrieves all available product categories.

**Response (200):**

```json
["Jerseys", "Boots", "Shirts", "Shorts", "Special Collectibles"]
```

---

### Create Product (Admin Only)

**POST** `/products`

Creates a new product.

**Headers:**

```
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Premium Jersey",
  "description": "High-quality football jersey",
  "price": 99.99,
  "category": "Jerseys",
  "stock": 100,
  "brand": "Adidas",
  "sku": "ADI-JERSEY-001",
  "images": [
    {
      "url": "https://example.com/product.jpg",
      "alt": "Product Image"
    }
  ]
}
```

**Response (201):**

```json
{
  "message": "Product created successfully",
  "product": { ... }
}
```

---

### Update Product (Admin Only)

**PUT** `/products/:id`

Updates an existing product.

**Headers:**

```
Authorization: Bearer <admin-token>
```

**Request Body:** Same as Create Product

**Response (200):**

```json
{
  "message": "Product updated successfully",
  "product": { ... }
}
```

---

### Delete Product (Admin Only)

**DELETE** `/products/:id`

Deletes a product.

**Headers:**

```
Authorization: Bearer <admin-token>
```

**Response (200):**

```json
{
  "message": "Product deleted successfully"
}
```

---

## Order Endpoints

### Create Order

**POST** `/orders`

Creates a new order.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "products": [
    {
      "productId": "507f1f77bcf86cd799439011",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "zipCode": "10001"
  },
  "paymentMethod": "credit-card"
}
```

**Response (201):**

```json
{
  "message": "Order created successfully",
  "order": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "products": [...],
    "totalPrice": 159.98,
    "status": "pending",
    "paymentStatus": "pending",
    "shippingAddress": {...},
    "createdAt": "2024-01-01T12:00:00Z"
  }
}
```

---

### Get My Orders

**GET** `/orders/my-orders`

Retrieves authenticated user's orders.

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "products": [...],
    "totalPrice": 159.98,
    "status": "pending",
    "createdAt": "2024-01-01T12:00:00Z"
  }
]
```

---

### Get Order by ID

**GET** `/orders/:id`

Retrieves a specific order. Users can only view their own orders (admins can view any).

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "_id": "507f1f77bcf86cd799439012",
  "userId": {...},
  "products": [...],
  "totalPrice": 159.98,
  "status": "pending",
  "shippingAddress": {...},
  "createdAt": "2024-01-01T12:00:00Z"
}
```

---

### Update Order Status (Admin Only)

**PUT** `/orders/:id/status`

Updates order status.

**Headers:**

```
Authorization: Bearer <admin-token>
```

**Request Body:**

```json
{
  "status": "shipped"
}
```

**Valid Status Values:**

- `pending`
- `processing`
- `shipped`
- `delivered`
- `cancelled`

**Response (200):**

```json
{
  "message": "Order status updated successfully",
  "order": { ... }
}
```

---

### Get All Orders (Admin Only)

**GET** `/orders/admin/all-orders`

Retrieves all orders with optional filtering.

**Headers:**

```
Authorization: Bearer <admin-token>
```

**Query Parameters:**

- `status` (optional): Filter by status
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10): Items per page

**Response (200):**

```json
{
  "orders": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "userId": {...},
      "products": [...],
      "totalPrice": 159.98,
      "status": "pending",
      "createdAt": "2024-01-01T12:00:00Z"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "pages": 5
  }
}
```

---

## Error Responses

### 400 Bad Request

```json
{
  "message": "Validation error",
  "errors": ["Field is required"]
}
```

### 401 Unauthorized

```json
{
  "message": "Invalid or expired token"
}
```

### 403 Forbidden

```json
{
  "message": "Admin access required"
}
```

### 404 Not Found

```json
{
  "message": "Product not found"
}
```

### 500 Internal Server Error

```json
{
  "message": "Internal server error"
}
```

---

## Status Codes

- **200**: OK - Request succeeded
- **201**: Created - Resource created successfully
- **400**: Bad Request - Invalid input
- **401**: Unauthorized - Authentication required or invalid
- **403**: Forbidden - Access denied
- **404**: Not Found - Resource not found
- **500**: Internal Server Error

---

## Rate Limiting

Currently not implemented. Consider adding rate limiting in production.

## Pagination

For endpoints that support pagination:

- Default page: 1
- Default limit: 10
- Maximum limit: 100

---

## CORS

The API allows requests from:

- `http://localhost:3000` (development)
- `https://your-frontend-url.com` (production)

---

## Health Check

**GET** `/api/health`

Simple endpoint to check if the server is running.

**Response (200):**

```json
{
  "message": "Server is running"
}
```
