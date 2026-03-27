const db = require('../config/db');

exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const { limit = 20, offset = 0 } = req.query;

        const [notifications] = await db.query(
            `SELECT id, title, message, is_read, created_at 
            FROM notifications 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?`,
            [userId, parseInt(limit), parseInt(offset)]
        );

        const [unreadCount] = await db.query(
            'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
            [userId]
        );

        res.json({
            success: true,
            data: notifications,
            unreadCount: unreadCount[0].count,
        });
    } catch (err) {
        console.error('❌ Lỗi getNotifications:', err);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách thông báo',
        });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const { notificationId } = req.params;

        const [notification] = await db.query(
            'SELECT id FROM notifications WHERE id = ? AND user_id = ?',
            [notificationId, userId]
        );

        if (notification.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thông báo',
            });
        }

        await db.query('UPDATE notifications SET is_read = 1 WHERE id = ?', [notificationId]);

        res.json({
            success: true,
            message: 'Đã đánh dấu thông báo đã đọc',
        });
    } catch (err) {
        console.error('❌ Lỗi markAsRead:', err);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật thông báo',
        });
    }
};

exports.markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;

        await db.query('UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0', [
            userId,
        ]);

        res.json({
            success: true,
            message: 'Đã đánh dấu tất cả thông báo đã đọc',
        });
    } catch (err) {
        console.error('❌ Lỗi markAllAsRead:', err);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật thông báo',
        });
    }
};

exports.deleteNotification = async (req, res) => {
    try {
        const userId = req.user.id;
        const { notificationId } = req.params;

        const [notification] = await db.query(
            'SELECT id FROM notifications WHERE id = ? AND user_id = ?',
            [notificationId, userId]
        );

        if (notification.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thông báo',
            });
        }

        await db.query('DELETE FROM notifications WHERE id = ?', [notificationId]);

        res.json({
            success: true,
            message: 'Đã xóa thông báo',
        });
    } catch (err) {
        console.error('❌ Lỗi deleteNotification:', err);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa thông báo',
        });
    }
};
