// models/productionEntry.model.js
const pool = require("../config/db"); // adjust path if your db pool lives elsewhere

/**
 * Builds a WHERE clause fragment + params for the selected period.
 * periodType: "day" | "month" | "year"
 * periodValue:
 *   day   -> "YYYY-MM-DD"
 *   month -> "YYYY-MM"
 *   year  -> "YYYY"
 */
function buildPeriodFilter(periodType, periodValue) {
  switch (periodType) {
    case "day":
      return { clause: "pe.entry_date = ?", params: [periodValue] };
    case "year":
      return { clause: "YEAR(pe.entry_date) = ?", params: [periodValue] };
    case "month":
    default: {
      const [year, month] = periodValue.split("-");
      return {
        clause: "YEAR(pe.entry_date) = ? AND MONTH(pe.entry_date) = ?",
        params: [year, month],
      };
    }
  }
}

function buildCommonFilters({ periodType, periodValue, category, customer }) {
  const { clause, params } = buildPeriodFilter(periodType, periodValue);
  const where = [clause];
  const queryParams = [...params];

  if (category) {
    where.push("p.product_category = ?");
    queryParams.push(category);
  }
  if (customer) {
    where.push("p.customer = ?");
    queryParams.push(customer);
  }

  return { whereClause: where.join(" AND "), queryParams };
}

// Part-wise production, aggregated across all matching entries for the period
async function getPartWiseProduction(filters) {
  const { whereClause, queryParams } = buildCommonFilters(filters);

  const sql = `
    SELECT
      p.id AS part_id,
      p.part_number,
      p.part_name,
      p.product_category,
      p.customer,
      p.standard_cycle_time,
      COALESCE(SUM(pe.target_qty), 0) AS target_qty,
      COALESCE(SUM(pe.actual_qty), 0) AS actual_qty,
      COALESCE(SUM(pe.good_qty), 0) AS good_qty,
      COALESCE(SUM(pe.reject_qty), 0) AS reject_qty,
      COALESCE(SUM(pe.loss_minutes), 0) AS loss_minutes,
      COALESCE(AVG(pe.actual_cycle_time), 0) AS avg_actual_cycle_time
    FROM production_entries pe
    INNER JOIN parts p ON p.id = pe.part_id
    WHERE ${whereClause}
    GROUP BY p.id, p.part_number, p.part_name, p.product_category, p.customer, p.standard_cycle_time
    ORDER BY p.part_number ASC
  `;

  const [rows] = await pool.query(sql, queryParams);
  return rows;
}

// Overall summary stats for the header stat cards
async function getSummaryStats(filters) {
  const { whereClause, queryParams } = buildCommonFilters(filters);

  const sql = `
    SELECT
      COALESCE(SUM(pe.target_qty), 0) AS target_qty,
      COALESCE(SUM(pe.actual_qty), 0) AS actual_qty,
      COALESCE(SUM(pe.good_qty), 0) AS good_qty,
      COALESCE(SUM(pe.reject_qty), 0) AS reject_qty,
      COALESCE(SUM(pe.loss_minutes), 0) AS loss_minutes,
      COUNT(DISTINCT pe.part_id) AS parts_running,
      COUNT(DISTINCT pe.machine_id) AS machines_running
    FROM production_entries pe
    INNER JOIN parts p ON p.id = pe.part_id
    WHERE ${whereClause}
  `;

  const [rows] = await pool.query(sql, queryParams);
  return rows[0];
}

// Distinct category / customer values, to populate the filter dropdowns
async function getFilterOptions() {
  const [categories] = await pool.query(
    `SELECT DISTINCT product_category FROM parts
     WHERE product_category IS NOT NULL AND product_category <> ''
     ORDER BY product_category ASC`
  );
  const [customers] = await pool.query(
    `SELECT DISTINCT customer FROM parts
     WHERE customer IS NOT NULL AND customer <> ''
     ORDER BY customer ASC`
  );

  return {
    categories: categories.map((c) => c.product_category),
    customers: customers.map((c) => c.customer),
  };
}

module.exports = {
  getPartWiseProduction,
  getSummaryStats,
  getFilterOptions,
};