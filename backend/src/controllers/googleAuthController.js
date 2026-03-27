const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const db = require('../config/db');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleLogin = async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu Google credential',
            });
        }

        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const googleId = payload.sub;
        const email = payload.email;
        const fullName = payload.name;
        const avatar = payload.picture;
        const emailVerified = payload.email_verified;

        if (!emailVerified) {
            return res.status(400).json({
                success: false,
                message: 'Email Google chưa được xác minh',
            });
        }

        const [existingUsers] = await db.query('SELECT * FROM users WHERE google_id = ?', [
            googleId,
        ]);

        let user;

        if (existingUsers.length > 0) {
            user = existingUsers[0];

            if (user.is_blocked) {
                return res.status(403).json({
                    success: false,
                    message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ admin.',
                });
            }

            if (avatar && avatar !== user.avatar) {
                await db.query('UPDATE users SET avatar = ? WHERE id = ?', [avatar, user.id]);
                user.avatar = avatar;
            }
        } else {
            const [emailUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

            if (emailUsers.length > 0) {
                const existingUser = emailUsers[0];

                if (existingUser.is_blocked) {
                    return res.status(403).json({
                        success: false,
                        message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ admin.',
                    });
                }

                await db.query(
                    'UPDATE users SET google_id = ?, auth_provider = ?, email_verified = 1, avatar = ? WHERE id = ?',
                    [googleId, 'google', avatar, existingUser.id]
                );

                const [updatedUser] = await db.query('SELECT * FROM users WHERE id = ?', [
                    existingUser.id,
                ]);
                user = updatedUser[0];
            } else {
                const [result] = await db.query(
                    `INSERT INTO users (full_name, email, google_id, auth_provider, avatar, email_verified, verified, role) 
                     VALUES (?, ?, ?, 'google', ?, 1, 1, 'user')`,
                    [fullName, email, googleId, avatar]
                );

                const [newUser] = await db.query('SELECT * FROM users WHERE id = ?', [
                    result.insertId,
                ]);
                user = newUser[0];
            }
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role,
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        const userResponse = {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            avatar: user.avatar,
            address: user.address,
            gender: user.gender,
            birthday: user.birthday,
            verified: user.verified,
            has_completed_host_info: user.has_completed_host_info,
            balance: user.balance,
            auth_provider: user.auth_provider || 'google',
        };

        res.json({
            success: true,
            message: 'Đăng nhập Google thành công',
            token,
            user: userResponse,
        });
    } catch (error) {
        console.error('Google Login Error:', error);

        if (error.message && error.message.includes('Token used too late')) {
            return res.status(400).json({
                success: false,
                message: 'Token đã hết hạn. Vui lòng thử lại.',
            });
        }

        res.status(500).json({
            success: false,
            message: 'Lỗi khi đăng nhập bằng Google',
            error: error.message,
        });
    }
};

exports.googleCallback = async (req, res) => {
    try {
        const user = req.user;

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role,
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/auth/google/callback?token=${token}`);
    } catch (error) {
        console.error('Google Callback Error:', error);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/login?error=google_auth_failed`);
    }
};

exports.unlinkGoogle = async (req, res) => {
    try {
        const userId = req.user.id;

        const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
        const user = users[0];

        if (!user.password && user.auth_provider === 'google') {
            return res.status(400).json({
                success: false,
                message:
                    'Không thể hủy liên kết Google vì đây là phương thức đăng nhập duy nhất của bạn. Vui lòng đặt mật khẩu trước.',
            });
        }

        await db.query('UPDATE users SET google_id = NULL, auth_provider = ? WHERE id = ?', [
            user.password ? 'local' : 'google',
            userId,
        ]);

        res.json({
            success: true,
            message: 'Đã hủy liên kết tài khoản Google',
        });
    } catch (error) {
        console.error('Unlink Google Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi hủy liên kết Google',
        });
    }
};
