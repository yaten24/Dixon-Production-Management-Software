const db = require("../config/db");

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

  async findAll() {
    const [rows] = await db.execute("SELECT * FROM parts ORDER BY id DESC");

    return rows;
  },

  async searchParts(keyword) {
  const [rows] = await db.query(
    `SELECT
        id,
        part_name,
        part_number,
        product_category,
        customer,
        standard_cycle_time,
        actual_cycle_time
     FROM parts
     WHERE part_name LIKE ?
     ORDER BY part_name
     LIMIT 10`,
    [`%${keyword}%`]
  );

  return rows;
},

  async findById(id) {
    const [rows] = await db.execute(
      "SELECT * FROM parts WHERE id=?",

      [id],
    );

    return rows[0];
  },

  async findByPartNumber(partNumber) {
    const [rows] = await db.execute(
      "SELECT * FROM parts WHERE part_number=?",

      [partNumber],
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

  async delete(id) {
    const [result] = await db.execute(
      "DELETE FROM parts WHERE id=?",

      [id],
    );

    return result;
  },
};

module.exports = Part;
