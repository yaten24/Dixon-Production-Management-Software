const ExcelJS = require("exceljs");

// Flattens whichever array a report type exposes as its "main" table into
// a downloadable worksheet. Column headers are derived from the object
// keys of the first row, title-cased for readability.
async function buildWorkbook(rows, sheetName = "Report") {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);

  if (!rows || !rows.length) {
    sheet.addRow(["No data for the selected filters"]);
    return workbook;
  }

  const keys = Object.keys(rows[0]);
  sheet.columns = keys.map((key) => ({
    header: key.replace(/_/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2").replace(/\b\w/g, (c) => c.toUpperCase()),
    key,
    width: 18,
  }));
  sheet.getRow(1).font = { bold: true };
  rows.forEach((row) => sheet.addRow(row));

  return workbook;
}

// picks the row-array that matches what the frontend's own exportReportToExcel
// call already used per tab, so server-side export mirrors client-side export
function pickRowsForType(type, data) {
  switch (type) {
    case "daily": return data.entries;
    case "daily-summary": return data.machineWise;
    case "monthly": return data.dayWise;
    case "monthly-summary": return data.dailyTrend;
    default: return [];
  }
}

module.exports = { buildWorkbook, pickRowsForType };