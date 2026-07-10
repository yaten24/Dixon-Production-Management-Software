import * as XLSX from "xlsx";

// Sab current dashboard data ko ek multi-sheet Excel file mein export karta hai
export const exportHallDashboardToExcel = ({
  hallCode,
  filters,
  stats,
  machineWise,
  shiftSummary,
  topRejects,
}) => {
  const wb = XLSX.utils.book_new();

  const summaryData = [
    ["Hall Dashboard Export"],
    [`Hall: ${hallCode}`],
    [`Date Range: ${filters.from} to ${filters.to}`],
    [`Machine Filter: ${filters.machine}`],
    [`Shift Filter: ${filters.shift || "All"}`],
    [],
    ["Metric", "Value"],
    ["Target", stats?.target ?? 0],
    ["Actual", stats?.actual ?? 0],
    ["Reject", stats?.reject ?? 0],
    ["Achievement %", stats?.achievement ?? 0],
    ["Loss Minutes", stats?.lossMinutes ?? 0],
    ["Hall OEE %", stats?.oee?.oee ?? 0],
    ["Availability %", stats?.oee?.availability ?? 0],
    ["Performance %", stats?.oee?.performance ?? 0],
    ["Quality %", stats?.oee?.quality ?? 0],
  ];
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet(summaryData),
    "Summary",
  );

  const machineHeader = [
    "Machine",
    "Target",
    "Actual",
    "Reject",
    "Achievement %",
    "OEE %",
    "Availability %",
    "Performance %",
    "Quality %",
  ];
  const machineRows = (machineWise || []).map((m) => [
    m.machine,
    m.target,
    m.actual,
    m.rejection,
    m.achievement,
    m.oee?.oee ?? "-",
    m.oee?.availability ?? "-",
    m.oee?.performance ?? "-",
    m.oee?.quality ?? "-",
  ]);
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet([machineHeader, ...machineRows]),
    "Machine-wise",
  );

  if (shiftSummary) {
    const shiftHeader = ["Shift", "Target", "Actual", "Achievement %"];
    const shiftRows = ["A", "B"].map((s) => {
      const d = shiftSummary[s];
      const ach = d.target ? ((d.actual / d.target) * 100).toFixed(1) : "0.0";
      return [`Shift ${s}`, d.target, d.actual, ach];
    });
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet([shiftHeader, ...shiftRows]),
      "Shift Summary",
    );
  }

  if (topRejects?.length) {
    const rejHeader = ["Machine", "Reject Qty", "Production", "Reject %"];
    const rejRows = topRejects.map((r) => [
      r.machine,
      r.reject,
      r.production,
      r.production ? ((r.reject / r.production) * 100).toFixed(1) : "0.0",
    ]);
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet([rejHeader, ...rejRows]),
      "Top Rejects",
    );
  }

  const fileName = `Hall-${hallCode}_Dashboard_${filters.from}_to_${filters.to}.xlsx`;
  XLSX.writeFile(wb, fileName);
};
