const pool = require('../config/db');
const { addOrUpdateRevenue } = require('./revenueController');

exports.getAllListings = async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT 
                l.id,
                l.name,
                l.status,
                l.is_hot,
                l.room_count,
                l.address,
                lt.name AS listing_type_name,
                u.full_name AS owner_name
            FROM listings l
            JOIN listing_types lt ON l.listing_type_id = lt.id
            JOIN users u ON l.user_id = u.id
            ORDER BY l.id DESC
        `);

        res.json(rows);
    } catch (error) {
        console.error('❌ Lỗi khi lấy danh sách tin:', error);
        res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh sách tin.' });
    }
};

exports.updateHotLabel = async (req, res) => {
    const { id } = req.params;
    const { is_hot } = req.body;

    try {
        const [listingRows] = await pool.execute('SELECT user_id FROM listings WHERE id = ?', [id]);

        if (listingRows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy tin đăng.' });
        }

        const userId = listingRows[0].user_id;

        const [result] = await pool.execute('UPDATE listings SET is_hot = ? WHERE id = ?', [
            is_hot,
            id,
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Không tìm thấy tin đăng.' });
        }

        await addOrUpdateRevenue(id, userId, is_hot);

        res.json({
            success: true,
            message: 'Cập nhật nhãn & doanh thu thành công.',
        });
    } catch (error) {
        console.error('❌ Lỗi khi cập nhật nhãn:', error);
        res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật nhãn.' });
    }
};

exports.updateStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const [currentRows] = await pool.execute(
            'SELECT status, user_id, is_hot FROM listings WHERE id = ?',
            [id]
        );

        if (currentRows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy tin đăng.' });
        }

        const currentStatus = currentRows[0].status;
        const userId = currentRows[0].user_id;
        const isHot = currentRows[0].is_hot;

        if (currentStatus !== status) {
            await pool.execute('UPDATE listings SET status = ? WHERE id = ?', [status, id]);

            if (status === 'published') {
                await addOrUpdateRevenue(id, userId, isHot);
            }
        }

        res.json({
            success: true,
            message: 'Cập nhật trạng thái & doanh thu thành công.',
        });
    } catch (error) {
        console.error('❌ Lỗi khi cập nhật trạng thái:', error);
        res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật trạng thái.' });
    }
};
