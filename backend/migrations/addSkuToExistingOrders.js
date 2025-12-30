import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import dotenv from "dotenv";

dotenv.config();

const addSkuToExistingOrders = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Get all orders
    const orders = await Order.find({});
    console.log(`Found ${orders.length} orders`);

    let updatedCount = 0;

    for (const order of orders) {
      let needsUpdate = false;

      // Check each product in the order
      for (let i = 0; i < order.products.length; i++) {
        const product = order.products[i];

        // If Product Id is missing, fetch from product
        if (!product.productId && product.productObjectId) {
          const productData = await Product.findById(product.productObjectId);
          if (productData && productData.productId) {
            order.products[i].productId = productData.productId;
            needsUpdate = true;
            console.log(
              `✓ Added Product Id: ${productData.productId} to product: ${product.name}`
            );
          }
        }
      }

      if (needsUpdate) {
        await order.save();
        updatedCount++;
      }
    }

    console.log(
      `\nOrder Product Id migration complete! Updated ${updatedCount} orders.`
    );
  } catch (error) {
    console.error("Migration error:", error);
  } finally {
    await mongoose.connection.close();
  }
};

addSkuToExistingOrders();
