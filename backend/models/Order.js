import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        productObjectId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: String,
        price: Number,
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        image: String,
        size: String,
        productId: String,
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingAddress: {
      houseNo: String,
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
      countryCode: String,
      mobile: String,
      shippingType: String,
    },
    billingAddress: {
      houseNo: String,
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
    },
    paymentDetails: {
      // SECURITY: DO NOT store complete card details
      // Only store payment method reference and last 4 digits
      paymentMethodId: String, // Reference from payment gateway
      last4Digits: String, // Last 4 digits of card (if applicable)
      cardBrand: String, // Visa, MasterCard, etc.
      upiIdMasked: String, // Masked UPI ID for admin visibility
      // Never store: cardNumber, expiryDate, cvv, ibanDetails
    },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    paymentMethod: String,
    trackingNumber: String,
    notes: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Order", orderSchema);
