const db = require('../config/db');

const getReviewsByListing = async (req, res) => {
    try {
        const { listingId } = req.params;

        const query = `
            SELECT 
                r.id,
                r.rating,
                r.comment,
                r.created_at,
                u.full_name as user_name,
                u.avatar,
                r.user_id 
            FROM reviews r
            LEFT JOIN users u ON r.user_id = u.id
            WHERE r.listing_id = ?
            ORDER BY r.created_at DESC
        `;

        const [reviews] = await db.query(query, [listingId]);

        const avgRating =
            reviews.length > 0
                ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                : 0;

        res.json({
            success: true,
            data: {
                reviews,
                avgRating: parseFloat(avgRating),
                totalReviews: reviews.length,
            },
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách đánh giá',
        });
    }
};

const createReview = async (req, res) => {
    try {
        const userId = req.user.id;
        const { listingId, rating, comment } = req.body;

        if (!listingId || !rating) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp đầy đủ thông tin',
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Đánh giá phải từ 1 đến 5 sao',
            });
        }

        const [listing] = await db.query('SELECT user_id FROM listings WHERE id = ?', [listingId]);

        if (listing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tin đăng này.',
            });
        }

        const ownerId = listing[0].user_id;

        if (ownerId === userId) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không thể đánh giá tin đăng của chính mình.',
            });
        }

        const [existing] = await db.query(
            'SELECT id FROM reviews WHERE listing_id = ? AND user_id = ?',
            [listingId, userId]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Bạn đã đánh giá trọ này rồi',
            });
        }

        await db.query(
            'INSERT INTO reviews (listing_id, user_id, rating, comment, created_at) VALUES (?, ?, ?, ?, NOW())',
            [listingId, userId, rating, comment || '']
        );

        res.status(201).json({
            success: true,
            message: 'Đánh giá thành công',
        });
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tạo đánh giá',
        });
    }
};

const deleteReview = async (req, res) => {
    try {
        const userId = req.user.id;
        const { reviewId } = req.params;

        const [review] = await db.query('SELECT user_id FROM reviews WHERE id = ?', [reviewId]);

        if (review.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đánh giá' });
        }

        const listingOwnerId = await db.query(
            'SELECT l.user_id FROM listings l JOIN reviews r ON l.id = r.listing_id WHERE r.id = ?',
            [reviewId]
        );

        if (review[0].user_id !== userId && listingOwnerId[0][0]?.user_id !== userId) {
            return res
                .status(403)
                .json({ success: false, message: 'Bạn không có quyền xóa đánh giá này' });
        }

        await db.query('DELETE FROM reviews WHERE id = ?', [reviewId]);

        res.json({
            success: true,
            message: 'Xóa đánh giá thành công',
        });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa đánh giá',
        });
    }
};

const getReviewsForMyListings = async (req, res) => {
    const landlordId = req.user.id;

    if (!landlordId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    try {
        const query = `
            SELECT
                r.id,
                r.rating,
                r.comment,
                r.created_at AS date,
                u.full_name AS name,
                l.name AS room
            FROM reviews AS r
            JOIN listings AS l ON r.listing_id = l.id
            JOIN users AS u ON r.user_id = u.id
            WHERE l.user_id = ?
            ORDER BY r.created_at DESC;
        `;

        const [reviews] = await db.execute(query, [landlordId]);

        res.status(200).json({
            success: true,
            data: reviews,
        });
    } catch (error) {
        console.error('Error fetching reviews for landlord:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const getMyReviews = async (req, res) => {
    const userId = req.user.id;

    if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    try {
        const query = `
            SELECT
                r.id,
                r.rating,
                r.comment,
                r.created_at,
                r.listing_id,
                l.name AS listing_name
            FROM reviews AS r
            JOIN listings AS l ON r.listing_id = l.id
            WHERE r.user_id = ?
            ORDER BY r.created_at DESC;
        `;

        const [reviews] = await db.execute(query, [userId]);

        res.status(200).json({
            success: true,
            data: reviews,
        });
    } catch (error) {
        console.error('Error fetching user reviews:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports = {
    getReviewsByListing,
    createReview,
    deleteReview,
    getReviewsForMyListings,
    getMyReviews,
};
