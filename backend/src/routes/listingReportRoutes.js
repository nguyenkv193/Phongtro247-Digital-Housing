const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { listingId, reason, description } = req.body;

        const [listing] = await db.query('SELECT id FROM listings WHERE id = ?', [listingId]);

        if (listing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Tin đăng không tồn tại',
            });
        }

        const [existing] = await db.query(
            'SELECT id FROM listing_reports WHERE reporter_id = ? AND listing_id = ? AND status = "pending"',
            [userId, listingId]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Bạn đã báo cáo tin đăng này rồi',
            });
        }

        await db.query(
            'INSERT INTO listing_reports (listing_id, reporter_id, reason) VALUES (?, ?, ?)',
            [listingId, userId, `${reason}${description ? ': ' + description : ''}`]
        );

        res.json({
            success: true,
            message: 'Báo cáo đã được gửi thành công',
        });
    } catch (error) {
        console.error('Error creating report:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi tạo báo cáo',
        });
    }
});

router.get('/my-reports', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const [reports] = await db.query(
            `SELECT 
                lr.id,
                lr.reason,
                lr.status,
                lr.created_at,
                l.name as listing_name,
                l.id as listing_id
            FROM listing_reports lr
            LEFT JOIN listings l ON lr.listing_id = l.id
            WHERE lr.reporter_id = ?
            ORDER BY lr.created_at DESC`,
            [userId]
        );

        res.json({
            success: true,
            data: reports,
        });
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
        });
    }
});

module.exports = router;
