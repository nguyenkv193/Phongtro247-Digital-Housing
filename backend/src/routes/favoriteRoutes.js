const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const [favorites] = await db.query(
            `SELECT
                f.id as favorite_id,
                f.created_at as favorited_at,
                l.id,
                l.name,
                l.price,
                l.area,
                l.address,
                l.street,
                l.status,
                l.is_hot,
                l.created_at,
                lt.name as listing_type,
                lt.slug as type_slug,
                loc.name as location,
                (SELECT image_url FROM listing_images WHERE listing_id = l.id AND is_main = 1 LIMIT 1) as image,
                u.full_name as landlord_name,
                u.phone as landlord_phone
            FROM favorites f
            LEFT JOIN listings l ON f.listing_id = l.id
            LEFT JOIN listing_types lt ON l.listing_type_id = lt.id
            LEFT JOIN locations loc ON l.location_id = loc.id
            LEFT JOIN users u ON l.user_id = u.id
            WHERE f.user_id = ?
            ORDER BY f.created_at DESC`,
            [userId]
        );

        res.json({
            success: true,
            data: favorites,
            total: favorites.length,
        });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách yêu thích:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy danh sách yêu thích',
        });
    }
});

router.post('/:listingId', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const listingId = req.params.listingId;

        console.log('=== POST FAVORITE ===');
        console.log('userId:', userId);
        console.log('listingId:', listingId);

        const [listing] = await db.query(
            'SELECT id FROM listings WHERE id = ? AND status = "published"',
            [listingId]
        );

        console.log('listing found:', listing);

        if (listing.length === 0) {
            console.log('❌ Listing not found or not published');
            return res.status(404).json({
                success: false,
                message: 'Tin đăng không tồn tại hoặc đã bị xóa',
            });
        }

        const [existing] = await db.query(
            'SELECT id FROM favorites WHERE user_id = ? AND listing_id = ?',
            [userId, listingId]
        );

        console.log('existing favorite:', existing);

        if (existing.length > 0) {
            console.log('⚠️ Already favorited');
            return res.status(400).json({
                success: false,
                message: 'Tin đăng đã có trong danh sách yêu thích',
            });
        }

        const [result] = await db.query(
            'INSERT INTO favorites (user_id, listing_id) VALUES (?, ?)',
            [userId, listingId]
        );

        console.log('✅ Insert result:', result);
        console.log('insertId:', result.insertId);

        res.json({
            success: true,
            message: 'Đã thêm vào danh sách yêu thích',
        });
    } catch (error) {
        console.error('❌ Error adding favorite:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi thêm vào yêu thích',
        });
    }
});

router.delete('/:listingId', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const listingId = req.params.listingId;

        const [result] = await db.query(
            'DELETE FROM favorites WHERE user_id = ? AND listing_id = ?',
            [userId, listingId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tin đăng trong danh sách yêu thích',
            });
        }

        res.json({
            success: true,
            message: 'Đã xóa khỏi danh sách yêu thích',
        });
    } catch (error) {
        console.error('Lỗi khi xóa yêu thích:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi xóa khỏi yêu thích',
        });
    }
});

router.get('/check/:listingId', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const listingId = req.params.listingId;

        const [favorite] = await db.query(
            'SELECT id FROM favorites WHERE user_id = ? AND listing_id = ?',
            [userId, listingId]
        );

        res.json({
            success: true,
            isFavorited: favorite.length > 0,
        });
    } catch (error) {
        console.error('Lỗi khi kiểm tra yêu thích:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
        });
    }
});

router.get('/count', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const [result] = await db.query(
            'SELECT COUNT(*) as count FROM favorites WHERE user_id = ?',
            [userId]
        );

        res.json({
            success: true,
            count: result[0].count,
        });
    } catch (error) {
        console.error('Lỗi khi đếm yêu thích:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
        });
    }
});

module.exports = router;
