const db = require("../config/db");

const Machine = {

    // Create Machine
    async create(machine) {

        const sql = `
            INSERT INTO machines
            (machine_code, machine_name, hall, status)
            VALUES (?, ?, ?, ?)
        `;

        const [result] = await db.execute(sql, [
            machine.machine_code,
            machine.machine_name,
            machine.hall,
            machine.status,
        ]);

        return result;
    },

    // Get All Machines
    async getAll() {

        const [rows] = await db.execute(
            "SELECT * FROM machines ORDER BY id DESC"
        );

        return rows;
    },

    // Get Machine By ID
    async getById(id) {

        const [rows] = await db.execute(
            "SELECT * FROM machines WHERE id = ?",
            [id]
        );

        return rows[0];
    },

    // Update Complete Machine
    async update(id, machine) {

        const sql = `
            UPDATE machines
            SET
                machine_code = ?,
                machine_name = ?,
                hall = ?,
                status = ?
            WHERE id = ?
        `;

        const [result] = await db.execute(sql, [
            machine.machine_code,
            machine.machine_name,
            machine.hall,
            machine.status,
            id,
        ]);

        return result;
    },

    // Update Only Status
    async updateStatus(id, status) {

        const sql = `
            UPDATE machines
            SET status = ?
            WHERE id = ?
        `;

        const [result] = await db.execute(sql, [
            status,
            id,
        ]);

        return result;
    },

    // Delete Machine
    async delete(id) {

        const [result] = await db.execute(
            "DELETE FROM machines WHERE id = ?",
            [id]
        );

        return result;
    },

};

module.exports = Machine;