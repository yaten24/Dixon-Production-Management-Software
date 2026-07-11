import React from "react";
import { Search, RotateCcw, Plus } from "lucide-react";

// UPDATED: categories/customers/sources are now passed in as props
// (fetched from GET /parts/filter-options, covering the WHOLE table)
// instead of being derived from the `parts` prop, which only ever
// reflected whatever single page of 100 rows was currently loaded.
const PartsFilters = ({
  search,
  setSearch,
  category,
  setCategory,
  customer,
  setCustomer,
  source,
  setSource,
  status,
  setStatus,
  categories = [],
  customers = [],
  sources = [],
  onAddPart,
}) => {
  const resetFilters = () => {
    setSearch("");
    setCategory("All");
    setCustomer("All");
    setSource("All");
    setStatus("All");
  };

  const handleAddPart = () => {
    onAddPart?.();
  };

  const selectClass =
    "h-8 w-full rounded-sm border border-[#E2E4E9] px-2 text-xs text-slate-700 bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all";

  return (
    <div className="rounded-sm border border-[#E2E4E9] bg-white p-1.5">
      <div className="flex flex-col gap-1.5 lg:flex-row lg:items-center">
        {/* Search */}
        <div className="relative w-full lg:max-w-xs">
          <Search
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search part number or name..."
            className="h-8 w-full rounded-sm border border-[#E2E4E9] pl-8 pr-2 text-xs outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Category */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={`${selectClass} lg:w-32`}
        >
          <option value="All">All Categories</option>
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        {/* Customer */}
        <select
          value={customer}
          onChange={(e) => setCustomer(e.target.value)}
          className={`${selectClass} lg:w-32`}
        >
          <option value="All">All Customers</option>
          {customers.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        {/* Source */}
        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className={`${selectClass} lg:w-32`}
        >
          <option value="All">All Sources</option>
          {sources.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        {/* Status */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className={`${selectClass} lg:w-24`}
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>

        {/* Buttons */}
        <div className="flex w-full gap-1.5 lg:ml-auto lg:w-auto">
          <button
            onClick={resetFilters}
            className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-sm border border-[#E2E4E9] px-3 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors lg:flex-none"
          >
            <RotateCcw size={12} />
            Reset
          </button>

          <button
            onClick={handleAddPart}
            className="
              group
              relative
              flex
              h-8
              flex-1
              items-center
              justify-center
              gap-1.5
              overflow-hidden
              rounded-sm
              bg-gradient-to-r
              from-[#2563EB]
              to-blue-500
              px-3.5
              text-xs
              font-semibold
              text-white
              shadow-sm
              transition-all
              hover:shadow-md
              hover:from-blue-700
              hover:to-blue-600
              active:scale-[0.98]
              lg:flex-none
            "
          >
            <Plus
              size={13}
              className="transition-transform duration-200 group-hover:rotate-90"
            />
            Add Part
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(PartsFilters);