import mongoose from "mongoose";
import Product from "../models/Product.js";
import dotenv from "dotenv";

dotenv.config();

const generateSku = (productName, index) => {
  // Create Product Id: First 2 letters of name + timestamp + index
  const namePrefix = productName.substring(0, 2).toUpperCase();
  const timestamp = Date.now().toString().slice(-4);
  return `${namePrefix}-${timestamp}-${String(index).padStart(3, "0")}`;
};

const addSkuToProducts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Get all products without Product Id or with empty Product Id
    const products = await Product.find({
      $or: [{ sku: { $exists: false } }, { sku: null }, { sku: "" }],
    });
    console.log(`Found ${products.length} products without Product Id`);

    let updatedCount = 0;

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const sku = generateSku(product.name, i + 1);

      await Product.findByIdAndUpdate(product._id, { sku });
      updatedCount++;
      console.log(`✓ Added Product Id: ${sku} for ${product.name}`);
    }

    console.log(
      `\nProduct Id migration complete! Updated ${updatedCount} products.`
    );
  } catch (error) {
    console.error("Migration error:", error);
  } finally {
    await mongoose.connection.close();
  }
};

addSkuToProducts();
