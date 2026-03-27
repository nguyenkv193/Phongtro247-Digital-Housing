const pool = require('../config/db');

exports.getAllUsers = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();

        const [rows] = await connection.execute(
            'SELECT id, full_name, email, role, has_completed_host_info, verified, is_blocked FROM users ORDER BY id DESC'
        );

        res.json(rows);
    } catch (error) {
        console.error('❌ Lỗi khi lấy danh sách người dùng:', error);
        res.status(500).json({ message: 'Lỗi server khi lấy danh sách người dùng!' });
    } finally {
        if (connection) connection.release();
    }
};

exports.blockUser = async (req, res) => {
    const userId = req.params.id;
    let connection;

    try {
        connection = await pool.getConnection();

        await connection.execute('UPDATE users SET is_blocked = 1 WHERE id = ?', [userId]);

        res.json({ message: 'Khóa tài khoản thành công!' });
    } catch (error) {
        console.error('❌ Lỗi khi khóa tài khoản:', error);
        res.status(500).json({ message: 'Lỗi server khi khóa tài khoản!' });
    } finally {
        if (connection) connection.release();
    }
};

exports.toggleBlockUser = async (req, res) => {
    const userId = req.params.id;
    let connection;

    try {
        connection = await pool.getConnection();

        const [rows] = await connection.execute('SELECT is_blocked FROM users WHERE id = ?', [
            userId,
        ]);

        if (!rows.length) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }

        const newStatus = rows[0].is_blocked ? 0 : 1;

        await connection.execute('UPDATE users SET is_blocked = ? WHERE id = ?', [
            newStatus,
            userId,
        ]);

        res.json({
            message: newStatus ? 'Khóa tài khoản thành công!' : 'Mở khóa tài khoản thành công!',
            is_blocked: newStatus,
        });
    } catch (error) {
        console.error('❌ Lỗi khi thay đổi trạng thái tài khoản:', error);
        res.status(500).json({ message: 'Lỗi server khi thay đổi trạng thái tài khoản!' });
    } finally {
        if (connection) connection.release();
    }
};
