const bcrypt = require("bcrypt");
const pool = require("../config/db"); // mysql2/promise pool

const SALT_ROUNDS = 10;

// GET /api/users
const getAllUsers = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT id, employee_id, name, username, email, mobile, role,
                    department, status, permission_level, last_login,
                    created_at, updated_at
             FROM users
             WHERE deleted_at IS NULL
             ORDER BY created_at DESC`
        );
        res.status(200).json({ success: true, count: rows.length, data: rows });
    } catch (err) {
        console.error("getAllUsers error:", err);
        res.status(500).json({ success: false, message: "Failed to fetch users" });
    }
};

// GET /api/users/:id
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query(
            `SELECT id, employee_id, name, username, email, mobile, role,
                    department, status, permission_level, last_login,
                    created_at, updated_at
             FROM users
             WHERE id = ? AND deleted_at IS NULL`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, data: rows[0] });
    } catch (err) {
        console.error("getUserById error:", err);
        res.status(500).json({ success: false, message: "Failed to fetch user" });
    }
};

// POST /api/users
const createUser = async (req, res) => {
    try {
        const {
            employee_id,
            name,
            username,
            email,
            mobile,
            role,
            department,
            status,
            password
        } = req.body;

        if (!employee_id || !name || !username || !password) {
            return res.status(400).json({
                success: false,
                message: "employee_id, name, username and password are required"
            });
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const [result] = await pool.query(
            `INSERT INTO users
                (employee_id, name, username, email, mobile, role, department, status, password)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                employee_id,
                name,
                username,
                email || null,
                mobile || null,
                role || "Operator",
                department || null,
                status || "Active",
                hashedPassword
            ]
        );

        const [newUser] = await pool.query(
            `SELECT id, employee_id, name, username, email, mobile, role,
                    department, status, permission_level, created_at
             FROM users WHERE id = ?`,
            [result.insertId]
        );

        res.status(201).json({ success: true, data: newUser[0] });
    } catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ success: false, message: "employee_id, username or email already exists" });
        }
        console.error("createUser error:", err);
        res.status(500).json({ success: false, message: "Failed to create user" });
    }
};

// PUT /api/users/:id
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            username,
            email,
            mobile,
            role,
            department,
            status,
            password
        } = req.body;

        const [existing] = await pool.query(
            `SELECT id FROM users WHERE id = ? AND deleted_at IS NULL`,
            [id]
        );
        if (existing.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        let hashedPassword = null;
        if (password) {
            hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        }

        await pool.query(
            `UPDATE users SET
                name = COALESCE(?, name),
                username = COALESCE(?, username),
                email = COALESCE(?, email),
                mobile = COALESCE(?, mobile),
                role = COALESCE(?, role),
                department = COALESCE(?, department),
                status = COALESCE(?, status),
                password = COALESCE(?, password)
             WHERE id = ?`,
            [
                name || null,
                username || null,
                email || null,
                mobile || null,
                role || null,
                department || null,
                status || null,
                hashedPassword,
                id
            ]
        );

        const [updatedUser] = await pool.query(
            `SELECT id, employee_id, name, username, email, mobile, role,
                    department, status, permission_level, updated_at
             FROM users WHERE id = ?`,
            [id]
        );

        res.status(200).json({ success: true, data: updatedUser[0] });
    } catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ success: false, message: "username or email already exists" });
        }
        console.error("updateUser error:", err);
        res.status(500).json({ success: false, message: "Failed to update user" });
    }
};

// DELETE /api/users/:id  (soft delete)
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const [existing] = await pool.query(
            `SELECT id FROM users WHERE id = ? AND deleted_at IS NULL`,
            [id]
        );
        if (existing.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        await pool.query(
            `UPDATE users SET deleted_at = NOW(), status = 'Inactive' WHERE id = ?`,
            [id]
        );

        res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (err) {
        console.error("deleteUser error:", err);
        res.status(500).json({ success: false, message: "Failed to delete user" });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};