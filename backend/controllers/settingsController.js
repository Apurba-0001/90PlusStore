import Settings from "../models/Settings.js";

// Get store settings
export const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({ key: "store_settings" });

    // Create default settings if they don't exist
    if (!settings) {
      settings = await Settings.create({
        key: "store_settings",
        taxRateIndia: 10,
        taxRateInternational: 10,
        shippingRates: {
          indiaStandard: 10,
          indiaExpress: 50,
          internationalStandard: 200,
          internationalExpress: 500,
        },
        indiaFreeShippingThreshold: 2000,
        internationalFreeShippingThreshold: 5000,
      });
    }

    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching settings",
      error: error.message,
    });
  }
};

// Update store settings (Admin only)
export const updateSettings = async (req, res) => {
  try {
    const {
      taxRate,
      shippingRates,
      indiaFreeShippingThreshold,
      internationalFreeShippingThreshold,
      taxRateIndia,
      taxRateInternational,
    } = req.body;

    // Validate input
    if (taxRate !== undefined && (taxRate < 0 || taxRate > 100)) {
      return res.status(400).json({
        success: false,
        message: "Tax rate must be between 0 and 100",
      });
    }
    if (
      (taxRateIndia !== undefined &&
        (taxRateIndia < 0 || taxRateIndia > 100)) ||
      (taxRateInternational !== undefined &&
        (taxRateInternational < 0 || taxRateInternational > 100))
    ) {
      return res.status(400).json({
        success: false,
        message: "Tax rates must be between 0 and 100",
      });
    }
    if (
      indiaFreeShippingThreshold !== undefined &&
      indiaFreeShippingThreshold < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "India free shipping threshold must be non-negative",
      });
    }
    if (
      internationalFreeShippingThreshold !== undefined &&
      internationalFreeShippingThreshold < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "International free shipping threshold must be non-negative",
      });
    }

    let settings = await Settings.findOne({ key: "store_settings" });

    if (!settings) {
      // Create new settings if they don't exist
      settings = await Settings.create({
        taxRateIndia: taxRateIndia ?? 10,
        taxRateInternational: taxRateInternational ?? 10,
        shippingRates: shippingRates || {
          indiaStandard: 10,
          indiaExpress: 50,
          internationalStandard: 200,
          internationalExpress: 500,
        },
        indiaFreeShippingThreshold: indiaFreeShippingThreshold || 2000,
        internationalFreeShippingThreshold:
          internationalFreeShippingThreshold || 5000,
        key: "store_settings",
      });
    } else {
      // Update existing settings
      if (taxRateIndia !== undefined) {
        settings.taxRateIndia = taxRateIndia;
      }
      if (taxRateInternational !== undefined) {
        settings.taxRateInternational = taxRateInternational;
      }
      if (shippingRates) {
        settings.shippingRates = {
          ...settings.shippingRates,
          ...shippingRates,
        };
      }
      if (indiaFreeShippingThreshold !== undefined) {
        settings.indiaFreeShippingThreshold = indiaFreeShippingThreshold;
      }
      if (internationalFreeShippingThreshold !== undefined) {
        settings.internationalFreeShippingThreshold =
          internationalFreeShippingThreshold;
      }
      await settings.save();
    }

    res.json({
      success: true,
      message: "Settings updated successfully",
      data: settings,
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({
      success: false,
      message: "Error updating settings",
      error: error.message,
    });
  }
};
