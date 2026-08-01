// src/utils/exportProductionReport.js

function num(v) {
  return Number(v || 0);
}

function pct(numerator, denominator) {
  const n = num(numerator);
  const d = num(denominator);
  if (!d) return 0;
  return (n / d) * 100;
}

function statusFor(achievement) {
  if (achievement >= 95) return "On Target";
  if (achievement >= 85) return "Slightly Low";
  return "Low";
}

function escapeCsv(val) {
  const s = String(val ?? "");
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/**
 * Exports the currently filtered part-production data as a CSV file.
 * rows: array of part rows (same shape as returned by the dashboard API)
 * totals: the summary object (target_qty, actual_qty, good_qty, reject_qty, ...)
 */
export function exportProductionReportCSV({ periodLabel, category, customer, rows, totals }) {
  const lines = [];

  lines.push("Part Production Report");
  lines.push(`Period,${escapeCsv(periodLabel)}`);
  lines.push(`Category,${escapeCsv(category || "All")}`);
  lines.push(`Customer,${escapeCsv(customer || "All")}`);
  lines.push(`Generated,${escapeCsv(new Date().toLocaleString())}`);
  lines.push("");

  const headers = [
    "Part No.", "Part Name", "Category", "Customer",
    "Target", "Produced", "Good", "Reject",
    "Reject %", "Achv %", "Yield %", "Status",
  ];
  lines.push(headers.join(","));

  rows.forEach((row) => {
    const rejectPct = pct(row.reject_qty, row.actual_qty);
    const achievement = pct(row.actual_qty, row.target_qty);
    const yieldPct = pct(row.good_qty, row.actual_qty);
    const status = statusFor(achievement);

    lines.push(
      [
        row.part_number,
        row.part_name,
        row.product_category,
        row.customer,
        num(row.target_qty),
        num(row.actual_qty),
        num(row.good_qty),
        num(row.reject_qty),
        rejectPct.toFixed(2),
        achievement.toFixed(2),
        yieldPct.toFixed(2),
        status,
      ]
        .map(escapeCsv)
        .join(",")
    );
  });

  // Totals row
  const totalRejectPct = pct(totals.reject_qty, totals.actual_qty);
  const totalAchievement = pct(totals.actual_qty, totals.target_qty);
  const totalYieldPct = pct(totals.good_qty, totals.actual_qty);

  lines.push(
    [
      "Total", "", "", "",
      num(totals.target_qty),
      num(totals.actual_qty),
      num(totals.good_qty),
      num(totals.reject_qty),
      totalRejectPct.toFixed(2),
      totalAchievement.toFixed(2),
      totalYieldPct.toFixed(2),
      "",
    ]
      .map(escapeCsv)
      .join(",")
  );

  // BOM prefix so Excel opens UTF-8 CSVs correctly
  const csvContent = "\uFEFF" + lines.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const safePeriod = (periodLabel || "report").replace(/[^a-z0-9]+/gi, "-");
  const fileName = `part-production-report_${safePeriod}.csv`;

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}