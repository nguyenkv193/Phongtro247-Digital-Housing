const db = require('../config/db');

const VIDEO_FEE = 500000;

const requestVideo = async (req, res) => {
    try {
        const userId = req.user.id;
        const { listing_id, note } = req.body;

        const [listing] = await db.query(
            'SELECT user_id, name, status FROM listings WHERE id = ?',
            [listing_id]
        );

        if (listing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tin đăng',
            });
        }

        if (listing[0].user_id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền yêu cầu đăng video cho tin đăng này',
            });
        }

        if (listing[0].status !== 'published') {
            return res.status(400).json({
                success: false,
                message: 'Chỉ có thể yêu cầu đăng video cho tin đăng đã được duyệt',
            });
        }

        const [existingRequest] = await db.query(
            'SELECT id FROM video_requests WHERE listing_id = ? AND status = "pending"',
            [listing_id]
        );

        if (existingRequest.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Đã có yêu cầu đăng video đang chờ xử lý cho tin đăng này',
            });
        }

        const [result] = await db.query(
            'INSERT INTO video_requests (listing_id, user_id, note, created_at) VALUES (?, ?, ?, NOW())',
            [listing_id, userId, note || '']
        );

        console.log('Insert result:', result);
        console.log('New request ID:', result.insertId);

        res.json({
            success: true,
            message: 'Gửi yêu cầu đăng video thành công! Admin sẽ xử lý trong thời gian sớm nhất.',
        });
    } catch (error) {
        console.error('Error requesting video:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi gửi yêu cầu đăng video',
        });
    }
};

const getMyVideoRequests = async (req, res) => {
    try {
        const userId = req.user.id;

        const [requests] = await db.query(
            `SELECT 
                vr.id,
                vr.listing_id,
                vr.note,
                vr.status,
                vr.admin_note,
                vr.created_at,
                vr.processed_at,
                l.name as listing_name,
                l.has_video,
                l.video_url
            FROM video_requests vr
            LEFT JOIN listings l ON vr.listing_id = l.id
            WHERE vr.user_id = ?
            ORDER BY vr.created_at DESC`,
            [userId]
        );

        res.json({
            success: true,
            data: requests,
        });
    } catch (error) {
        console.error('Error fetching video requests:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách yêu cầu',
        });
    }
};

const getAllVideoRequests = async (req, res) => {
    try {
        console.log('=== GET ALL REQUESTS (VIDEO + HOT) ===');
        const { status } = req.query;

        let videoQuery = `
            SELECT 
                vr.id,
                vr.listing_id,
                vr.user_id,
                vr.note,
                vr.status,
                vr.admin_note,
                vr.created_at,
                vr.processed_at,
                'video' as request_type,
                NULL as duration_days,
                500000 as fee,
                NULL as hot_until,
                l.name as listing_name,
                l.has_video,
                l.video_url,
                u.full_name as user_name,
                u.phone as user_phone,
                u.balance as user_balance
            FROM video_requests vr
            LEFT JOIN listings l ON vr.listing_id = l.id
            LEFT JOIN users u ON vr.user_id = u.id
        `;

        let hotQuery = `
            SELECT 
                hr.id,
                hr.listing_id,
                hr.user_id,
                NULL as note,
                hr.status,
                hr.admin_note,
                hr.created_at,
                hr.processed_at,
                'hot' as request_type,
                hr.duration_days,
                hr.fee,
                hr.hot_until,
                l.name as listing_name,
                l.has_video,
                NULL as video_url,
                u.full_name as user_name,
                u.phone as user_phone,
                u.balance as user_balance
            FROM hot_listing_requests hr
            LEFT JOIN listings l ON hr.listing_id = l.id
            LEFT JOIN users u ON hr.user_id = u.id
        `;

        const params = [];
        if (status && status !== 'all') {
            videoQuery += ' WHERE vr.status = ?';
            hotQuery += ' WHERE hr.status = ?';
            params.push(status);
        }

        const unionQuery = `
            (${videoQuery})
            UNION ALL
            (${hotQuery})
            ORDER BY created_at DESC
        `;

        const [requests] = await db.query(
            unionQuery,
            status && status !== 'all' ? [status, status] : []
        );

        console.log('Found requests:', requests.length);
        console.log('Video requests:', requests.filter(r => r.request_type === 'video').length);
        console.log('Hot requests:', requests.filter(r => r.request_type === 'hot').length);

        res.json({
            success: true,
            data: requests,
            totalCount: requests.length,
        });
    } catch (error) {
        console.error('=== ERROR in getAllVideoRequests ===');
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách yêu cầu',
            error: error.message,
        });
    }
};

const approveVideoRequest = async (req, res) => {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        const { id } = req.params;
        const { video_url, admin_note } = req.body;

        if (!video_url) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp link video',
            });
        }

        const [request] = await connection.query(
            'SELECT listing_id, user_id, status FROM video_requests WHERE id = ?',
            [id]
        );

        if (request.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy yêu cầu',
            });
        }

        if (request[0].status !== 'pending') {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'Yêu cầu này đã được xử lý',
            });
        }

        const listingId = request[0].listing_id;
        const userId = request[0].user_id;

        const [user] = await connection.query('SELECT balance FROM users WHERE id = ?', [userId]);

        if (user.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thông tin người dùng',
            });
        }

        const currentBalance = user[0].balance || 0;

        if (currentBalance < VIDEO_FEE) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: `Người dùng không đủ số dư để thanh toán phí video (${new Intl.NumberFormat(
                    'vi-VN',
                    {
                        style: 'currency',
                        currency: 'VND',
                    }
                ).format(VIDEO_FEE)})`,
            });
        }

        await connection.query('UPDATE users SET balance = balance - ? WHERE id = ?', [
            VIDEO_FEE,
            userId,
        ]);

        await connection.query(
            'INSERT INTO transactions (user_id, type, amount, description, created_at) VALUES (?, ?, ?, ?, NOW())',
            [userId, 'payment', VIDEO_FEE, `Thanh toán phí đăng video cho tin #${listingId}`]
        );

        await connection.query(
            'INSERT INTO revenues (listing_id, user_id, amount, is_hot, created_at) VALUES (?, ?, ?, 0, NOW())',
            [listingId, userId, VIDEO_FEE]
        );

        await connection.query('UPDATE listings SET has_video = TRUE, video_url = ? WHERE id = ?', [
            video_url,
            listingId,
        ]);

        await connection.query(
            'UPDATE video_requests SET status = "approved", admin_note = ?, processed_at = NOW() WHERE id = ?',
            [admin_note || 'Đã duyệt và đăng video', id]
        );

        await connection.commit();

        res.json({
            success: true,
            message: 'Duyệt yêu cầu và đăng video thành công!',
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error approving video request:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi duyệt yêu cầu',
        });
    } finally {
        connection.release();
    }
};

const rejectVideoRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { admin_note } = req.body;

        const [request] = await db.query('SELECT status FROM video_requests WHERE id = ?', [id]);

        if (request.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy yêu cầu',
            });
        }

        if (request[0].status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Yêu cầu này đã được xử lý',
            });
        }

        await db.query(
            'UPDATE video_requests SET status = "rejected", admin_note = ?, processed_at = NOW() WHERE id = ?',
            [admin_note || 'Từ chối yêu cầu', id]
        );

        res.json({
            success: true,
            message: 'Đã từ chối yêu cầu',
        });
    } catch (error) {
        console.error('Error rejecting video request:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi từ chối yêu cầu',
        });
    }
};

const removeVideo = async (req, res) => {
    try {
        const { listing_id } = req.params;

        await db.query('UPDATE listings SET has_video = FALSE, video_url = NULL WHERE id = ?', [
            listing_id,
        ]);

        res.json({
            success: true,
            message: 'Đã xóa video khỏi tin đăng',
        });
    } catch (error) {
        console.error('Error removing video:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa video',
        });
    }
};

module.exports = {
    requestVideo,
    getMyVideoRequests,
    getAllVideoRequests,
    approveVideoRequest,
    rejectVideoRequest,
    removeVideo,
    VIDEO_FEE,
};
