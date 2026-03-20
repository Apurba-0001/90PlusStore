// Remove a user (admin only, cannot remove admin users)
export const removeUser = async (req, res) => {
  try {
    // Only admin can remove users
    const requestingUser = await User.findById(req.userId);
    if (!requestingUser || !requestingUser.isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }
    const userToRemove = await User.findById(req.params.id);
    if (!userToRemove) {
      return res.status(404).json({ message: "User not found" });
    }
    if (userToRemove.isAdmin) {
      return res.status(400).json({ message: "Cannot remove admin users" });
    }
    await userToRemove.deleteOne();
    res.json({ message: "User removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find(
      {},
      { name: 1, email: 1, createdAt: 1, isAdmin: 1 },
    );
    res.json({
      success: true,
      total: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import {
  logAuthAttempt,
  logFailedLogin,
  logPasswordChange,
} from "../middleware/securityLogging.js";
import { generateCsrfToken } from "../middleware/csrfProtection.js";

/**
 * Validate password strength
 * Requirements: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
 */
const validatePasswordStrength = (password) => {
  if (password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters" };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "Password must contain uppercase letter" };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "Password must contain lowercase letter" };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "Password must contain number" };
  }
  if (!/[@$!%*?&-_]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain special character (@$!%*?&-_)",
    };
  }
  return { valid: true };
};

const NAME_LIKE_REGEX = /^[a-zA-Z\s.'-]{2,60}$/;
const ZIP_CODE_REGEX = /^[a-zA-Z0-9\s-]{3,12}$/;
const COUNTRY_CODE_REGEX = /^\+[0-9]{1,4}$/;

const isValidStreet = (value) =>
  typeof value === "string" && value.trim().length >= 3;

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Input validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Validate name format
    if (!/^[a-zA-Z\s'-]+$/.test(name) || name.length < 2 || name.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Invalid name format",
      });
    }

    // Validate email format
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.message,
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if email already exists
    let user = await User.findOne({ email: normalizedEmail });
    if (user) {
      // Log attempt
      logAuthAttempt(normalizedEmail, false, req.ip, req.get("user-agent"));
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Hash password with strong salt rounds
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    await user.save();

    // Log successful registration
    logAuthAttempt(normalizedEmail, true, req.ip, req.get("user-agent"));

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" },
    );

    // Generate CSRF token for the authenticated user
    const csrfToken = generateCsrfToken(user._id);

    // Set CSRF token in response header
    res.setHeader("X-CSRF-Token", csrfToken);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      csrfToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Registration failed",
      ...(process.env.NODE_ENV === "development" && { error: error.message }),
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user (include password field)
    const user = await User.findOne({ email: normalizedEmail }).select(
      "+password",
    );

    if (!user) {
      // Log failed login attempt with account enumeration protection
      logFailedLogin(normalizedEmail, req.ip, "user_not_found");
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Log failed login attempt
      logFailedLogin(normalizedEmail, req.ip, "invalid_password");
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Log successful login
    logAuthAttempt(normalizedEmail, true, req.ip, req.get("user-agent"));

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" },
    );

    // Generate CSRF token for the authenticated user
    const csrfToken = generateCsrfToken(user._id);

    // Set CSRF token in response header
    res.setHeader("X-CSRF-Token", csrfToken);

    res.json({
      success: true,
      message: "Logged in successfully",
      token,
      csrfToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Login failed",
      ...(process.env.NODE_ENV === "development" && { error: error.message }),
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, email } = req.body;

    // Preserve existing address fields and only update provided ones
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Normalize and update email if changed, ensuring uniqueness
    if (email && email.trim().toLowerCase() !== user.email) {
      const normalizedEmail = email.trim().toLowerCase();
      const existing = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: req.userId },
      });
      if (existing) {
        return res.status(400).json({ message: "Email already in use" });
      }
      user.email = normalizedEmail;
    }

    if (
      name !== undefined &&
      (!/^[a-zA-Z\s'-]{2,100}$/.test(name.trim()) || name.trim().length > 100)
    ) {
      return res.status(400).json({ message: "Invalid name format" });
    }

    const normalizedPhone =
      phone !== undefined && phone !== null
        ? String(phone).replace(/\D/g, "")
        : undefined;

    if (
      normalizedPhone !== undefined &&
      normalizedPhone !== "" &&
      !/^[0-9]{6,15}$/.test(normalizedPhone)
    ) {
      return res.status(400).json({ message: "Invalid phone number" });
    }

    if (address && typeof address === "object") {
      const countryCode =
        address.countryCode !== undefined && address.countryCode !== null
          ? String(address.countryCode).trim()
          : user.address?.countryCode;

      if (countryCode && !COUNTRY_CODE_REGEX.test(countryCode)) {
        return res.status(400).json({ message: "Invalid country code" });
      }

      if (address.street !== undefined && !isValidStreet(address.street)) {
        return res.status(400).json({ message: "Invalid street address" });
      }

      if (
        address.city !== undefined &&
        !NAME_LIKE_REGEX.test(String(address.city).trim())
      ) {
        return res.status(400).json({ message: "Invalid city" });
      }

      if (
        address.state !== undefined &&
        !NAME_LIKE_REGEX.test(String(address.state).trim())
      ) {
        return res.status(400).json({ message: "Invalid state" });
      }

      if (
        address.country !== undefined &&
        !NAME_LIKE_REGEX.test(String(address.country).trim())
      ) {
        return res.status(400).json({ message: "Invalid country" });
      }

      if (
        address.zipCode !== undefined &&
        !ZIP_CODE_REGEX.test(String(address.zipCode).trim())
      ) {
        return res.status(400).json({ message: "Invalid zip code" });
      }

      const addressPhone =
        address.phone !== undefined && address.phone !== null
          ? String(address.phone).replace(/\D/g, "")
          : address.mobile !== undefined && address.mobile !== null
            ? String(address.mobile).replace(/\D/g, "")
            : normalizedPhone;

      if (addressPhone && !/^[0-9]{6,15}$/.test(addressPhone)) {
        return res.status(400).json({ message: "Invalid phone number" });
      }
    }

    user.name = name !== undefined ? name.trim() : user.name;
    user.phone =
      normalizedPhone !== undefined
        ? normalizedPhone || user.phone
        : user.phone;

    // Merge nested address, keeping previous values when not supplied
    if (address && typeof address === "object") {
      user.address = {
        ...user.address,
        ...address,
        countryCode: address.countryCode ?? user.address?.countryCode ?? "+91",
        // Also mirror phone into address.phone if provided for compatibility
        phone:
          (address.phone !== undefined && address.phone !== null
            ? String(address.phone).replace(/\D/g, "")
            : address.mobile !== undefined && address.mobile !== null
              ? String(address.mobile).replace(/\D/g, "")
              : normalizedPhone) ?? user.address?.phone,
      };
    }

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate("cart.productId");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ cart: user.cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, size = null } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingItem = user.cart.find(
      (item) => item.productId.toString() === productId && item.size === size,
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      user.cart.push({ productId, quantity, size });
    }

    await user.save();
    // Refresh user from database with populated cart
    const updatedUser = await User.findById(req.userId).populate(
      "cart.productId",
    );
    res.json({ message: "Added to cart", cart: updatedUser.cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.cart = user.cart.filter(
      (item) => item.productId.toString() !== productId,
    );
    await user.save();
    // Refresh user from database with populated cart
    const updatedUser = await User.findById(req.userId).populate(
      "cart.productId",
    );
    res.json({ message: "Removed from cart", cart: updatedUser.cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const cartItem = user.cart.find(
      (item) => item.productId.toString() === productId,
    );

    if (!cartItem) {
      return res.status(404).json({ message: "Item not in cart" });
    }

    if (quantity <= 0) {
      user.cart = user.cart.filter(
        (item) => item.productId.toString() !== productId,
      );
    } else {
      cartItem.quantity = quantity;
    }

    await user.save();
    // Refresh user from database with populated cart
    const updatedUser = await User.findById(req.userId).populate(
      "cart.productId",
    );
    res.json({ message: "Cart updated", cart: updatedUser.cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const clearCart = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.cart = [];
    await user.save();
    res.json({ message: "Cart cleared" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const index = user.wishlist.indexOf(productId);
    if (index > -1) {
      user.wishlist.splice(index, 1);
    } else {
      user.wishlist.push(productId);
    }

    await user.save();

    res.json({
      message: index > -1 ? "Removed from wishlist" : "Added to wishlist",
      wishlist: user.wishlist,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// SECURITY: makeAdmin endpoint removed
// This was a critical security vulnerability allowing privilege escalation
// Admin users should only be created through secure backend processes or database patches
