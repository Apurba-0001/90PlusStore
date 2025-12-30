import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/Product.js";

dotenv.config();

const updateProductIds = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Find all products without productId
    const productsWithoutId = await Product.find({
      productId: { $exists: false },
    });
    console.log(`Found ${productsWithoutId.length} products without productId`);

    // Also check for products with empty productId
    const productsWithEmptyId = await Product.find({ productId: "" });
    console.log(
      `Found ${productsWithEmptyId.length} products with empty productId`
    );

    // Update all products without productId - generate one based on name and _id
    const updateResult = await Product.updateMany(
      { $or: [{ productId: { $exists: false } }, { productId: "" }] },
      [
        {
          $set: {
            productId: {
              $substr: [
                {
                  $concat: [
                    { $substr: ["$name", 0, 3] },
                    "-",
                    { $substr: ["$_id", 18, 4] },
                  ],
                },
                0,
                10,
              ],
            },
          },
        },
      ]
    );

    console.log(
      `Updated ${updateResult.modifiedCount} products with new productIds`
    );

    // Verify the update
    const allProducts = await Product.find({}).select("_id name productId");
    console.log("\nProducts with IDs:");
    allProducts.slice(0, 5).forEach((p) => {
      console.log(`${p.name}: ${p.productId}`);
    });

    await mongoose.connection.close();
    console.log("\nMigration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  }
};

updateProductIds();
