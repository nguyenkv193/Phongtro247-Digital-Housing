const db = require('../config/db');
const crypto = require('crypto');
const { sendVerificationEmail } = require('../services/emailService');

exports.sendVerificationEmail = async (req, res) => {
    try {
        const userId = req.user.id;

        const [users] = await db.query(
            'SELECT email, full_name, email_verified FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng',
            });
        }

        const user = users[0];

        if (user.email_verified) {
            return res.status(400).json({
                success: false,
                message: 'Email đã được xác thực',
            });
        }

        if (!user.email) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cập nhật email trước khi xác thực',
            });
        }

        await db.query('DELETE FROM email_verification_tokens WHERE user_id = ?', [userId]);

        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await db.query(
            'INSERT INTO email_verification_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
            [userId, token, expiresAt]
        );

        const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

        const result = await sendVerificationEmail(user.email, user.full_name, verificationLink);

        if (result.success) {
            res.json({
                success: true,
                message: 'Email xác thực đã được gửi. Vui lòng kiểm tra hộp thư của bạn.',
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Không thể gửi email. Vui lòng thử lại sau.',
            });
        }
    } catch (err) {
        console.error('❌ Error sending verification email:', err);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi gửi email xác thực',
        });
    }
};

exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Token không hợp lệ',
            });
        }

        const [tokens] = await db.query(
            'SELECT user_id, expires_at FROM email_verification_tokens WHERE token = ?',
            [token]
        );

        if (tokens.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Token không tồn tại hoặc đã được sử dụng',
            });
        }

        const tokenData = tokens[0];

        if (new Date() > new Date(tokenData.expires_at)) {
            await db.query('DELETE FROM email_verification_tokens WHERE token = ?', [token]);
            return res.status(400).json({
                success: false,
                message: 'Token đã hết hạn. Vui lòng yêu cầu gửi lại email xác thực.',
            });
        }

        await db.query('UPDATE users SET email_verified = 1 WHERE id = ?', [tokenData.user_id]);

        await db.query('DELETE FROM email_verification_tokens WHERE token = ?', [token]);

        const [users] = await db.query('SELECT * FROM users WHERE id = ?', [tokenData.user_id]);
        const updatedUser = users[0];

        res.json({
            success: true,
            message: 'Email đã được xác thực thành công!',
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                full_name: updatedUser.full_name,
                email_verified: updatedUser.email_verified,
                role: updatedUser.role,
                verified: updatedUser.verified,
            },
        });
    } catch (err) {
        console.error('❌ Error verifying email:', err);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi xác thực email',
        });
    }
};
