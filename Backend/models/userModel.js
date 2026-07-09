const db = require("../config/db");

// Columns safe to return to client (password kabhi nahi)
const SAFE_COLUMNS = `
    id, employee_id, name, username, email, mobile, role,
    department, status, permission_level, last_login,
    created_at, updated_at
`;

const Login = {

    getAll: async () => {
        const [rows] = await db.query(
            `SELECT ${SAFE_COLUMNS} FROM users
             WHERE deleted_at IS NULL
             ORDER BY id DESC`
        );
        return rows;
    },

    getById: async (id) => {
        const [rows] = await db.query(
            `SELECT ${SAFE_COLUMNS} FROM users
             WHERE id = ? AND deleted_at IS NULL`,
            [id]
        );
        return rows[0];
    },

    getByEmployeeId: async (employeeId) => {
        const [rows] = await db.query(
            `SELECT ${SAFE_COLUMNS} FROM users
             WHERE employee_id = ? AND deleted_at IS NULL`,
            [employeeId]
        );
        return rows[0];
    },

    // Sirf login/auth ke liye — isme password bhi aata hai, isko controller mein kabhi client ko mat bhejna
    getByUsernameForAuth: async (username) => {
        const [rows] = await db.query(
            `SELECT id, employee_id, name, username, role, status, permission_level, password
             FROM users
             WHERE username = ? AND deleted_at IS NULL`,
            [username]
        );
        return rows[0];
    },

    create: async (user) => {

        const sql = `
        INSERT INTO users
        (
            employee_id,
            name,
            username,
            email,
            mobile,
            role,
            department,
            status,
            password
        )
        VALUES (?,?,?,?,?,?,?,?,?)
        `;

        // permission_level jaan-bujhkar nahi bheja - DB trigger role ke basis pe khud set karega
        const [result] = await db.query(sql, [
            user.employee_id,
            user.name,
            user.username,
            user.email || null,
            user.mobile || null,
            user.role || "Operator",
            user.department || null,
            user.status || "Active",
            user.password // already hashed hona chahiye (controller/service layer mein bcrypt se)
        ]);

        return result;
    },

    update: async (id, user) => {

        const sql = `
        UPDATE users
        SET
            employee_id = COALESCE(?, employee_id),
            name = COALESCE(?, name),
            username = COALESCE(?, username),
            email = COALESCE(?, email),
            mobile = COALESCE(?, mobile),
            role = COALESCE(?, role),
            department = COALESCE(?, department),
            status = COALESCE(?, status)
        WHERE id = ? AND deleted_at IS NULL
        `;

        // permission_level yahan bhi nahi - role change hone pe trigger apne aap update karega
        const [result] = await db.query(sql, [
            user.employee_id || null,
            user.name || null,
            user.username || null,
            user.email || null,
            user.mobile || null,
            user.role || null,
            user.department || null,
            user.status || null,
            id
        ]);

        return result;
    },

    updatePassword: async (id, hashedPassword) => {
        const [result] = await db.query(
            "UPDATE users SET password = ? WHERE id = ? AND deleted_at IS NULL",
            [hashedPassword, id]
        );
        return result;
    },

    updateLastLogin: async (id) => {
        const [result] = await db.query(
            "UPDATE users SET last_login = NOW() WHERE id = ?",
            [id]
        );
        return result;
    },

    // Soft delete - record delete nahi hota, sirf deleted_at set hota hai
    delete: async (id) => {
        const [result] = await db.query(
            "UPDATE users SET deleted_at = NOW(), status = 'Inactive' WHERE id = ? AND deleted_at IS NULL",
            [id]
        );
        return result;
    },

    // Agar kabhi permanently delete karna ho (admin-only action)
    hardDelete: async (id) => {
        const [result] = await db.query(
            "DELETE FROM users WHERE id = ?",
            [id]
        );
        return result;
    }

};

module.exports = Login;