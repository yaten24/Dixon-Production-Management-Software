import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import * as XLSX from "xlsx";
import {
  HiOutlineArrowLeft,
  HiOutlineCalendarDays,
  HiOutlineBuildingOffice2,
  HiOutlineClock,
  HiOutlineArrowDownTray,
} from "react-icons/hi2";
import { getDailyPlan, getDailyPlanDetails } from "../../api/dailyPlanApi";

const STATUS_STYLES = {
  Draft: "bg-[#F5F5F5] text-[#9B9B9B]",
  Published: "bg-[#FDC94D]/20 text-[#0F1D24]",
  Completed: "bg-green-100 text-green-700",
  Closed: "bg-red-100 text-red-600",
};

// ============================================================
// Subtle twinkling-stars background — small fixed dots with a
// looping opacity pulse, seeded from the index so it doesn't
// reshuffle on every re-render.
// ============================================================
const STAR_COUNT = 70;

function StarsBackground() {
  const stars = useMemo(
    () =>
      Array.from({ length: STAR_COUNT }, (_, i) => ({
        id: i,
        top: `${(i * 37.3) % 100}%`,
        left: `${(i * 53.7) % 100}%`,
        size: 1 + (i % 3),
        duration: 2.5 + (i % 5),
        delay: (i % 12) * 0.25,
      })),
    [],
  );

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {stars.map((s) => (
        <motion.span
          key={s.id}
          className="absolute rounded bg-[#0F1D24]"
          style={{ top: s.top, left: s.left, width: s.size, height: s.size }}
          animate={{ opacity: [0.08, 0.4, 0.08] }}
          transition={{
            duration: s.duration,
            repeat: Infinity,
            delay: s.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

const InfoPill = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-2">
    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded bg-[#0F1D24] text-[#FDC94D]">
      <Icon className="h-3.5 w-3.5" />
    </div>
    <div className="min-w-0 leading-tight">
      <p className="text-[9px] font-bold uppercase tracking-wide text-[#9B9B9B]">
        {label}
      </p>
      <p className="truncate text-[12.5px] font-bold text-[#0F1D24]">{value}</p>
    </div>
  </div>
);

const StatPill = ({ value, label }) => (
  <div className="text-center leading-tight">
    <p className="text-sm font-bold text-[#0F1D24]">{value}</p>
    <p className="text-[9px] font-medium uppercase tracking-wide text-[#9B9B9B]">
      {label}
    </p>
  </div>
);

const ViewDailyPlanPage = () => {
  const { id } = useParams(); // daily_plan_id
  const navigate = useNavigate();

  const [header, setHeader] = useState(null);
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchPlan = async () => {
      setLoading(true);
      setError(null);
      try {
        // Backend exposes the header and the machine rows as two separate
        // endpoints (GET /daily-plans/:id and GET /daily-plans/:id/details),
        // so both are fetched in parallel here.
        const [headerRes, detailsRes] = await Promise.all([
          getDailyPlan(id),
          getDailyPlanDetails(id),
        ]);
        if (cancelled) return;
        setHeader(headerRes.data || null);
        setDetails(detailsRes.data || []);
      } catch (err) {
        if (!cancelled)
          setError(
            err.response?.data?.message ||
              err.message ||
              "Something went wrong",
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (id) fetchPlan();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleExport = () => {
    if (!header) return;

    const headerSheet = XLSX.utils.json_to_sheet([
      {
        "Plan Number": header.plan_number,
        Date: header.planning_date,
        Hall: header.hall,
        Shift: header.shift,
        Status: header.status,
        "Total Machines": header.total_machines,
        "Planned Machines": header.planned_machines,
        "Total Target Qty": header.total_target_qty,
        Remarks: header.remarks,
      },
    ]);

    const detailsSheet = XLSX.utils.json_to_sheet(
      details.map((d) => ({
        "Machine ID": d.machine_id,
        "Machine Name": d.machine_name || "",
        "Operator Code": d.operator_code || "",
        "Part ID": d.part_id,
        "Part Name": d.part_name || "",
        "Target Qty": d.target_qty,
        "Cycle Time (s)": d.planned_cycle_time,
        "Est. Run Hours": d.estimated_run_hours,
        Remarks: d.remarks || "",
      })),
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, headerSheet, "Plan Info");
    XLSX.utils.book_append_sheet(workbook, detailsSheet, "Machine Details");

    XLSX.writeFile(workbook, `daily_plan_${header.plan_number || id}.xlsx`);
  };

  if (loading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-[#F7F7F5]">
        <StarsBackground />
        <p className="relative text-sm font-medium text-[#9B9B9B]">
          Loading plan…
        </p>
      </div>
    );
  }

  if (error || !header) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center gap-3 bg-[#F7F7F5] px-4">
        <StarsBackground />
        <p className="relative text-sm font-medium text-red-500">
          {error || "Plan not found"}
        </p>
        <button
          onClick={() => navigate(-1)}
          className="relative flex items-center gap-1.5 rounded border border-[#C6C6C6]/70 bg-white px-3 py-1.5 text-xs font-semibold text-[#0F1D24] transition-colors hover:border-[#0F1D24]"
        >
          <HiOutlineArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#F7F7F5] p-2">
      <StarsBackground />

      <div className="relative w-full">
        {/* Top row */}
        <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2 border-b border-[#C6C6C6] pb-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => navigate(-1)}
              title="Back"
              className="flex h-6.5 w-6.5 flex-shrink-0 items-center justify-center rounded border border-[#C6C6C6]/70 bg-white text-[#0F1D24] transition-colors hover:border-[#0F1D24]"
            >
              <HiOutlineArrowLeft className="h-3 w-3" />
            </button>
            <div className="flex items-center gap-1.5">
              <h1 className="text-[13px] font-bold leading-none tracking-tight text-[#0F1D24]">
                {header.plan_number}
              </h1>
              <span
                className={`inline-block rounded-sm px-1.5 py-[1px] text-[8.5px] font-bold uppercase tracking-wide ${
                  STATUS_STYLES[header.status] || STATUS_STYLES.Draft
                }`}
              >
                {header.status}
              </span>
            </div>
          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 rounded-sm bg-[#0F1D24] px-3.5 py-2 text-[12px] font-semibold text-[#FDC94D] shadow-[0_6px_14px_-6px_rgba(15,29,36,0.45)] transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <HiOutlineArrowDownTray className="h-3.5 w-3.5" />
            Export to Excel
          </button>
        </div>

        {/* Compact info + stats bar — everything on one line on wider screens */}
        <div className="mb-2.5 flex flex-wrap items-center gap-x-6 gap-y-2.5 rounded-sm border border-[#C6C6C6]/60 bg-white px-3.5 py-2.5">
          <InfoPill
            icon={HiOutlineCalendarDays}
            label="Date"
            value={header.planning_date}
          />
          <InfoPill
            icon={HiOutlineBuildingOffice2}
            label="Hall"
            value={header.hall}
          />
          <InfoPill icon={HiOutlineClock} label="Shift" value={header.shift} />

          <div className="hidden h-8 w-px bg-[#C6C6C6]/60 sm:block" />

          <div className="flex flex-1 items-center justify-start gap-6 sm:justify-end">
            <StatPill value={header.total_machines} label="Total Machines" />
            <StatPill
              value={header.planned_machines}
              label="Planned Machines"
            />
            <StatPill
              value={header.total_target_qty}
              label="Total Target Qty"
            />
          </div>

          {header.remarks && (
            <p className="w-full border-t border-[#C6C6C6]/40 pt-2 text-[11px] text-[#9B9B9B]">
              {header.remarks}
            </p>
          )}
        </div>

        {/* Machine-wise details table */}
        <div className="overflow-hidden rounded-sm border border-[#C6C6C6]/60 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px]">
              <thead className="bg-[#0F1D24] text-white">
                <tr>
                  <th className="px-2.5 py-2 font-semibold">Machine</th>
                  <th className="px-2.5 py-2 font-semibold">Operator</th>
                  <th className="px-2.5 py-2 font-semibold">Part</th>
                  <th className="px-2.5 py-2 text-right font-semibold font-mono">
                    Target Qty
                  </th>
                  <th className="px-2.5 py-2 text-right font-semibold font-mono">
                    Cycle Time (s)
                  </th>
                  <th className="px-2.5 py-2 text-right font-semibold font-mono">
                    Est. Run Hrs
                  </th>
                </tr>
              </thead>
              <tbody>
                {details.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-3 py-6 text-center text-[11.5px] text-[#9B9B9B]"
                    >
                      No machine allocations yet.
                    </td>
                  </tr>
                ) : (
                  details.map((d) => (
                    <tr
                      key={d.daily_detail_id}
                      className="border-t border-[#C6C6C6]/50 hover:bg-[#F7F7F5]"
                    >
                      <td className="px-2.5 py-1.5 font-mono font-semibold text-[#0F1D24]">
                        {d.machine_name || `#${d.machine_id}`}
                      </td>
                      <td className="px-2.5 py-1.5 text-[#9B9B9B]">
                        {d.operator_code || "—"}
                      </td>
                      <td className="px-2.5 py-1.5 text-[#9B9B9B]">
                        {d.part_name || `#${d.part_id}`}
                      </td>
                      <td className="px-2.5 py-1.5 text-right font-mono font-semibold text-[#0F1D24]">
                        {d.target_qty}
                      </td>
                      <td className="px-2.5 py-1.5 text-right font-mono text-[#9B9B9B]">
                        {d.planned_cycle_time ?? "—"}
                      </td>
                      <td className="px-2.5 py-1.5 text-right font-mono text-[#9B9B9B]">
                        {d.estimated_run_hours ?? "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewDailyPlanPage;
