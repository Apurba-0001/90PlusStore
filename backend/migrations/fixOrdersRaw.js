import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const fixOrderProductFields = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const db = mongoose.connection.db;
    const ordersCollection = db.collection("orders");

    // Find all orders with products
    const orders = await ordersCollection.find({}).toArray();
    console.log(`Found ${orders.length} orders`);

    let updatedCount = 0;

    for (const order of orders) {
      let needsUpdate = false;
      const updatedProducts = [];

      for (const product of order.products) {
        // If productId is an ObjectId and we have sku
        if (
          (typeof product.productId === "object" ||
            (typeof product.productId === "string" &&
              product.productId.length === 24 &&
              /^[0-9a-f]{24}$/.test(product.productId))) &&
          product.sku
        ) {
          // Get the ObjectId as string
          const mongoObjectId =
            typeof product.productId === "object"
              ? product.productId.toString()
              : product.productId;

          // Swap the values
          updatedProducts.push({
            productObjectId: mongoObjectId,
            productId: product.sku,
            name: product.name,
            price: product.price,
            quantity: product.quantity,
            image: product.image,
            size: product.size,
            _id: product._id,
          });

          console.log(
            `✓ Fixed: ${product.name} - New Product Id: ${product.sku}`
          );
          needsUpdate = true;
        } else {
          updatedProducts.push(product);
        }
      }

      if (needsUpdate) {
        await ordersCollection.updateOne(
          { _id: order._id },
          { $set: { products: updatedProducts } }
        );
        updatedCount++;
      }
    }

    console.log(`\nUpdate complete! Fixed ${updatedCount} orders.`);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.connection.close();
  }
};

fixOrderProductFields();
