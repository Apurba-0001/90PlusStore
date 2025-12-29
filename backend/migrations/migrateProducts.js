import mongoose from "mongoose";
import Product from "../models/Product.js";
import dotenv from "dotenv";

dotenv.config();

const migrateProducts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Get all products
    const products = await Product.find({});
    console.log(`Found ${products.length} products to migrate`);

    let updatedCount = 0;

    for (const product of products) {
      let needsUpdate = false;
      const updateData = {};

      // Add gender if missing
      if (!product.gender) {
        updateData.gender = "Men";
        needsUpdate = true;
      }

      // Convert sizes array to availableSizes if needed
      if (
        product.sizes &&
        product.sizes.length > 0 &&
        !product.availableSizes
      ) {
        // Extract sizes from the old sizes structure
        const sizeList = product.sizes.map((s) => s.size);
        updateData.availableSizes = sizeList;
        needsUpdate = true;
      } else if (!product.availableSizes) {
        // If no sizes info, set default sizes
        updateData.availableSizes = ["M", "L", "XL"];
        needsUpdate = true;
      }

      // Ensure images array is properly structured
      if (!product.images || product.images.length === 0) {
        if (product.image) {
          updateData.images = [
            {
              url: product.image,
              alt: product.name || "Product Image",
            },
          ];
          needsUpdate = true;
        } else {
          updateData.images = [];
          needsUpdate = true;
        }
      }

      // Ensure category matches new enum values
      const validCategories = [
        "Jerseys",
        "Jackets and Sweatshirts",
        "Footwear",
        "Shorts",
        "Tracksuits",
        "Special Collectibles",
      ];

      // Update Boots to Footwear
      if (product.category === "Boots") {
        updateData.category = "Footwear";
        needsUpdate = true;
      }

      if (!validCategories.includes(product.category)) {
        // Map old categories to new ones
        const categoryMap = {
          Shirts: "Jackets and Sweatshirts",
          Jersey: "Jerseys",
          Boots: "Footwear",
          // Add more mappings as needed
        };
        updateData.category = categoryMap[product.category] || product.category;
        needsUpdate = true;
      }

      if (needsUpdate) {
        await Product.findByIdAndUpdate(product._id, updateData);
        updatedCount++;
        console.log(`✓ Updated: ${product.name}`);
      }
    }

    console.log(`\nMigration complete! Updated ${updatedCount} products.`);
  } catch (error) {
    console.error("Migration error:", error);
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  }
};

// Run migration
migrateProducts();
