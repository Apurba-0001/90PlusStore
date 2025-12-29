import apiClient from "./api";

export const authService = {
  register: (name, email, password) =>
    apiClient.post("/auth/register", { name, email, password }),

  login: (email, password) =>
    apiClient.post("/auth/login", { email, password }),

  getProfile: () => apiClient.get("/auth/profile"),

  updateProfile: (data) => apiClient.put("/auth/profile", data),

  // Cart endpoints
  getCart: () => apiClient.get("/auth/cart"),
  addToCart: (productId, quantity, size) =>
    apiClient.post("/auth/cart", { productId, quantity, size }),
  removeFromCart: (productId) => apiClient.delete(`/auth/cart/${productId}`),
  updateCartQuantity: (productId, quantity) =>
    apiClient.patch(`/auth/cart/${productId}`, { quantity }),
  clearCart: () => apiClient.delete("/auth/cart"),

  // Wishlist endpoints
  getWishlist: () => apiClient.get("/auth/wishlist"),
  toggleWishlist: (productId) => apiClient.patch(`/auth/wishlist/${productId}`),

  logout: () => {
    // Clear all localStorage data
    localStorage.clear();
  },
};

export const productService = {
  getProducts: (category, page, search) =>
    apiClient.get("/products", {
      params: { category, page, search, limit: 10 },
    }),

  getProductById: (id) => apiClient.get(`/products/${id}`),

  getCategories: () => apiClient.get("/products/categories"),

  createProduct: (data) => apiClient.post("/products", data),

  updateProduct: (id, data) => apiClient.put(`/products/${id}`, data),

  deleteProduct: (id) => apiClient.delete(`/products/${id}`),

  toggleFeatured: (id) => apiClient.patch(`/products/${id}/featured`),

  // Review endpoints
  getProductReviews: (id) => apiClient.get(`/products/${id}/reviews`),
  addReview: (id, rating, comment) =>
    apiClient.post(`/products/${id}/reviews`, { rating, comment }),
};

export const orderService = {
  createOrder: (data) => apiClient.post("/orders", data),

  getMyOrders: () => apiClient.get("/orders/my-orders"),

  getOrderById: (id) => apiClient.get(`/orders/${id}`),

  updateOrderStatus: (id, status) =>
    apiClient.put(`/orders/${id}/status`, { status }),

  getAllOrders: (status, page) =>
    apiClient.get("/orders/admin/all-orders", {
      params: { status, page, limit: 10 },
    }),
};
