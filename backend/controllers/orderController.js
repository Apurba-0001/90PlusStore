import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

const maskUpiId = (upiId) => {
  if (typeof upiId !== "string" || !upiId.includes("@")) {
    return null;
  }

  const [username, provider] = upiId.split("@");
  const prefix = username.slice(0, 2);
  const suffix = username.length > 4 ? username.slice(-1) : "";
  const maskedMiddle = "*".repeat(
    Math.max(username.length - prefix.length - suffix.length, 0),
  );
  return `${prefix}${maskedMiddle}${suffix}@${provider}`;
};

const NAME_LIKE_REGEX = /^[a-zA-Z\s.'-]{2,60}$/;
const ZIP_CODE_REGEX = /^[a-zA-Z0-9\s-]{3,12}$/;
const UPI_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;

const isValidStreet = (value) =>
  typeof value === "string" && value.trim().length >= 3;

const validateAddress = (address, label) => {
  if (!isValidStreet(address?.street)) {
    return `${label} street is invalid`;
  }

  if (!NAME_LIKE_REGEX.test(String(address?.city || "").trim())) {
    return `${label} city is invalid`;
  }

  if (!NAME_LIKE_REGEX.test(String(address?.state || "").trim())) {
    return `${label} state is invalid`;
  }

  if (!NAME_LIKE_REGEX.test(String(address?.country || "").trim())) {
    return `${label} country is invalid`;
  }

  if (!ZIP_CODE_REGEX.test(String(address?.zipCode || "").trim())) {
    return `${label} zip code is invalid`;
  }

  return null;
};

export const createOrder = async (req, res) => {
  try {
    const {
      products,
      shippingAddress,
      billingAddress,
      paymentDetails,
      paymentMethodId,
      paymentMethod,
      clientTotalPrice, // From client (for validation only)
    } = req.body;

    const normalizedPaymentMethod =
      typeof paymentMethod === "string" ? paymentMethod.trim() : "";
    const providedPaymentMethodId =
      typeof paymentMethodId === "string" ? paymentMethodId.trim() : "";

    // Validate input
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "No products in order" });
    }

    if (!shippingAddress || typeof shippingAddress !== "object") {
      return res.status(400).json({ message: "Invalid shipping address" });
    }

    const shippingValidationError = validateAddress(
      shippingAddress,
      "Shipping address",
    );
    if (shippingValidationError) {
      return res.status(400).json({ message: shippingValidationError });
    }

    if (billingAddress && typeof billingAddress === "object") {
      const billingValidationError = validateAddress(
        billingAddress,
        "Billing address",
      );
      if (billingValidationError) {
        return res.status(400).json({ message: billingValidationError });
      }
    }

    const normalizedCountryCode =
      typeof shippingAddress.countryCode === "string"
        ? shippingAddress.countryCode.trim()
        : "";
    const normalizedMobile =
      typeof shippingAddress.mobile === "string"
        ? shippingAddress.mobile.replace(/\D/g, "")
        : "";

    if (!/^\+[0-9]{1,4}$/.test(normalizedCountryCode)) {
      return res.status(400).json({ message: "Invalid country code" });
    }

    if (!/^[0-9]{6,15}$/.test(normalizedMobile)) {
      return res.status(400).json({ message: "Invalid mobile number" });
    }

    const normalizedShippingAddress = {
      ...shippingAddress,
      countryCode: normalizedCountryCode,
      mobile: normalizedMobile,
    };

    if (!normalizedPaymentMethod) {
      return res.status(400).json({ message: "Payment method required" });
    }

    // Allow clients that do not use a payment gateway yet.
    const resolvedPaymentMethodId =
      providedPaymentMethodId ||
      `manual_${normalizedPaymentMethod}_${Date.now()}`;

    const safePaymentDetails = {
      paymentMethodId: resolvedPaymentMethodId,
    };

    if (normalizedPaymentMethod === "upi") {
      if (!UPI_REGEX.test(String(paymentDetails?.upiId || "").trim())) {
        return res.status(400).json({ message: "Invalid UPI ID" });
      }
    }

    if (
      normalizedPaymentMethod === "credit-card" ||
      normalizedPaymentMethod === "debit-card"
    ) {
      const cardDigits = String(paymentDetails?.cardNumber || "").replace(
        /\D/g,
        "",
      );
      const cvv = String(paymentDetails?.cvv || "").trim();
      const expiry = String(paymentDetails?.expiryDate || "").trim();

      if (!/^\d{13,19}$/.test(cardDigits)) {
        return res.status(400).json({ message: "Invalid card number" });
      }

      if (!/^\d{3,4}$/.test(cvv)) {
        return res.status(400).json({ message: "Invalid CVV" });
      }

      if (!/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(expiry)) {
        return res.status(400).json({ message: "Invalid card expiry date" });
      }
    }

    if (
      (normalizedPaymentMethod === "credit-card" ||
        normalizedPaymentMethod === "debit-card") &&
      typeof paymentDetails?.cardNumber === "string"
    ) {
      const cardDigits = paymentDetails.cardNumber.replace(/\D/g, "");
      if (cardDigits.length >= 4) {
        safePaymentDetails.last4Digits = cardDigits.slice(-4);
      }
      if (cardDigits.startsWith("4")) {
        safePaymentDetails.cardBrand = "Visa";
      } else if (/^5[1-5]/.test(cardDigits)) {
        safePaymentDetails.cardBrand = "MasterCard";
      } else if (/^3[47]/.test(cardDigits)) {
        safePaymentDetails.cardBrand = "American Express";
      } else if (/^6(?:011|5)/.test(cardDigits)) {
        safePaymentDetails.cardBrand = "Discover";
      }
    }

    if (normalizedPaymentMethod === "upi") {
      const maskedUpiId = maskUpiId(paymentDetails?.upiId);
      if (maskedUpiId) {
        safePaymentDetails.upiIdMasked = maskedUpiId;
      }
    }

    // SECURITY: Calculate total on backend, don't trust client value
    let calculatedTotal = 0;
    const orderProducts = [];

    for (const item of products) {
      // Validate item structure
      if (
        !item.productId ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1
      ) {
        return res.status(400).json({ message: "Invalid product in order" });
      }

      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product not found` });
      }

      // Validate quantity
      if (item.quantity > 10000 || item.quantity < 1) {
        return res.status(400).json({ message: "Invalid quantity" });
      }

      if (product.stock < item.quantity) {
        return res
          .status(400)
          .json({ message: `Insufficient stock for ${product.name}` });
      }

      // Use database price, not client-provided price
      const itemTotal = product.price * item.quantity;
      calculatedTotal += itemTotal;

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

    // SECURITY: Validate calculated total against client value
    // Allow small float precision errors (0.01)
    if (
      clientTotalPrice &&
      Math.abs(calculatedTotal - parseFloat(clientTotalPrice)) > 0.01
    ) {
      // Restore stock before rejecting
      for (const item of products) {
        const product = await Product.findById(item.productId);
        product.stock += item.quantity;
        await product.save();
      }

      return res.status(400).json({
        success: false,
        message: "Order total mismatch. Please refresh cart and try again.",
      });
    }

    const order = new Order({
      userId: req.userId,
      products: orderProducts,
      totalPrice: calculatedTotal,
      shippingAddress: normalizedShippingAddress,
      billingAddress,
      paymentDetails: safePaymentDetails,
      paymentMethod: normalizedPaymentMethod,
      paymentStatus: "pending", // Will be updated after payment gateway verification
    });

    await order.save();

    // Ensure the user's cart is emptied once checkout succeeds.
    await User.findByIdAndUpdate(req.userId, { $set: { cart: [] } });

    // TODO: In production, initialize payment gateway transaction here
    // Example: const paymentIntent = await processPayment({ orderId, amount, paymentMethodId });

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: {
        id: order._id,
        totalPrice: order.totalPrice,
        status: order.status,
        paymentStatus: order.paymentStatus,
      },
      // TODO: Return payment client secret/URL for frontend to handle payment
      // paymentClientSecret: paymentIntent.clientSecret
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create order",
      // Don't expose detailed error in production
      ...(process.env.NODE_ENV === "development" && { error: error.message }),
    });
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
      "products.productObjectId",
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
