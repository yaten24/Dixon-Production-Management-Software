import React from "react";
import { FaPlus, FaTrash } from "react-icons/fa";

const MouldRejectBreakup = ({
  mouldReject,
  mouldRejectReasons = [],

  addCustomMouldRejectReason,
  removeCustomMouldRejectReason,

  updateMouldRejectReason,

  totalMouldRejectQty,
}) => {
  if (Number(mouldReject) <= 0) {
    return null;
  }

  const isMatched =
    Number(mouldReject) > 0 &&
    Number(mouldReject) === Number(totalMouldRejectQty);
  const isMismatched =
    Number(mouldReject) > 0 &&
    Number(mouldReject) !== Number(totalMouldRejectQty);

  return (
    <div className="border border-[#E2E4E9] bg-white rounded-sm p-3">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-800">
            Mould Reject Breakup
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Enter mould reject quantity against each reason
          </p>
        </div>

        <button
          type="button"
          onClick={addCustomMouldRejectReason}
          className="h-7 px-2.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-medium rounded-sm flex items-center gap-1.5 transition-colors"
        >
          <FaPlus size={10} />
          Custom Reason
        </button>
      </div>

      {/* REASONS */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2">
        {mouldRejectReasons.map((item, index) => (
          <div
            key={index}
            className="border border-[#E2E4E9] rounded-sm p-2 bg-orange-50/40"
          >
            <div className="flex items-center justify-between gap-1.5 mb-1.5">
              {item.custom ? (
                <input
                  type="text"
                  value={item.reason}
                  placeholder="Custom Reason"
                  onChange={(e) =>
                    updateMouldRejectReason(index, "reason", e.target.value)
                  }
                  className="flex-1 h-7 min-w-0 border border-[#E2E4E9] rounded-sm px-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                />
              ) : (
                <label
                  className="text-[11px] font-semibold text-slate-600 leading-tight truncate"
                  title={item.reason}
                >
                  {item.reason}
                </label>
              )}

              {item.custom && (
                <button
                  type="button"
                  onClick={() => removeCustomMouldRejectReason(index)}
                  className="h-7 w-7 shrink-0 bg-red-600 hover:bg-red-700 text-white rounded-sm flex items-center justify-center"
                >
                  <FaTrash size={10} />
                </button>
              )}
            </div>

            <input
              type="number"
              min="0"
              step="1"
              value={item.qty}
              placeholder="Qty"
              onChange={(e) =>
                updateMouldRejectReason(index, "qty", e.target.value)
              }
              onWheel={(e) => e.target.blur()}
              onKeyDown={(e) => {
                if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                  e.preventDefault();
                }
              }}
              className="
                w-full
                h-8
                border
                border-[#E2E4E9]
                rounded-sm
                px-2
                text-xs
                font-mono
                bg-white

                focus:outline-none
                focus:ring-1
                focus:ring-orange-400
                focus:border-orange-400

                [appearance:textfield]
                [&::-webkit-outer-spin-button]:appearance-none
                [&::-webkit-inner-spin-button]:appearance-none
              "
            />
          </div>
        ))}
      </div>

      {/* TOTAL */}
      <div className="flex justify-end mt-2.5">
        <div className="bg-slate-50 border border-[#E2E4E9] rounded-sm px-3 py-1.5 text-xs font-bold text-slate-700 font-mono">
          Total Mould Reject: {totalMouldRejectQty}
        </div>
      </div>

      {/* VALIDATION / SUCCESS */}
      {isMismatched && (
        <div className="mt-2 px-2.5 py-1.5 rounded-sm border border-red-200 bg-red-50 text-red-600 text-[11px] font-medium">
          Mould Reject Qty ({mouldReject}) and Total Mould Reject Breakup (
          {totalMouldRejectQty}) must be equal.
        </div>
      )}

      {isMatched && (
        <div className="mt-2 px-2.5 py-1.5 rounded-sm border border-emerald-200 bg-emerald-50 text-emerald-600 text-[11px] font-medium">
          ✓ Mould Reject Breakup Total Matched
        </div>
      )}
    </div>
  );
};

export default MouldRejectBreakup;
