const BucketCardSkeleton = () => {
  return (
    <div className="relative bg-white rounded-lg shadow-md overflow-hidden flex flex-col w-full animate-pulse">
      {/* Image placeholder */}
      <div className="w-full h-48 bg-gray-200" />

      {/* Status label placeholder */}
      <div className="absolute right-0 m-2">
        <div className="h-6 w-16 bg-gray-200 rounded-full" />
      </div>

      {/* Content area */}
      <div className="p-4 pt-3 flex-grow flex flex-col justify-between">
        <div className="mb-2">
          {/* Title placeholder */}
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
          {/* Summary placeholder */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
          </div>
        </div>

        {/* Progress bar placeholder */}
        <div>
          <div className="h-2 bg-gray-200 rounded-full mt-2 mb-3" />
          <div className="flex gap-x-3 mt-1 items-center">
            <div className="h-4 w-12 bg-gray-200 rounded" />
            <div className="h-4 w-16 bg-gray-200 rounded ml-auto" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const BucketGridSkeleton = ({ count = 6 }: { count?: number }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <BucketCardSkeleton key={i} />
      ))}
    </>
  );
};

export default BucketCardSkeleton;
