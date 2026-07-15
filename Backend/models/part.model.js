const db = require("../config/db");

// Shared WHERE-clause builder used by both findAll() and count() so
// filtering logic stays in one place and stays in sync between the two.
function buildWhereClause({ search, category, customer, source, status } = {}) {
  const conditions = [];
  const params = [];

  if (search) {
    conditions.push("(part_number LIKE ? OR part_name LIKE ?)");
    params.push(`%${search}%`, `%${search}%`);
  }
  if (category && category !== "All") {
    conditions.push("product_category = ?");
    params.push(category);
  }
  if (customer && customer !== "All") {
    conditions.push("customer = ?");
    params.push(customer);
  }
  if (source && source !== "All") {
    conditions.push("source = ?");
    params.push(source);
  }
  if (status && status !== "All") {
    conditions.push("status = ?");
    params.push(status);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  return { whereClause, params };
}

const Part = {
  async create(data) {
    const sql = `
        INSERT INTO parts
        (
            part_number,
            part_name,
            product_category,
            source,
            customer,
            standard_cycle_time,
            actual_cycle_time,
            status
        )
        VALUES (?,?,?,?,?,?,?,?)
        `;

    const [result] = await db.execute(sql, [
      data.part_number,
      data.part_name,
      data.product_category,
      data.source,
      data.customer,
      data.standard_cycle_time,
      data.actual_cycle_time,
      data.status,
    ]);

    return result;
  },

  async findAll({
    limit = 100,
    offset = 0,
    search = "",
    category = "All",
    customer = "All",
    source = "All",
    status = "All",
  } = {}) {
    const safeLimit = Number.isFinite(Number(limit)) ? Number(limit) : 100;
    const safeOffset = Number.isFinite(Number(offset)) ? Number(offset) : 0;

    const { whereClause, params } = buildWhereClause({
      search,
      category,
      customer,
      source,
      status,
    });

    const [rows] = await db.query(
      `SELECT * FROM parts ${whereClause} ORDER BY id DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`,
      params
    );

    return rows;
  },

  async count({
    search = "",
    category = "All",
    customer = "All",
    source = "All",
    status = "All",
  } = {}) {
    const { whereClause, params } = buildWhereClause({
      search,
      category,
      customer,
      source,
      status,
    });

    const [rows] = await db.query(
      `SELECT COUNT(*) AS total FROM parts ${whereClause}`,
      params
    );

    return rows[0].total;
  },

  async getFilterOptions() {
    const [categories] = await db.execute(
      "SELECT DISTINCT product_category FROM parts WHERE product_category IS NOT NULL AND product_category <> '' ORDER BY product_category"
    );
    const [customers] = await db.execute(
      "SELECT DISTINCT customer FROM parts WHERE customer IS NOT NULL AND customer <> '' ORDER BY customer"
    );
    const [sources] = await db.execute(
      "SELECT DISTINCT source FROM parts WHERE source IS NOT NULL AND source <> '' ORDER BY source"
    );

    return {
      categories: categories.map((row) => row.product_category),
      customers: customers.map((row) => row.customer),
      sources: sources.map((row) => row.source),
    };
  },

  // Search by BOTH part_name and part_number
  async searchParts(keyword) {
    const [rows] = await db.query(
      `SELECT
        id,
        part_name,
        part_number,
        product_category,
        customer,
        standard_cycle_time,
        actual_cycle_time,
        status
     FROM parts
     WHERE part_name LIKE ? OR part_number LIKE ?
     ORDER BY part_name
     LIMIT 50`,
      [`%${keyword}%`, `%${keyword}%`]
    );

    return rows;
  },

  async findById(id) {
    const [rows] = await db.execute("SELECT * FROM parts WHERE id=?", [id]);
    return rows[0];
  },

  async findByPartNumber(partNumber) {
    const [rows] = await db.execute(
      "SELECT * FROM parts WHERE part_number=?",
      [partNumber]
    );
    return rows[0];
  },

  async update(id, data) {
    const sql = `
        UPDATE parts
        SET
        part_number=?,
        part_name=?,
        product_category=?,
        source=?,
        customer=?,
        standard_cycle_time=?,
        actual_cycle_time=?,
        status=?
        WHERE id=?
        `;

    const [result] = await db.execute(sql, [
      data.part_number,
      data.part_name,
      data.product_category,
      data.source,
      data.customer,
      data.standard_cycle_time,
      data.actual_cycle_time,
      data.status,
      id,
    ]);

    return result;
  },

  // Called from productionEntryController inside an OPEN TRANSACTION whenever
  // a production entry (or mould-change new part) is saved with an
  // actual_cycle_time — keeps parts.actual_cycle_time in sync with what's
  // observed on the floor.
  //
  // REQUIRES the caller's active transaction `connection` as the first arg
  // (not a fresh pooled connection) — production_entries.part_id references
  // parts.id via FK, so while the caller's transaction is open, InnoDB holds
  // a lock on that parts row. Running this on a separate pooled connection
  // causes a self-deadlock ("Lock wait timeout exceeded").
  async updateActualCycleTime(connection, id, actualCycleTime) {
    if (!id || actualCycleTime === undefined || actualCycleTime === null) {
      return null;
    }
    const ct = Number(actualCycleTime);
    if (!Number.isFinite(ct) || ct <= 0) return null;

    const [result] = await connection.query(
      "UPDATE parts SET actual_cycle_time = ? WHERE id = ?",
      [ct, id]
    );
    return result;
  },

  async delete(id) {
    const [result] = await db.execute("DELETE FROM parts WHERE id=?", [id]);
    return result;
  },

  // Standalone (non-transactional) update — used by the plain
  // PUT /parts/:id/actual-cycle-time route where there's no open
  // transaction from a production-entry save to piggyback on.
  async updateActualCycleTime1(id, actual_cycle_time) {
    const [result] = await db.query(
      `UPDATE parts SET actual_cycle_time = ? WHERE id = ?`,
      [actual_cycle_time, id]
    );
    if (result.affectedRows === 0) return null;
    const [rows] = await db.query(`SELECT * FROM parts WHERE id = ?`, [id]);
    return rows[0];
  },
};

module.exports = Part;