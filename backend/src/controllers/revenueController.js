const pool = require('../config/db');

const NORMAL_PRICE = 1000000;
const HOT_PRICE = 1300000;

exports.getRevenues = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();

        const [rows] = await connection.execute(`
            SELECT 
                r.id,
                r.amount,
                r.is_hot,
                r.created_at,
                l.name AS listing_name,
                u.full_name AS owner_name
            FROM revenues r
            JOIN listings l ON r.listing_id = l.id
            JOIN users u ON r.user_id = u.id
            ORDER BY r.created_at DESC
        `);

        res.json(rows);
    } catch (error) {
        console.error('❌ Lỗi khi lấy doanh thu:', error);
        res.status(500).json({ message: 'Lỗi máy chủ khi lấy doanh thu.' });
    } finally {
        if (connection) connection.release();
    }
};

exports.addOrUpdateRevenue = async (listingId, userId, isHot = 0) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const amount = isHot ? HOT_PRICE : NORMAL_PRICE;

        const [existing] = await connection.execute(
            'SELECT id FROM revenues WHERE listing_id = ?',
            [listingId]
        );

        if (existing.length > 0) {
            await connection.execute(
                `UPDATE revenues 
                 SET amount = ?, is_hot = ?, updated_at = NOW()
                 WHERE listing_id = ?`,
                [amount, isHot, listingId]
            );
            console.log(`🔄 Cập nhật doanh thu cho bài #${listingId}: ${amount}₫`);
        } else {
            await connection.execute(
                `INSERT INTO revenues (listing_id, user_id, amount, is_hot)
                 VALUES (?, ?, ?, ?)`,
                [listingId, userId, amount, isHot]
            );
            console.log(`💰 Ghi nhận doanh thu mới: ${amount}₫ cho bài #${listingId}`);
        }
    } catch (error) {
        console.error('❌ Lỗi khi thêm/cập nhật doanh thu:', error);
    } finally {
        if (connection) connection.release();
    }
};
