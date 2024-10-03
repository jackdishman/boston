// UserFilter.tsx
import React from 'react';
import Filter from "@/app/components/icons/Filter";

interface UserFilterProps {
  sortOption: string;
  setSortOption: (option: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isFilterOpen: boolean;
  setIsFilterOpen: (isOpen: boolean) => void;
}

export default function UserFilter({
  sortOption,
  setSortOption,
  searchQuery,
  setSearchQuery,
  isFilterOpen,
  setIsFilterOpen,
}: UserFilterProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filterContent = (
    <>
      <div className="mb-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Sort by:
        </label>
        <div className="flex flex-col space-y-2">
          <button
            onClick={() => setSortOption("alphabeticalAsc")}
            className={`px-4 py-2 rounded ${
              sortOption === "alphabeticalAsc"
                ? "bg-gray-200 border-2 border-blue-500"
                : "bg-blue-500 text-white"
            }`}
          >
            Alphabetical (A-Z)
          </button>
          <button
            onClick={() => setSortOption("alphabeticalDesc")}
            className={`px-4 py-2 rounded ${
              sortOption === "alphabeticalDesc"
                ? "bg-gray-200 border-2 border-blue-500"
                : "bg-blue-500 text-white"
            }`}
          >
            Alphabetical (Z-A)
          </button>
          <button
            onClick={() => setSortOption("followersCountAsc")}
            className={`px-4 py-2 rounded ${
              sortOption === "followersCountAsc"
                ? "bg-gray-200 border-2 border-blue-500"
                : "bg-blue-500 text-white"
            }`}
          >
            Followers Count (Ascending)
          </button>
          <button
            onClick={() => setSortOption("followersCountDesc")}
            className={`px-4 py-2 rounded ${
              sortOption === "followersCountDesc"
                ? "bg-gray-200 border-2 border-blue-500"
                : "bg-blue-500 text-white"
            }`}
          >
            Followers Count (Descending)
          </button>
        </div>
      </div>
      <div className="mb-5">
        <input
          type="text"
          placeholder="Search by username or display name"
          value={searchQuery}
          onChange={handleSearchChange}
          className="block w-full px-4 py-2 border border-gray-300 rounded text-xs focus:outline-none focus:ring focus:ring-blue-500"
        />
      </div>
    </>
  );

  return (
    <>
      {/* Sidebar */}
      <div className="w-full lg:w-1/4 fixed lg:relative z-20 bg-white shadow-lg lg:shadow-none lg:block hidden">
        <div className="p-4 lg:sticky lg:top-20">{filterContent}</div>
      </div>

      {/* Mobile Filter Button */}
      <button
        onClick={() => setIsFilterOpen(!isFilterOpen)}
        className="fixed bottom-4 left-4 bg-blue-500 text-white p-2 rounded-full z-40 lg:hidden"
      >
        <Filter />
      </button>

      {/* Mobile Filter Panel */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-30 mt-20 bg-white p-4 lg:hidden">
          <button
            onClick={() => setIsFilterOpen(false)}
            className="absolute top-4 right-4 text-gray-500 text-2xl"
          >
            ✖
          </button>
          <div className="mt-8">{filterContent}</div>
        </div>
      )}
    </>
  );
}
