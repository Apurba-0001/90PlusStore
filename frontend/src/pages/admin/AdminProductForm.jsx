import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productService } from "../../services/services";

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!!id);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    gender: "Men",
    category: "Jerseys",
    stock: "",
    brand: "",
    productId: "",
    availableSizes: ["M", "L", "XL"],
    images: [{ url: "", alt: "" }],
  });

  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        try {
          const response = await productService.getProductById(id);
          const productData = response.data;
          setFormData((prev) => ({
            ...prev,
            ...productData,
            availableSizes: productData.availableSizes || ["M", "L", "XL"],
          }));
        } catch (err) {
          alert("Error loading product: " + err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchProduct();
    }
  }, [id]);

  // Reset availableSizes when category changes to ensure valid sizes
  useEffect(() => {
    // Get default sizes based on category
    const getDefaultSizes = () => {
      if (formData.category === "Footwear") {
        return ["9", "10", "11"];
      } else if (formData.category === "Special Collectibles") {
        return [];
      } else {
        return ["M", "L", "XL"];
      }
    };

    // Only reset if the current availableSizes contain invalid values for this category
    const validSizesForCategory =
      formData.category === "Footwear"
        ? ["6", "7", "8", "9", "10", "11", "12", "13", "14"]
        : ["XS", "S", "M", "L", "XL", "XXL"];

    const hasInvalidSizes = formData.availableSizes.some(
      (size) => !validSizesForCategory.includes(size),
    );

    if (hasInvalidSizes) {
      setFormData((prev) => ({
        ...prev,
        availableSizes: getDefaultSizes(),
      }));
    }
  }, [formData.category]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (index, field, value) => {
    const newImages = [...formData.images];
    newImages[index][field] = value;
    setFormData((prev) => ({ ...prev, images: newImages }));
  };

  const handleAddImage = () => {
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, { url: "", alt: "" }],
    }));
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form data
      if (
        !formData.name ||
        !formData.description ||
        !formData.price ||
        !formData.stock
      ) {
        alert("Please fill in all required fields");
        setLoading(false);
        return;
      }

      console.log("Submitting product:", formData);

      if (id) {
        await productService.updateProduct(id, formData);
      } else {
        await productService.createProduct(formData);
      }
      navigate("/admin/products");
    } catch (err) {
      console.error("Error details:", err);
      console.error("Response data:", err.response?.data);
      console.error("Response status:", err.response?.status);
      const errorMsg =
        err.response?.data?.message || err.message || "Unknown error";
      alert("Error saving product: " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">
        {id ? "Edit Product" : "Add New Product"}
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-blue-50 rounded-lg shadow p-6 space-y-4 border border-blue-100"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Product Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
            >
              <option>Men</option>
              <option>Women</option>
              <option>Kids</option>
              <option>All</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
            >
              <option>Jerseys</option>
              <option>Jackets and Sweatshirts</option>
              <option>Footwear</option>
              <option>Shorts</option>
              <option>Tracksuits</option>
              <option>Special Collectibles</option>
              <option>Accessories</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-bold mb-2">Price</label>
            <input
              type="number"
              step="0.01"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Stock Quantity
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-bold mb-2">Brand</label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Product ID
            </label>
            <input
              type="text"
              name="productId"
              value={formData.productId}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>

        {/* Available Sizes */}
        <div>
          <label className="block text-gray-700 font-bold mb-3">
            Available Sizes {formData.category === "Footwear" && "(UK)"}
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {(formData.category === "Footwear"
              ? ["6", "7", "8", "9", "10", "11", "12", "13", "14"]
              : ["XS", "S", "M", "L", "XL", "XXL"]
            ).map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => {
                  if (formData.availableSizes.includes(size)) {
                    setFormData((prev) => ({
                      ...prev,
                      availableSizes: prev.availableSizes.filter(
                        (s) => s !== size,
                      ),
                    }));
                  } else {
                    setFormData((prev) => ({
                      ...prev,
                      availableSizes: [...prev.availableSizes, size],
                    }));
                  }
                }}
                className={`px-4 py-2 rounded font-semibold transition ${
                  formData.availableSizes.includes(size)
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-gray-700 font-bold mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="4"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
          ></textarea>
        </div>

        <div>
          <label className="block text-gray-700 font-bold mb-2">
            Product Images
          </label>
          {formData.images.map((image, index) => (
            <div key={index} className="space-y-2 mb-4 p-4 bg-gray-50 rounded">
              <input
                type="text"
                placeholder="Image URL"
                value={image.url}
                onChange={(e) =>
                  handleImageChange(index, "url", e.target.value)
                }
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
              />
              <input
                type="text"
                placeholder="Alt Text"
                value={image.alt}
                onChange={(e) =>
                  handleImageChange(index, "alt", e.target.value)
                }
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
              />
              {formData.images.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove Image
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddImage}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
          >
            + Add Another Image
          </button>
        </div>

        <div className="flex space-x-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Saving..." : id ? "Update Product" : "Create Product"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="flex-1 bg-gray-600 text-white py-2 rounded-lg font-bold hover:bg-gray-700 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
