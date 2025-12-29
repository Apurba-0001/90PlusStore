// MongoDB Update Query for existing products
// Run this in MongoDB compass or mongosh

// Update all products to new schema
db.products.updateMany({}, [
  {
    $set: {
      gender: {
        $cond: [{ $eq: ["$gender", null] }, "Men", "$gender"],
      },
      availableSizes: {
        $cond: [
          { $eq: ["$availableSizes", null] },
          {
            $cond: [
              { $gt: [{ $size: { $ifNull: ["$sizes", []] } }, 0] },
              { $map: { input: "$sizes", as: "s", in: "$$s.size" } },
              ["M", "L", "XL"],
            ],
          },
          "$availableSizes",
        ],
      },
      images: {
        $cond: [
          { $gt: [{ $size: { $ifNull: ["$images", []] } }, 0] },
          "$images",
          {
            $cond: [
              { $ne: ["$image", null] },
              [{ url: "$image", alt: "$name" }],
              [],
            ],
          },
        ],
      },
      category: {
        $switch: {
          branches: [
            {
              case: { $eq: ["$category", "Shirts"] },
              then: "Jackets and Sweatshirts",
            },
            { case: { $eq: ["$category", "Jersey"] }, then: "Jerseys" },
          ],
          default: "$category",
        },
      },
    },
  },
]);

console.log("Products migration completed!");

// To verify, you can run:
db.products.findOne();
