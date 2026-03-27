const pool = require('../config/db');

exports.getAllComplaints = async (req, res) => {
    try {
        connection = await pool.getConnection();

        const [rows] = await connection.execute(`
      SELECT 
        r.id,
        r.reason,
        r.status,
        r.created_at,
        u.full_name AS reporter_name,
        l.name AS listing_name
      FROM listing_reports r
      JOIN users u ON r.reporter_id = u.id
      JOIN listings l ON r.listing_id = l.id
      ORDER BY r.created_at DESC
    `);

        res.json(rows);
    } catch (error) {
        console.error('❌ Lỗi khi lấy danh sách khiếu nại:', error);
        res.status(500).json({ message: 'Lỗi máy chủ khi lấy khiếu nại.' });
    } finally {
        if (connection) connection.release();
    }
};

exports.updateComplaintStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        connection = await pool.getConnection();

        const [result] = await connection.execute(
            'UPDATE listing_reports SET status = ? WHERE id = ?',
            [status, id]
        );

        await connection.release();

        if (result.affectedRows === 0)
            return res.status(404).json({ message: 'Không tìm thấy khiếu nại.' });

        res.json({ success: true, message: 'Cập nhật trạng thái thành công.' });
    } catch (error) {
        console.error('❌ Lỗi khi cập nhật khiếu nại:', error);
        res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật khiếu nại.' });
    } finally {
        if (connection) connection.release();
    }
};
