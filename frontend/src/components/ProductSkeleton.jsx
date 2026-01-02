export default function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-200" />

      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />

        <div className="flex gap-2">
          <div className="h-3 w-3 bg-gray-200 rounded-full" />
          <div className="h-3 w-3 bg-gray-200 rounded-full" />
          <div className="h-3 w-3 bg-gray-200 rounded-full" />
          <div className="h-3 w-3 bg-gray-200 rounded-full" />
        </div>

        <div className="h-6 bg-gray-300 rounded w-1/3" />
        <div className="h-10 bg-gray-300 rounded-xl w-full" />
      </div>
    </div>
  );
}
