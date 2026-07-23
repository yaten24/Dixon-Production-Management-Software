import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import {
  HiOutlineArrowLeft,
  HiOutlineCalendarDays,
  HiOutlineBuildingOffice2,
  HiOutlineClock,
  HiOutlineArrowDownTray,
  HiOutlinePrinter,
  HiOutlineMagnifyingGlass,
  HiOutlineXMark,
  HiOutlineCog6Tooth,
} from "react-icons/hi2";
import { getDailyPlan, getDailyPlanDetails } from "../../api/dailyPlanApi";
import PageTitleStrip from "./PageTitleStrip";

const STATUS_STYLES = {
  Draft: "bg-[#F5F5F5] text-[#9B9B9B]",
  Published: "bg-[#FDC94D]/20 text-[#0F1D24]",
  Completed: "bg-green-100 text-green-700",
  Closed: "bg-red-100 text-red-600",
};

// ============================================================
// Sidebar summary tile — used inside the navy context panel.
// ============================================================
const SummaryTile = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-2.5">
    <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-white/15 bg-white/5 text-[#FDC94D]">
      <Icon className="h-3.5 w-3.5" />
    </div>
    <div className="min-w-0 leading-tight">
      <p className="text-[9px] font-bold uppercase tracking-wide text-white/40">{label}</p>
      <p className="truncate text-[12.5px] font-semibold text-white">{value}</p>
    </div>
  </div>
);

// ============================================================
// Stat card — used in the top metrics row.
// ============================================================
const StatCard = ({ value, label }) => (
  <div className="flex-1 border border-[#C6C6C6] bg-white px-4 py-3">
    <p className="text-xl font-bold leading-none text-[#0F1D24]">{value}</p>
    <p className="mt-1.5 text-[9.5px] font-bold uppercase tracking-wide text-[#9B9B9B]">{label}</p>
  </div>
);

const ViewDailyPlanPage = () => {
  const { id } = useParams(); // daily_plan_id
  const navigate = useNavigate();

  const [header, setHeader] = useState(null);
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchPlan = async () => {
      setLoading(true);
      setError(null);
      try {
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

  const filteredDetails = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return details;
    return details.filter((d) =>
      [d.machine_name, d.operator_code, d.part_name]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(q))
    );
  }, [details, search]);

  const totals = useMemo(() => {
    return filteredDetails.reduce(
      (acc, d) => ({
        targetQty: acc.targetQty + (Number(d.target_qty) || 0),
        estHours: acc.estHours + (Number(d.estimated_run_hours) || 0),
      }),
      { targetQty: 0, estHours: 0 }
    );
  }, [filteredDetails]);

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

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#EFEFEF]">
        <p className="text-sm font-medium text-[#9B9B9B]">Loading plan…</p>
      </div>
    );
  }

  if (error || !header) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#EFEFEF] px-4">
        <p className="text-sm font-medium text-red-500">
          {error || "Plan not found"}
        </p>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 border border-[#C6C6C6] bg-white px-3 py-1.5 text-xs font-semibold text-[#0F1D24] transition-colors duration-100 hover:border-[#0F1D24]"
        >
          <HiOutlineArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EFEFEF]">
      <PageTitleStrip
        eyebrow="Daily Plan"
        title={header.plan_number}
        subtitle={`${header.planning_date} · ${header.hall} · Shift ${header.shift}`}
        actions={
          <>
            <span
              className={`flex items-center bg-white px-2.5 text-[11px] font-bold ${
                STATUS_STYLES[header.status] || STATUS_STYLES.Draft
              }`}
            >
              {header.status}
            </span>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-white px-2.5 text-[11px] font-semibold text-[#0F1D24] transition-colors duration-100 hover:bg-[#0F1D24] hover:text-[#FDC94D]"
            >
              <HiOutlinePrinter className="h-3.5 w-3.5" />
              Print
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 bg-[#0F1D24] px-2.5 text-[11px] font-semibold text-[#FDC94D] transition-colors duration-100 hover:bg-white hover:text-[#0F1D24]"
            >
              <HiOutlineArrowDownTray className="h-3.5 w-3.5" />
              Export to Excel
            </button>
          </>
        }
      />

      <main className="w-full space-y-3 px-3 pb-6 pt-3">
        {/* Context sidebar + stat cards */}
        <div className="grid grid-cols-1 gap-px border border-[#C6C6C6] bg-[#C6C6C6] md:grid-cols-[260px_1fr]">
          <div className="space-y-4 bg-[#0F1D24] p-5">
            <SummaryTile icon={HiOutlineCalendarDays} label="Date" value={header.planning_date} />
            <SummaryTile icon={HiOutlineBuildingOffice2} label="Hall" value={header.hall} />
            <SummaryTile icon={HiOutlineClock} label="Shift" value={`Shift ${header.shift}`} />
            {header.remarks && (
              <p className="border-t border-white/10 pt-3 text-[11px] leading-relaxed text-white/60">
                {header.remarks}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-px bg-[#C6C6C6] sm:flex-row">
            <StatCard value={header.total_machines} label="Total Machines" />
            <StatCard value={header.planned_machines} label="Planned Machines" />
            <StatCard value={header.total_target_qty} label="Total Target Qty" />
          </div>
        </div>

        {/* Toolbar: search + result count */}
        <div className="flex flex-wrap items-center justify-between gap-2 border border-[#C6C6C6] bg-white px-3 py-2">
          <div className="flex items-center gap-2">
            <HiOutlineCog6Tooth className="h-4 w-4 text-[#0F1D24]" />
            <h2 className="text-[12.5px] font-bold text-[#0F1D24]">Machine Allocations</h2>
            <span className="border border-[#C6C6C6] bg-[#FAFAFA] px-1.5 py-[1px] text-[10px] font-bold text-[#9B9B9B]">
              {filteredDetails.length}
              {search ? ` / ${details.length}` : ""}
            </span>
          </div>

          <div className="relative">
            <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9B9B9B]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search machine, operator, part..."
              className="h-8 w-64 border border-[#C6C6C6] bg-white pl-8 pr-7 text-[11.5px] outline-none focus:border-[#0F1D24]"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-1.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center text-[#9B9B9B] hover:text-[#0F1D24]"
              >
                <HiOutlineXMark className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Machine-wise details table */}
        <div className="border border-[#C6C6C6] bg-white">
          <div className="max-h-[560px] overflow-auto">
            <table className="w-full text-left text-[12px]">
              <thead className="sticky top-0 z-10 bg-[#0F1D24] text-white">
                <tr>
                  <th className="px-2.5 py-2 font-semibold">Machine</th>
                  <th className="px-2.5 py-2 font-semibold">Operator</th>
                  <th className="px-2.5 py-2 font-semibold">Part</th>
                  <th className="px-2.5 py-2 text-right font-semibold font-mono">Target Qty</th>
                  <th className="px-2.5 py-2 text-right font-semibold font-mono">Cycle Time (s)</th>
                  <th className="px-2.5 py-2 text-right font-semibold font-mono">Est. Run Hrs</th>
                </tr>
              </thead>
              <tbody>
                {filteredDetails.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-[11.5px] text-[#9B9B9B]">
                      {search ? "No machines match your search." : "No machine allocations yet."}
                    </td>
                  </tr>
                ) : (
                  filteredDetails.map((d, idx) => (
                    <tr
                      key={d.daily_detail_id}
                      className={`border-t border-[#C6C6C6] transition-colors duration-100 hover:bg-[#FDC94D]/10 ${
                        idx % 2 === 1 ? "bg-[#FAFAFA]/60" : "bg-white"
                      }`}
                    >
                      <td className="px-2.5 py-1.5 font-mono font-semibold text-[#0F1D24]">
                        {d.machine_name || `#${d.machine_id}`}
                      </td>
                      <td className="px-2.5 py-1.5 text-[#9B9B9B]">{d.operator_code || "—"}</td>
                      <td className="px-2.5 py-1.5 text-[#9B9B9B]">{d.part_name || `#${d.part_id}`}</td>
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
              {filteredDetails.length > 0 && (
                <tfoot className="sticky bottom-0 border-t-2 border-[#0F1D24] bg-[#FAFAFA]">
                  <tr>
                    <td colSpan={3} className="px-2.5 py-2 text-right text-[10.5px] font-bold uppercase tracking-wide text-[#9B9B9B]">
                      Totals
                    </td>
                    <td className="px-2.5 py-2 text-right font-mono font-bold text-[#0F1D24]">
                      {totals.targetQty.toLocaleString()}
                    </td>
                    <td className="px-2.5 py-2" />
                    <td className="px-2.5 py-2 text-right font-mono font-bold text-[#0F1D24]">
                      {totals.estHours.toFixed(1)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ViewDailyPlanPage;