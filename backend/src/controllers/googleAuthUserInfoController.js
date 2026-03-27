const jwt = require('jsonwebtoken');
const db = require('../config/db');

exports.googleLoginUserInfo = async (req, res) => {
    try {
        const { googleId, email, name, picture, email_verified } = req.body;

        if (!googleId || !email) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin Google',
            });
        }

        if (!email_verified) {
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

            if (picture && picture !== user.avatar) {
                await db.query('UPDATE users SET avatar = ? WHERE id = ?', [picture, user.id]);
                user.avatar = picture;
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
                    [googleId, 'google', picture, existingUser.id]
                );

                const [updatedUser] = await db.query('SELECT * FROM users WHERE id = ?', [
                    existingUser.id,
                ]);
                user = updatedUser[0];
            } else {
                const [result] = await db.query(
                    `INSERT INTO users (full_name, email, google_id, auth_provider, avatar, email_verified, verified, role) 
                     VALUES (?, ?, ?, 'google', ?, 1, 1, 'user')`,
                    [name, email, googleId, picture]
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
        res.status(500).json({
            success: false,
            message: 'Lỗi khi đăng nhập bằng Google',
            error: error.message,
        });
    }
};
