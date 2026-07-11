import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PaginationControls = ({
  page,
  totalPages,
  totalCount,
  pageSize,
  onPrev,
  onNext,
}) => {
  const start = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalCount);

  return (
    <div className="flex items-center justify-between rounded-sm border border-[#E2E4E9] bg-white px-3 py-1.5">
      <span className="text-[11px] text-slate-500 font-mono">
        {start}-{end} of {totalCount}
      </span>

      <div className="flex items-center gap-1.5">
        <button
          onClick={onPrev}
          disabled={page <= 1}
          className="flex h-7 items-center gap-1 rounded-sm border border-[#E2E4E9] px-2.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={12} />
          Prev
        </button>

        <span className="text-[11px] font-medium text-slate-500 font-mono">
          Page {page} / {totalPages}
        </span>

        <button
          onClick={onNext}
          disabled={page >= totalPages}
          className="flex h-7 items-center gap-1 rounded-sm border border-[#E2E4E9] px-2.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
          <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
};

export default PaginationControls;
