const pool = require('../config/db');

exports.getDashboardReport = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();

        const [revRows] = await connection.execute(
            'SELECT IFNULL(SUM(amount),0) AS totalRevenue FROM revenues'
        );
        const totalRevenue = Number(revRows[0].totalRevenue || 0);

        const [listingRows] = await connection.execute(
            'SELECT COUNT(*) AS totalListings FROM listings'
        );
        const totalListings = Number(listingRows[0].totalListings || 0);

        const [complaintRows] = await connection.execute(
            'SELECT COUNT(*) AS totalComplaints FROM listing_reports'
        );
        const totalComplaints = Number(complaintRows[0].totalComplaints || 0);

        const [userRows] = await connection.execute(
            'SELECT COUNT(*) AS newUsers30d FROM users WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)'
        );
        const newUsers30d = Number(userRows[0].newUsers30d || 0);

        const [typeRows] = await connection.execute(`
            SELECT lt.id, lt.name, COUNT(l.id) AS count
            FROM listing_types lt
            LEFT JOIN listings l ON l.listing_type_id = lt.id
            GROUP BY lt.id, lt.name
            ORDER BY lt.id
        `);

        res.json({
            totalRevenue,
            totalListings,
            totalComplaints,
            newUsers30d,
            listingTypes: typeRows.map(r => ({
                id: r.id,
                name: r.name,
                count: Number(r.count || 0),
            })),
        });
    } catch (err) {
        console.error('❌ Lỗi getDashboardReport:', err);
        res.status(500).json({ message: 'Lỗi máy chủ khi lấy báo cáo.' });
    } finally {
        if (connection) connection.release();
    }
};
