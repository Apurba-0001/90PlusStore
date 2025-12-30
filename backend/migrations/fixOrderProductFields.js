import mongoose from "mongoose";
import Order from "../models/Order.js";
import dotenv from "dotenv";

dotenv.config();

const updateOrdersToNewStructure = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Get all orders
    const orders = await Order.find({});
    console.log(`Found ${orders.length} orders to update`);

    let updatedCount = 0;

    for (const order of orders) {
      let needsUpdate = false;

      for (const order of orders) {
        let needsUpdate = false;

        // Check each product in the order
        for (let i = 0; i < order.products.length; i++) {
          const product = order.products[i];

          // Check if productId is a MongoDB ObjectId string
          if (
            typeof product.productId === "string" &&
            product.productId.length === 24 &&
            /^[0-9a-f]{24}$/.test(product.productId)
          ) {
            const mongoObjectId = product.productId;

            // Get the product identifier from sku or productIdCode
            let productIdentifier = product.sku || product.productIdCode;

            if (productIdentifier) {
              // Rebuild product with correct structure
              order.products[i] = {
                productObjectId: mongoObjectId,
                productId: productIdentifier,
                name: product.name,
                price: product.price,
                quantity: product.quantity,
                image: product.image || undefined,
                size: product.size || undefined,
              };

              // Remove undefined values
              if (!order.products[i].image) delete order.products[i].image;
              if (!order.products[i].size) delete order.products[i].size;

              needsUpdate = true;
              console.log(
                `✓ Fixed product: ${product.name} - ProductId: ${productIdentifier}`
              );
            }
          }
        }

        if (needsUpdate) {
          await order.save();
          updatedCount++;
        }
      }

      if (needsUpdate) {
        await order.save();
        updatedCount++;
      }
    }

    console.log(
      `\nOrder structure update complete! Updated ${updatedCount} orders.`
    );
  } catch (error) {
    console.error("Migration error:", error);
  } finally {
    await mongoose.connection.close();
  }
};

updateOrdersToNewStructure();
