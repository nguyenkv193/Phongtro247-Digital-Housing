const db = require('../config/db');

exports.getReports = async (req, res) => {
    try {
        const userId = req.user.id;
        const { days = 30 } = req.query;

        const [totalRooms] = await db.query(
            'SELECT COUNT(*) as total FROM listings WHERE user_id = ? AND status = "published"',
            [userId]
        );

        const [rentedRooms] = await db.query(
            `SELECT COUNT(DISTINCT c.listing_id) as total 
            FROM contracts c 
            WHERE c.owner_id = ? 
            AND c.status = 'Đang hiệu lực' 
            AND c.end_date >= CURDATE()`,
            [userId]
        );

        const emptyRooms = totalRooms[0].total - rentedRooms[0].total;

        const [totalTenants] = await db.query(
            `SELECT COUNT(DISTINCT c.tenant_id) as total 
            FROM contracts c 
            WHERE c.owner_id = ? 
            AND c.status = 'Đang hiệu lực' 
            AND c.end_date >= CURDATE()`,
            [userId]
        );

        const [expiringContracts] = await db.query(
            `SELECT COUNT(*) as total 
            FROM contracts 
            WHERE owner_id = ? 
            AND end_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
            AND status != 'Đã kết thúc'`,
            [userId]
        );

        const [totalIncome] = await db.query(
            `SELECT COALESCE(SUM(rent_price), 0) as total 
            FROM contracts 
            WHERE owner_id = ? 
            AND start_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)`,
            [userId, days]
        );

        const [totalExpense] = await db.query(
            `SELECT COALESCE(SUM(amount), 0) as total 
            FROM transactions 
            WHERE user_id = ? 
            AND type = 'payment' 
            AND created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)`,
            [userId, days]
        );

        const profit = totalIncome[0].total - totalExpense[0].total;

        res.json({
            success: true,
            data: {
                rooms: {
                    total: totalRooms[0].total,
                    rented: rentedRooms[0].total,
                    empty: emptyRooms,
                },
                tenants: {
                    total: totalTenants[0].total,
                },
                contracts: {
                    expiring: expiringContracts[0].total,
                },
                finance: {
                    totalIncome: parseFloat(totalIncome[0].total),
                    totalExpense: parseFloat(totalExpense[0].total),
                    profit: profit,
                },
            },
        });
    } catch (err) {
        console.error('❌ Lỗi getReports:', err);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy báo cáo',
        });
    }
};
