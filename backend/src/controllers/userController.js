const db = require('../config/db');

exports.getUserInfo = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT 
                id, full_name, gender, birthday, cccd, phone, email, 
                address, avatar, role, has_completed_host_info, created_at 
            FROM users WHERE id = ?`,
            [req.userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng!' });
        }

        const user = rows[0];
        if (user.birthday) {
            const date = new Date(user.birthday);

            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');

            user.birthday = `${year}-${month}-${day}`;
        }

        res.json(user);
    } catch (error) {
        console.error('Lỗi getUserInfo:', error);
        res.status(500).json({ message: 'Lỗi khi lấy thông tin người dùng!' });
    }
};

exports.updateUserInfo = async (req, res) => {
    try {
        const fieldsToUpdate = req.body;
        const allowedFields = [
            'full_name',
            'gender',
            'birthday',
            'cccd',
            'email',
            'phone',
            'address',
        ];
        const validKeys = Object.keys(fieldsToUpdate).filter(key => allowedFields.includes(key));

        if (validKeys.length === 0) {
            return res.status(400).json({ message: 'Không có dữ liệu hợp lệ để cập nhật!' });
        }

        const setClause = validKeys.map(key => `\`${key}\` = ?`).join(', ');
        const values = validKeys.map(key => fieldsToUpdate[key]);

        await db.query(`UPDATE users SET ${setClause} WHERE id = ?`, [...values, req.userId]);

        res.json({ message: 'Cập nhật thông tin thành công!' });
    } catch (error) {
        console.error('Lỗi updateUserInfo:', error);
        res.status(500).json({ message: 'Có lỗi khi cập nhật thông tin!' });
    }
};

exports.becomeLandlord = async (req, res) => {
    const userId = req.userId;
    try {
        await db.query("UPDATE users SET role = 'landlord' WHERE id = ?", [userId]);
        return res.json({ message: 'Bạn đã trở thành chủ nhà!' });
    } catch (error) {
        console.error('Lỗi becomeLandlord:', error);
        return res.status(500).json({ message: 'Lỗi server!' });
    }
};

exports.submitHostInfo = async (req, res) => {
    try {
        const { full_name, phone, email, address, role } = req.body;
        const userId = req.userId;

        await db.query(
            `UPDATE users SET 
                full_name = ?, 
                phone = ?, 
                email = ?, 
                address = ?, 
                role = ?,
                has_completed_host_info = 1
            WHERE id = ?`,
            [full_name, phone, email, address, role, userId]
        );

        const [updatedUser] = await db.query(
            `SELECT id, full_name, phone, email, address, role, has_completed_host_info 
            FROM users WHERE id = ?`,
            [userId]
        );

        res.json({
            message: 'Thông tin host đã được lưu thành công!',
            user: updatedUser[0],
        });
    } catch (error) {
        console.error('Lỗi submitHostInfo:', error);
        res.status(500).json({ message: 'Có lỗi khi lưu thông tin host!' });
    }
};

exports.checkHostInfoStatus = async (req, res) => {
    try {
        const userId = req.userId;

        const [rows] = await db.query(
            `SELECT has_completed_host_info, role FROM users WHERE id = ?`,
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng!' });
        }

        res.json({
            has_completed_host_info: rows[0].has_completed_host_info === 1,
            role: rows[0].role,
        });
    } catch (error) {
        console.error('Lỗi checkHostInfoStatus:', error);
        res.status(500).json({ message: 'Lỗi khi kiểm tra trạng thái host info!' });
    }
};

exports.getUserBalance = async (req, res) => {
    try {
        const userId = req.userId;

        const [rows] = await db.query(`SELECT balance FROM users WHERE id = ?`, [userId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng!' });
        }

        res.json({
            balance: rows[0].balance || 0,
        });
    } catch (error) {
        console.error('Lỗi getUserBalance:', error);
        res.status(500).json({ message: 'Lỗi khi lấy số dư!' });
    }
};
