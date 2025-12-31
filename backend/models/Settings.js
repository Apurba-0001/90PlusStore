import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      enum: ["store_settings"], // Only one settings document
    },
    taxRateIndia: {
      type: Number,
      default: 10,
      min: 0,
      max: 100,
    },
    taxRateInternational: {
      type: Number,
      default: 10,
      min: 0,
      max: 100,
    },
    shippingRates: {
      indiaStandard: {
        type: Number,
        default: 10,
        min: 0,
      },
      indiaExpress: {
        type: Number,
        default: 50,
        min: 0,
      },
      internationalStandard: {
        type: Number,
        default: 200,
        min: 0,
      },
      internationalExpress: {
        type: Number,
        default: 500,
        min: 0,
      },
    },
    indiaFreeShippingThreshold: {
      type: Number,
      default: 2000,
      min: 0,
    },
    internationalFreeShippingThreshold: {
      type: Number,
      default: 5000,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Settings = mongoose.model("Settings", settingsSchema);

export default Settings;
