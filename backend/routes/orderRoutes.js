const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const { verifyToken, isAdmin } = require("../middleware/auth");

/**
 * POST /api/orders
 * Create new order
 */
router.post("/", verifyToken, async (req, res) => {
  try {
    const { products, shippingAddress, paymentMethod } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide products",
      });
    }

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: "Please provide shipping address",
      });
    }

    // Validate products and calculate total
    let totalPrice = 0;
    const orderProducts = [];

    for (const item of products) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.product} not found`,
        });
      }

      // Check stock
      const sizeData = product.sizes.find((s) => s.size === item.size);
      if (!sizeData || sizeData.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Product ${product.name} size ${item.size} is out of stock`,
        });
      }

      totalPrice += product.price * item.quantity;
      orderProducts.push({
        product: product._id,
        quantity: item.quantity,
        size: item.size,
        price: product.price,
      });

      // Reduce stock
      sizeData.stock -= item.quantity;
      await product.save();
    }

    const order = new Order({
      user: req.user.userId,
      products: orderProducts,
      totalPrice,
      shippingAddress,
      paymentMethod,
    });

    await order.save();

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /api/orders/my-orders
 * Get current user's orders
 */
router.get("/my-orders", verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.userId }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /api/orders/:id
 * Get order by ID
 */
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if user is owner or admin
    if (order.user.toString() !== req.user.userId && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this order",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * PUT /api/orders/:id
 * Update order status (Admin only)
 */
router.put("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = [
      "pending",
      "confirmed",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /api/orders
 * Get all orders (Admin only)
 */
router.get("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    let filter = {};
    if (status) {
      filter.status = status;
    }

    const skip = (page - 1) * limit;

    const orders = await Order.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
