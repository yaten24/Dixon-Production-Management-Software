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

  // Search by BOTH part_name and part_number — already covers this,
  // kept as-is (verify: increased LIMIT slightly for busier lookups)
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

  // Called from productionEntryController whenever a production entry (or
  // mould-change new part) is saved with an actual_cycle_time — keeps the
  // parts table's actual_cycle_time in sync with what's actually being
  // observed on the floor, without touching any other column.
  //
  // FIX: this now REQUIRES the caller's active transaction `connection` as
  // the first argument, instead of running on a fresh connection pulled
  // from the pool via `db.execute`.
  //
  // Why: production_entries.part_id (and mould_change_entries old/new
  // part ids) reference parts.id via foreign key. While the caller's
  // transaction is open (row not yet committed), InnoDB holds a lock on
  // that parts row for the duration of the transaction. Running this
  // UPDATE on a *separate* pooled connection meant that second connection
  // had to wait for a lock held by the first — which itself was paused
  // awaiting this call to finish before it could commit and release the
  // lock. That's a self-deadlock, and it surfaces as exactly the error
  // seen: "Lock wait timeout exceeded; try restarting transaction".
  // Running it on the SAME connection/transaction avoids the conflict
  // entirely and also means it correctly rolls back if the transaction
  // rolls back.
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
};

module.exports = Part;