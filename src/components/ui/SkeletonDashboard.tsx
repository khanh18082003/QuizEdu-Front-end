import SkeletonLoader from "./SkeletonLoader";

const SkeletonDashboard = () => {
  return (
    <div className="animate-fadeIn">
      {/* Dashboard Title */}
      <div className="mb-8">
        <SkeletonLoader height="36px" width="240px" borderRadius="0.375rem" />
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Join Class Card */}
        <div className="rounded-xl border border-gray-100/60 bg-white p-6 shadow-sm transition-all dark:border-gray-700/40 dark:bg-gray-800">
          <SkeletonLoader height="28px" width="150px" className="mb-4" />
          <SkeletonLoader height="20px" width="80%" className="mb-4" />
          <SkeletonLoader height="46px" className="rounded-lg" />
          <SkeletonLoader
            height="46px"
            width="100%"
            className="mt-4 rounded-lg"
          />
        </div>

        {/* Your Stats Card */}
        <div className="rounded-xl border border-gray-100/60 bg-white p-6 shadow-sm transition-all dark:border-gray-700/40 dark:bg-gray-800">
          <SkeletonLoader height="28px" width="140px" className="mb-4" />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center justify-center rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
              <SkeletonLoader
                height="32px"
                width="32px"
                borderRadius="9999px"
                className="mb-2"
              />
              <SkeletonLoader height="30px" width="60px" className="mb-1" />
              <SkeletonLoader height="18px" width="90px" />
            </div>

            <div className="flex flex-col items-center justify-center rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
              <SkeletonLoader
                height="32px"
                width="32px"
                borderRadius="9999px"
                className="mb-2"
              />
              <SkeletonLoader height="30px" width="40px" className="mb-1" />
              <SkeletonLoader height="18px" width="100px" />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center justify-center rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
              <SkeletonLoader
                height="32px"
                width="32px"
                borderRadius="9999px"
                className="mb-2"
              />
              <SkeletonLoader height="30px" width="20px" className="mb-1" />
              <SkeletonLoader height="18px" width="110px" />
            </div>

            <div className="flex flex-col items-center justify-center rounded-lg bg-amber-50 p-4 dark:bg-amber-900/20">
              <SkeletonLoader
                height="32px"
                width="32px"
                borderRadius="9999px"
                className="mb-2"
              />
              <SkeletonLoader height="30px" width="20px" className="mb-1" />
              <SkeletonLoader height="18px" width="120px" />
            </div>
          </div>
        </div>

        {/* Recent Activities Card */}
        <div className="rounded-xl border border-gray-100/60 bg-white p-6 shadow-sm transition-all dark:border-gray-700/40 dark:bg-gray-800">
          <SkeletonLoader height="28px" width="200px" className="mb-4" />

          {/* Activity Items */}
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className={`flex items-center justify-between ${index > 0 ? "mt-4" : ""}`}
            >
              <div className="flex flex-1 items-center">
                <SkeletonLoader
                  height="36px"
                  width="36px"
                  borderRadius="0.375rem"
                  className="mr-3"
                />
                <div className="flex-1">
                  <SkeletonLoader height="20px" width="80%" className="mb-1" />
                  <SkeletonLoader height="16px" width="50%" />
                </div>
              </div>
              <SkeletonLoader
                height="24px"
                width="50px"
                borderRadius="0.375rem"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Events Section */}
      <div className="mt-8">
        <SkeletonLoader height="28px" width="220px" className="mb-4" />

        <div className="space-y-3">
          {[...Array(2)].map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-xl border border-gray-100/60 bg-white p-4 shadow-sm transition-all dark:border-gray-700/40 dark:bg-gray-800"
            >
              <div className="flex items-center">
                <SkeletonLoader
                  height="42px"
                  width="42px"
                  borderRadius="0.5rem"
                  className="mr-4"
                />
                <div>
                  <SkeletonLoader
                    height="20px"
                    width="180px"
                    className="mb-2"
                  />
                  <SkeletonLoader height="16px" width="140px" />
                </div>
              </div>
              <SkeletonLoader
                height="36px"
                width="90px"
                borderRadius="0.375rem"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkeletonDashboard;
