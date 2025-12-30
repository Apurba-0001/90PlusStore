import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

export const createOrder = async (req, res) => {
  try {
    const {
      products,
      shippingAddress,
      billingAddress,
      paymentDetails,
      paymentMethod,
    } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ message: "No products in order" });
    }

    let totalPrice = 0;
    const orderProducts = [];

    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res
          .status(404)
          .json({ message: `Product ${item.productId} not found` });
      }

      if (product.stock < item.quantity) {
        return res
          .status(400)
          .json({ message: `Insufficient stock for ${product.name}` });
      }

      totalPrice += product.price * item.quantity;
      orderProducts.push({
        productObjectId: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.images?.[0]?.url || null,
        size: item.size || null,
        productId: product.productId || null,
      });

      // Update stock
      product.stock -= item.quantity;
      await product.save();
    }

    const order = new Order({
      userId: req.userId,
      products: orderProducts,
      totalPrice,
      shippingAddress,
      billingAddress,
      paymentDetails,
      paymentMethod,
    });

    await order.save();

    // Save shipping address to user profile for persistence
    await User.findByIdAndUpdate(
      req.userId,
      {
        address: shippingAddress,
      },
      { new: true, runValidators: false }
    );

    res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId })
      .populate("products.productObjectId")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "products.productObjectId"
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user owns the order or is admin
    if (order.userId.toString() !== req.userId && req.userRole !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check authorization - non-admin users can only cancel their own orders
    if (req.userRole !== "admin") {
      if (order.userId.toString() !== req.userId) {
        return res
          .status(403)
          .json({ message: "Not authorized to update this order" });
      }

      // Users can only cancel pending or processing orders
      if (status === "cancelled") {
        if (
          order.status === "delivered" ||
          order.status === "shipped" ||
          order.status === "cancelled"
        ) {
          return res.status(400).json({
            message: `Cannot cancel a ${order.status} order`,
          });
        }
      } else {
        // Users cannot change status to anything other than cancelled
        return res.status(403).json({
          message: "Users can only cancel orders",
        });
      }
    }

    order.status = status;
    await order.save();

    res.json({
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate("userId", "name email")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
