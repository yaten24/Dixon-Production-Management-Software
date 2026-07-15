import * as XLSX from "xlsx";

// Generic exporter — pass an array of flat objects and a filename.
export const exportReportToExcel = (rows, filename = "report") => {
  if (!rows || !rows.length) return;
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};