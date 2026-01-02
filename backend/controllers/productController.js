import Product from "../models/Product.js";
import User from "../models/User.js";

export const getAllProducts = async (req, res) => {
  try {
    const { category, page = 1, limit = 100, search } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (category) {
      query.category = category;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { gender: { $regex: search, $options: "i" } },
        { productId: { $regex: search, $options: "i" } },
      ];
    }

    const products = await Product.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    res.json({
      products,
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

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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

    // Validate required fields
    if (!name || !description || !price || !category || stock === undefined) {
      return res.status(400).json({
        message: "Please provide all required fields",
        required: ["name", "description", "price", "category", "stock"],
      });
    }

    // Normalize category to correct case
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
    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({
      message: error.message,
      error: error.errors || {},
    });
  }
};

export const updateProduct = async (req, res) => {
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

    // Normalize category to correct case
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

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        price: parseFloat(price),
        category: normalizedCategory,
        images,
        stock: parseInt(stock),
        brand,
        productId,
        gender: gender || "Men",
        availableSizes: availableSizes || [],
      },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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

// Helper function to calculate average rating
const calculateAverageRating = (reviews) => {
  if (!reviews || reviews.length === 0) {
    return 0;
  }
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return parseFloat((sum / reviews.length).toFixed(2));
};

export const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;

    // Validate review data
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
      });
    }

    // Get user from auth middleware
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if user has already reviewed this product
    const existingReview = product.reviews.find(
      (review) => review.userId.toString() === user._id.toString()
    );

    if (existingReview) {
      return res.status(400).json({
        message:
          "You have already reviewed this product. You can only submit one review per product.",
      });
    }

    // Add new review
    const newReview = {
      userId: user._id,
      userName: user.name,
      rating: parseInt(rating),
      comment: comment || "",
      createdAt: new Date(),
    };

    product.reviews.push(newReview);

    // Calculate and update average rating
    product.rating = calculateAverageRating(product.reviews);

    await product.save();

    res.status(201).json({
      message: "Review added successfully",
      product,
    });
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

    return res.json({
      message: "Review updated",
      review,
      rating: product.rating,
    });
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

    // deleteOne works on subdocuments in modern mongoose
    await review.deleteOne();

    product.rating = calculateAverageRating(product.reviews);
    await product.save();

    return res.json({
      message: "Review deleted",
      rating: product.rating,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    const featuredProducts = await Product.find({ isFeatured: true }).sort({
      createdAt: -1,
    });

    res.status(200).json(featuredProducts);
  } catch (error) {
    console.error("getFeaturedProducts error:", error);
    res.status(500).json({ message: error.message });
  }
};


export const toggleFeaturedProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.isFeatured = !product.isFeatured;
    await product.save();

    res.json({
      message: `Product ${
        product.isFeatured ? "added to" : "removed from"
      } featured products`,
      product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
