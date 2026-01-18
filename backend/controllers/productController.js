import Product from "../models/Product.js";
import User from "../models/User.js";
import redisClient from "../config/redis.js";

/* ===================== GET ALL PRODUCTS ===================== */
export const getAllProducts = async (req, res) => {
  try {
    const { category, page = 1, limit = 100, search, gender } = req.query;
    const skip = (page - 1) * limit;

    const cacheKey = `products:all:${JSON.stringify(req.query)}`;

    // Redis READ (safe)
    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
    } catch (err) {
      console.error("Redis GET failed (getAllProducts)");
    }

    let query = {};
    if (category) {
      query.category = category;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { gender: { $regex: search, $options: "i" } },
        { productId: { $regex: search, $options: "i" } },
      ];
    }

    if (gender && gender !== "") {
      if (gender === "Men" || gender === "Women" || gender === "Kids") {
        query.$or = [{ gender }, { gender: { $regex: /^all$/i } }];
      } else if (gender.toLowerCase() === "all") {
        query.gender = { $in: ["Men", "Women", "Kids", "All", "all"] };
      }
    }

    const products = await Product.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    const responseData = {
      products,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    };

    // Redis WRITE (safe)
    try {
      await redisClient.setEx(cacheKey, 300, JSON.stringify(responseData));
    } catch (err) {
      console.error("Redis SET failed (getAllProducts)");
    }

    res.json(responseData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ===================== GET PRODUCT BY ID ===================== */
export const getProductById = async (req, res) => {
  const cacheKey = `product:${req.params.id}`;

  try {
    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
    } catch (err) {
      console.error("Redis GET failed (getProductById)");
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    try {
      await redisClient.setEx(cacheKey, 600, JSON.stringify(product));
    } catch (err) {
      console.error("Redis SET failed (getProductById)");
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ===================== CREATE PRODUCT ===================== */
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      images,
      stock,
      brand,
      productId,
      gender,
      availableSizes,
    } = req.body;

    if (!name || !description || !price || !category || stock === undefined) {
      return res.status(400).json({
        message: "Please provide all required fields",
      });
    }

    const categoryMap = {
      jerseys: "Jerseys",
      "jackets and sweatshirts": "Jackets and Sweatshirts",
      boots: "Footwear",
      shorts: "Shorts",
      tracksuits: "Tracksuits",
      "special collectibles": "Special Collectibles",
      accessories: "Accessories",
    };

    const normalizedCategory = categoryMap[category.toLowerCase()] || category;

    const product = new Product({
      name,
      description,
      price: parseFloat(price),
      category: normalizedCategory,
      images: images || [],
      stock: parseInt(stock),
      brand,
      productId,
      gender: gender || "Men",
      availableSizes: availableSizes || [],
    });

    await product.save();

    // Redis INVALIDATION (safe)
    try {
      await redisClient.flushAll();
    } catch (err) {
      console.error("Redis FLUSH failed (createProduct)");
    }

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ===================== UPDATE PRODUCT ===================== */
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    try {
      await redisClient.del(`product:${req.params.id}`);
      await redisClient.flushAll();
    } catch (err) {
      console.error("Redis invalidation failed (updateProduct)");
    }

    res.json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ===================== DELETE PRODUCT ===================== */
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    try {
      await redisClient.flushAll();
    } catch (err) {
      console.error("Redis flush failed (deleteProduct)");
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ===================== FEATURED PRODUCTS ===================== */
export const getFeaturedProducts = async (req, res) => {
  const cacheKey = "products:featured";

  try {
    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }
    } catch (err) {
      console.error("Redis GET failed (getFeaturedProducts)");
    }

    const featuredProducts = await Product.find({ isFeatured: true }).sort({
      createdAt: -1,
    });

    try {
      await redisClient.setEx(cacheKey, 300, JSON.stringify(featuredProducts));
    } catch (err) {
      console.error("Redis SET failed (getFeaturedProducts)");
    }

    res.status(200).json(featuredProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ===================== TOGGLE FEATURED ===================== */
export const toggleFeaturedProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.isFeatured = !product.isFeatured;
    await product.save();

    try {
      await redisClient.flushAll();
    } catch (err) {
      console.error("Redis flush failed (toggleFeaturedProduct)");
    }

    res.json({
      message: `Product ${product.isFeatured ? "added to" : "removed from"} featured products`,
      product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ===================== CATEGORIES ===================== */
export const getCategories = async (req, res) => {
  try {
    const categories = [
      "Jerseys",
      "Footwear",
      "Shirts",
      "Shorts",
      "Special Collectibles",
      "Accessories",
    ];
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ===================== REVIEWS ===================== */
const calculateAverageRating = (reviews) => {
  if (!reviews || reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return parseFloat((sum / reviews.length).toFixed(2));
};

export const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;

    if (!rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const existingReview = product.reviews.find(
      (review) => review.userId.toString() === user._id.toString(),
    );

    if (existingReview) {
      return res.status(400).json({
        message: "You have already reviewed this product.",
      });
    }

    product.reviews.push({
      userId: user._id,
      userName: user.name,
      rating: parseInt(rating),
      comment: comment || "",
      createdAt: new Date(),
    });

    product.rating = calculateAverageRating(product.reviews);
    await product.save();

    try {
      await redisClient.del(`product:${productId}`);
    } catch (err) {
      console.error("Redis invalidation failed (addReview)");
    }

    res.status(201).json({ message: "Review added successfully", product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductReviews = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({
      productId: product._id,
      productName: product.name,
      rating: product.rating,
      reviewCount: product.reviews.length,
      reviews: product.reviews,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { id: productId, reviewId } = req.params;

    if (!rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const review = product.reviews.id(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    review.rating = parseInt(rating, 10);
    review.comment = comment || "";
    product.rating = calculateAverageRating(product.reviews);
    await product.save();

    try {
      await redisClient.del(`product:${productId}`);
    } catch (err) {
      console.error("Redis invalidation failed (updateReview)");
    }

    res.json({ message: "Review updated", review, rating: product.rating });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { id: productId, reviewId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const review = product.reviews.id(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    await review.deleteOne();
    product.rating = calculateAverageRating(product.reviews);
    await product.save();

    try {
      await redisClient.del(`product:${productId}`);
    } catch (err) {
      console.error("Redis invalidation failed (deleteReview)");
    }

    res.json({ message: "Review deleted", rating: product.rating });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
