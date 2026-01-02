export default function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 py-6 animate-pulse">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image */}
          <div className="aspect-square bg-gray-300 rounded-2xl" />

          {/* Details */}
          <div className="space-y-4">
            <div className="h-8 bg-gray-300 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-6 bg-gray-300 rounded w-1/4" />

            <div className="h-24 bg-gray-200 rounded" />

            <div className="flex gap-3">
              <div className="h-12 bg-gray-300 rounded w-40" />
              <div className="h-12 bg-gray-200 rounded w-40" />
            </div>
          </div>
        </div>

        {/* Related products skeleton */}
        <div className="mt-10">
          <div className="h-6 bg-gray-300 rounded w-1/3 mb-4" />
          <div className="flex gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="w-40 h-56 bg-gray-200 rounded-xl"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
