import React from "react";

export default function StarRating({
  rating,
  onChange,
  readonly = false,
  size = "default",
}) {
  const stars = [1, 2, 3, 4, 5];

  const sizeClasses =
    size === "large" ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl";

  return (
    <div className="flex items-center gap-0.5">
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onChange && onChange(star)}
          disabled={readonly}
          className={`${sizeClasses} transition ${
            readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
          } ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
