import { Inbox } from 'lucide-react';

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-[20px] border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 text-slate-400">
        <Inbox size={26} />
      </div>
      <h3 className="text-base font-semibold text-slate-900">No Plan Types Available</h3>
      <p className="mt-1 max-w-xs text-sm text-slate-500">
        No plan type matches your search or filter. Try a different keyword or clear the filter.
      </p>
    </div>
  );
}