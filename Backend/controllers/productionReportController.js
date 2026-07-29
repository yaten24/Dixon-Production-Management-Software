const reportsService = require("../services/productionReport");
const { buildWorkbook, pickRowsForType } = require("../services/productionReportExport");

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function parseDailyParams(query) {
  const { date, hall, shift, machine } = query;
  if (!date || !DATE_RE.test(date)) {
    const err = new Error("A valid 'date' (YYYY-MM-DD) query parameter is required");
    err.status = 400;
    throw err;
  }
  return { date, hall: hall || undefined, shift: shift || undefined, machine: machine || undefined };
}

function parseMonthlyParams(query) {
  const month = Number(query.month);
  const year = Number(query.year);
  if (!month || month < 1 || month > 12 || !year) {
    const err = new Error("Valid 'month' (1-12) and 'year' query parameters are required");
    err.status = 400;
    throw err;
  }
  return { month, year, hall: query.hall || undefined };
}

async function getReport(type, query) {
  switch (type) {
    case "daily": return reportsService.getDailyReport(parseDailyParams(query));
    case "daily-summary": return reportsService.getDailySummary(parseDailyParams(query));
    case "monthly": return reportsService.getMonthlyReport(parseMonthlyParams(query));
    case "monthly-summary": return reportsService.getMonthlySummary(parseMonthlyParams(query));
    default: {
      const err = new Error(`Unknown report type '${type}'`);
      err.status = 404;
      throw err;
    }
  }
}

// GET /api/reports/:type
async function show(req, res, next) {
  try {
    const data = await getReport(req.params.type, req.query);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// GET /api/reports/filters
async function filters(_req, res, next) {
  try {
    res.json(await reportsService.getFilters());
  } catch (err) {
    next(err);
  }
}

// GET /api/reports/:type/export — streams an .xlsx download of the
// same data the report view shows
async function exportXlsx(req, res, next) {
  try {
    const type = req.params.type;
    const data = await getReport(type, req.query);
    const rows = pickRowsForType(type, data);
    const workbook = await buildWorkbook(rows, type);

    const filename = `${type}-report-${new Date().toISOString().slice(0, 10)}.xlsx`;
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    next(err);
  }
}

module.exports = { show, filters, exportXlsx };