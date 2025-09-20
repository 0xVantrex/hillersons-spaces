const LoadingSkeleton = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-emerald-100 animate-pulse">
          <div className="bg-emerald-200 h-64 w-full"></div>
          <div className="p-6">
            <div className="h-6 bg-emerald-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-emerald-100 rounded w-full mb-2"></div>
            <div className="h-4 bg-emerald-100 rounded w-5/6 mb-6"></div>
            <div className="flex justify-between">
              <div className="h-8 bg-emerald-200 rounded w-24"></div>
              <div className="h-8 bg-emerald-200 rounded w-24"></div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default LoadingSkeleton;