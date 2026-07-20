export default function FooterActions({ onCancel, onContinue, disabled }) {
  return (
    <div className="sticky bottom-0 flex items-center justify-between border-t border-slate-200 bg-white/95 px-6 py-4 backdrop-blur sm:px-8">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onContinue}
        disabled={disabled}
        className={`rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition ${
          disabled
            ? 'cursor-not-allowed bg-slate-300'
            : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
        }`}
      >
        Continue
      </button>
    </div>
  );
}