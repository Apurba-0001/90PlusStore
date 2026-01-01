import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const fixSkuIndex = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const db = mongoose.connection.db;
    const collection = db.collection("products");

    // Get existing indexes
    const indexes = await collection.indexes();
    console.log(
      "Current indexes:",
      indexes.map((idx) => idx.name)
    );

    // Drop the existing sku_1 index if it exists
    try {
      await collection.dropIndex("sku_1");
      console.log("✓ Dropped existing sku_1 index");
    } catch (error) {
      if (error.code === 27 || error.codeName === "IndexNotFound") {
        console.log("ℹ No existing sku_1 index to drop");
      } else {
        throw error;
      }
    }

    // Create a new sparse unique index on sku
    await collection.createIndex({ sku: 1 }, { unique: true, sparse: true });
    console.log("✓ Created new sparse unique index on sku");

    console.log("\nSKU index fix complete!");
  } catch (error) {
    console.error("Migration error:", error);
  } finally {
    await mongoose.connection.close();
  }
};

fixSkuIndex();
