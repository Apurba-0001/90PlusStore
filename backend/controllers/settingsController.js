import Settings from "../models/Settings.js";

// Get store settings
export const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({ key: "store_settings" });

    // Create default settings if they don't exist
    if (!settings) {
      settings = await Settings.create({
        key: "store_settings",
        taxRate: 10,
        shippingRates: {
          indiaStandard: 10,
          indiaExpress: 50,
          internationalStandard: 200,
          internationalExpress: 500,
        },
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
    const { taxRate, shippingRates } = req.body;

    // Validate input
    if (taxRate !== undefined && (taxRate < 0 || taxRate > 100)) {
      return res.status(400).json({
        success: false,
        message: "Tax rate must be between 0 and 100",
      });
    }

    if (shippingRates) {
      const rates = Object.values(shippingRates);
      if (rates.some((rate) => rate < 0)) {
        return res.status(400).json({
          success: false,
          message: "Shipping rates must be non-negative",
        });
      }
    }

    let settings = await Settings.findOne({ key: "store_settings" });

    if (!settings) {
      // Create new settings if they don't exist
      settings = await Settings.create({
        key: "store_settings",
        taxRate: taxRate || 10,
        shippingRates: shippingRates || {
          indiaStandard: 10,
          indiaExpress: 50,
          internationalStandard: 200,
          internationalExpress: 500,
        },
      });
    } else {
      // Update existing settings
      if (taxRate !== undefined) {
        settings.taxRate = taxRate;
      }
      if (shippingRates) {
        settings.shippingRates = {
          ...settings.shippingRates,
          ...shippingRates,
        };
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
