const db = require('../config/db');

const HOT_LISTING_BASE_FEE = 300000;

const createHotRequest = async (req, res) => {
    try {
        const userId = req.user.id;
        const { listing_id, duration_days = 30, note } = req.body;

        console.log('=== REQUEST HOT LISTING ===');
        console.log('User ID:', userId);
        console.log('Listing ID:', listing_id);
        console.log('Duration:', duration_days);

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
                message: 'Bạn không có quyền yêu cầu hot listing cho tin đăng này',
            });
        }

        if (listing[0].status !== 'published') {
            return res.status(400).json({
                success: false,
                message: 'Chỉ có thể yêu cầu hot listing cho tin đăng đã được duyệt',
            });
        }

        const [existingRequest] = await db.query(
            'SELECT id FROM hot_listing_requests WHERE listing_id = ? AND status = "pending"',
            [listing_id]
        );

        if (existingRequest.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Đã có yêu cầu hot listing đang chờ xử lý cho tin đăng này',
            });
        }

        const [currentHot] = await db.query(
            'SELECT hot_until FROM listings WHERE id = ? AND is_hot = 1',
            [listing_id]
        );

        if (currentHot.length > 0 && currentHot[0].hot_until) {
            const daysRemaining =
                (new Date(currentHot[0].hot_until) - new Date()) / (1000 * 60 * 60 * 24);
            if (daysRemaining > 3) {
                return res.status(400).json({
                    success: false,
                    message: `Tin đăng đang HOT đến ${new Date(
                        currentHot[0].hot_until
                    ).toLocaleDateString('vi-VN')}. Chỉ có thể gia hạn khi còn dưới 3 ngày.`,
                });
            }
        }

        const fee = (HOT_LISTING_BASE_FEE / 30) * duration_days;

        const [result] = await db.query(
            `INSERT INTO hot_listing_requests 
            (listing_id, user_id, duration_days, fee, status, created_at) 
            VALUES (?, ?, ?, ?, 'pending', NOW())`,
            [listing_id, userId, duration_days, fee]
        );

        console.log('Insert result:', result);
        console.log('New hot request ID:', result.insertId);

        res.json({
            success: true,
            message: `Gửi yêu cầu hot listing thành công! Phí: ${new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
            }).format(fee)}. Admin sẽ xử lý trong thời gian sớm nhất.`,
            fee: fee,
        });
    } catch (error) {
        console.error('Error requesting hot listing:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi gửi yêu cầu hot listing',
        });
    }
};

const getMyHotRequests = async (req, res) => {
    try {
        const userId = req.user.id;

        const [requests] = await db.query(
            `SELECT 
                hr.*,
                l.name as listing_name,
                l.address as listing_address,
                u.full_name as admin_name
            FROM hot_listing_requests hr
            LEFT JOIN listings l ON hr.listing_id = l.id
            LEFT JOIN users u ON hr.processed_by = u.id
            WHERE hr.user_id = ?
            ORDER BY hr.created_at DESC`,
            [userId]
        );

        res.json({
            success: true,
            data: requests,
        });
    } catch (error) {
        console.error('Error fetching hot requests:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách yêu cầu',
        });
    }
};

const getAllHotRequests = async (req, res) => {
    try {
        const { status } = req.query;

        let query = `
            SELECT 
                hr.*,
                l.name as listing_name,
                l.address as listing_address,
                l.price as listing_price,
                u.full_name as owner_name,
                u.phone as owner_phone,
                u.email as owner_email,
                u.balance as owner_balance,
                admin.full_name as admin_name
            FROM hot_listing_requests hr
            LEFT JOIN listings l ON hr.listing_id = l.id
            LEFT JOIN users u ON hr.user_id = u.id
            LEFT JOIN users admin ON hr.processed_by = admin.id
        `;

        const params = [];
        if (status && status !== 'all') {
            query += ' WHERE hr.status = ?';
            params.push(status);
        }

        query += ' ORDER BY hr.created_at DESC';

        const [requests] = await db.query(query, params);

        res.json({
            success: true,
            data: requests,
            totalCount: requests.length,
        });
    } catch (error) {
        console.error('Error fetching all hot requests:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách yêu cầu',
            error: error.message,
        });
    }
};

const approveHotRequest = async (req, res) => {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        const { id } = req.params;
        const { admin_note } = req.body;
        const admin_id = req.user.id;

        const [request] = await connection.query(
            `SELECT hr.*, u.balance 
             FROM hot_listing_requests hr
             JOIN users u ON hr.user_id = u.id
             WHERE hr.id = ? AND hr.status = 'pending'`,
            [id]
        );

        if (request.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy yêu cầu hoặc đã được xử lý',
            });
        }

        const { listing_id, user_id, duration_days, fee, balance } = request[0];

        console.log('=== APPROVE HOT LISTING DEBUG ===');
        console.log('User balance:', balance, typeof balance);
        console.log('Fee:', fee, typeof fee);
        console.log('Balance >= Fee:', balance >= fee);

        const userBalance = parseFloat(balance);
        const requiredFee = parseFloat(fee);

        if (userBalance < requiredFee) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: `Người dùng không đủ số dư để thanh toán phí hot listing. Số dư: ${new Intl.NumberFormat(
                    'vi-VN',
                    {
                        style: 'currency',
                        currency: 'VND',
                    }
                ).format(userBalance)}, Phí: ${new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                }).format(requiredFee)}`,
            });
        }

        await connection.query('UPDATE users SET balance = balance - ? WHERE id = ?', [
            fee,
            user_id,
        ]);

        await connection.query(
            'INSERT INTO transactions (user_id, type, amount, description, created_at) VALUES (?, ?, ?, ?, NOW())',
            [
                user_id,
                'payment',
                fee,
                `Thanh toán hot listing #${listing_id} trong ${duration_days} ngày`,
            ]
        );

        await connection.query(
            'INSERT INTO revenues (listing_id, user_id, amount, is_hot, created_at) VALUES (?, ?, ?, 1, NOW())',
            [listing_id, user_id, fee]
        );

        const [currentListing] = await connection.query(
            'SELECT is_hot, hot_until FROM listings WHERE id = ?',
            [listing_id]
        );

        let hotUntil;
        if (currentListing[0].is_hot === 1 && currentListing[0].hot_until) {
            hotUntil = new Date(currentListing[0].hot_until);
            hotUntil.setDate(hotUntil.getDate() + duration_days);
        } else {
            hotUntil = new Date();
            hotUntil.setDate(hotUntil.getDate() + duration_days);
        }

        await connection.query('UPDATE listings SET is_hot = 1, hot_until = ? WHERE id = ?', [
            hotUntil,
            listing_id,
        ]);

        await connection.query(
            `UPDATE hot_listing_requests 
             SET status = 'approved', 
                 admin_note = ?,
                 processed_by = ?,
                 processed_at = NOW(),
                 hot_until = ?
             WHERE id = ?`,
            [admin_note || `Đã duyệt hot listing ${duration_days} ngày`, admin_id, hotUntil, id]
        );

        await connection.query(
            'INSERT INTO notifications (user_id, title, message, created_at) VALUES (?, ?, ?, NOW())',
            [
                user_id,
                'Yêu cầu hot listing đã được duyệt',
                `Tin đăng #${listing_id} của bạn đã được duyệt hot trong ${duration_days} ngày. Phí: ${new Intl.NumberFormat(
                    'vi-VN',
                    { style: 'currency', currency: 'VND' }
                ).format(fee)}`,
            ]
        );

        await connection.commit();

        res.json({
            success: true,
            message: `Duyệt yêu cầu hot listing thành công! Tin đăng sẽ hot đến ${hotUntil.toLocaleDateString(
                'vi-VN'
            )}`,
            hot_until: hotUntil,
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error approving hot request:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi duyệt yêu cầu',
        });
    } finally {
        connection.release();
    }
};

const rejectHotRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { admin_note } = req.body;
        const admin_id = req.user.id;

        const [request] = await db.query(
            'SELECT listing_id, user_id FROM hot_listing_requests WHERE id = ? AND status = "pending"',
            [id]
        );

        if (request.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy yêu cầu hoặc đã được xử lý',
            });
        }

        const { listing_id, user_id } = request[0];

        await db.query(
            `UPDATE hot_listing_requests 
             SET status = 'rejected', 
                 admin_note = ?,
                 processed_by = ?,
                 processed_at = NOW()
             WHERE id = ?`,
            [admin_note || 'Từ chối yêu cầu', admin_id, id]
        );

        await db.query(
            'INSERT INTO notifications (user_id, title, message, created_at) VALUES (?, ?, ?, NOW())',
            [
                user_id,
                'Yêu cầu hot listing bị từ chối',
                `Yêu cầu hot listing cho tin đăng #${listing_id} đã bị từ chối. Lý do: ${
                    admin_note || 'Không đáp ứng yêu cầu'
                }`,
            ]
        );

        res.json({
            success: true,
            message: 'Đã từ chối yêu cầu',
        });
    } catch (error) {
        console.error('Error rejecting hot request:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi từ chối yêu cầu',
        });
    }
};

const cancelHotRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;

        const [request] = await db.query(
            'SELECT * FROM hot_listing_requests WHERE id = ? AND user_id = ? AND status = "pending"',
            [id, user_id]
        );

        if (request.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy yêu cầu hoặc không thể hủy',
            });
        }

        await db.query('DELETE FROM hot_listing_requests WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Đã hủy yêu cầu',
        });
    } catch (error) {
        console.error('Error canceling hot request:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi hủy yêu cầu',
        });
    }
};

module.exports = {
    createHotRequest,
    getMyHotRequests,
    getAllHotRequests,
    approveHotRequest,
    rejectHotRequest,
    cancelHotRequest,
    HOT_LISTING_BASE_FEE,
};
