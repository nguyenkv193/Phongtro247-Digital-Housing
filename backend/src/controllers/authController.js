const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    const { full_name, email, phone, password } = req.body;
    if (!full_name || (!email && !phone) || !password) {
        return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin!' });
    }
    try {
        const [users] = await db.execute(
            "SELECT id FROM users WHERE (email = ? AND email != '') OR (phone = ? AND phone != '')",
            [email || '', phone || '']
        );

        if (users.length > 0) {
            return res.status(400).json({ message: 'Email hoặc số điện thoại đã tồn tại!' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.execute(
            'INSERT INTO users (full_name, email, phone, password, role, verified) VALUES (?, ?, ?, ?, ?, ?)',
            [full_name, email || null, phone || null, hashedPassword, 'user', 0]
        );

        return res.status(201).json({ message: 'Đăng ký thành công!' });
    } catch (error) {
        console.error('❌ Lỗi trong register:', error);
        return res.status(500).json({ message: 'Lỗi server!', error: error.message });
    }
};

exports.login = async (req, res) => {
    const { emailOrPhone, password } = req.body;
    if (!emailOrPhone || !password) {
        return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin!' });
    }
    try {
        const [users] = await db.execute('SELECT * FROM users WHERE email = ? OR phone = ?', [
            emailOrPhone,
            emailOrPhone,
        ]);

        if (users.length === 0) {
            return res.status(400).json({ message: 'Tài khoản không tồn tại!' });
        }

        const user = users[0];

        if (user.is_blocked === 1) {
            return res.status(403).json({
                success: false,
                message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.',
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Mật khẩu không đúng!' });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '1d',
        });

        return res.json({
            token,
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                phone: user.phone,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('❌ Lỗi trong login:', error);
        return res.status(500).json({ message: 'Lỗi server!', error: error.message });
    }
};
