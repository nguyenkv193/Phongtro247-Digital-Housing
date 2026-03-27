const db = require('../config/db');

exports.getWards = async (req, res) => {
    try {
        const sql = `SELECT id, name FROM locations WHERE type = 'ward' ORDER BY name`;
        const [results] = await db.query(sql);
        res.json(results);
    } catch (err) {
        console.error('DB error getWards:', err);
        res.status(500).json({ message: 'Lỗi server khi lấy danh sách phường/xã' });
    }
};

exports.getAllTenants = async (req, res) => {
    try {
        const ownerId = Number(req.query.owner_id);
        if (!ownerId) {
            return res.status(400).json({ message: 'Thiếu hoặc sai định dạng owner_id' });
        }

        const sql = `
      SELECT t.*, l.name AS ward_name, u.email AS user_email
      FROM tenants t
      LEFT JOIN locations l ON t.ward_id = l.id
      LEFT JOIN users u ON t.user_id = u.id
      WHERE t.owner_id = ?
      ORDER BY t.created_at DESC
    `;
        const [results] = await db.query(sql, [ownerId]);
        res.json(results);
    } catch (err) {
        console.error('DB error getAllTenants:', err);
        res.status(500).json({ message: 'Lỗi server khi lấy danh sách khách thuê' });
    }
};

exports.createTenant = async (req, res) => {
    try {
        const owner_id = req.user?.id || req.body.owner_id;
        const {
            name,
            birthday,
            gender = 'Khác',
            ward_id,
            address,
            phone,
            email,
            occupation,
            cccd,
            stay_status = 'Chưa đăng ký',
        } = req.body;

        if (!owner_id) {
            return res.status(400).json({ message: 'Thiếu thông tin chủ trọ (owner_id)' });
        }

        if (!name || !phone) {
            return res.status(400).json({ message: 'Vui lòng nhập tên và số điện thoại' });
        }

        const [existing] = await db.query(
            `SELECT * FROM tenants WHERE phone = ? AND owner_id = ? LIMIT 1`,
            [phone, owner_id]
        );
        if (existing.length > 0) {
            return res.status(400).json({
                message: 'Khách thuê này đã tồn tại trong danh sách của bạn',
            });
        }

        let user_id = null;
        if (email || phone) {
            const [users] = await db.query(
                `SELECT id FROM users WHERE email = ? OR phone = ? LIMIT 1`,
                [email || '', phone]
            );
            if (users.length > 0) {
                user_id = users[0].id;
            }
        }

        const [result] = await db.query(
            `INSERT INTO tenants
        (owner_id, user_id, name, birthday, gender, ward_id, address, phone, email, occupation, cccd, stay_status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
                owner_id,
                user_id,
                name,
                birthday || null,
                gender,
                ward_id || null,
                address || null,
                phone,
                email || null,
                occupation || null,
                cccd || null,
                stay_status,
            ]
        );

        res.status(201).json({
            message: 'Thêm khách thuê thành công',
            tenant: {
                id: result.insertId,
                owner_id,
                user_id,
                name,
                phone,
                stay_status,
                address,
                gender,
                birthday,
            },
        });
    } catch (err) {
        console.error('DB error createTenant:', err);
        res.status(500).json({ message: 'Lỗi server khi lưu khách thuê' });
    }
};

exports.updateTenant = async (req, res) => {
    const { id } = req.params;
    const { stay_status } = req.body;

    if (!stay_status) {
        return res.status(400).json({ message: 'Không có dữ liệu để cập nhật' });
    }

    try {
        const [tenants] = await db.query('SELECT * FROM tenants WHERE id = ?', [id]);
        if (tenants.length === 0) {
            return res.status(404).json({ message: 'Khách thuê không tồn tại' });
        }

        await db.query('UPDATE tenants SET stay_status = ? WHERE id = ?', [stay_status, id]);

        res.json({ message: 'Cập nhật thành công', stay_status });
    } catch (err) {
        console.error('DB error updateTenant:', err);
        res.status(500).json({ message: 'Lỗi server khi cập nhật khách thuê' });
    }
};

exports.getMyTenantInfo = async (req, res) => {
    try {
        const userId = req.user.id;

        console.log('🔍 getMyTenantInfo called for userId:', userId);

        if (!userId) {
            console.log('❌ No userId found');
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
            });
        }

        const tenantSql = `
            SELECT t.*, l.name AS ward_name
            FROM tenants t
            LEFT JOIN locations l ON t.ward_id = l.id
            WHERE t.user_id = ?
            LIMIT 1
        `;

        const [tenantResults] = await db.query(tenantSql, [userId]);

        console.log('📊 Tenant query results:', tenantResults);

        if (tenantResults.length === 0) {
            console.log('⚠️ No tenant info found for userId:', userId);
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thông tin lưu trú',
            });
        }

        const tenant = tenantResults[0];

        const contractSql = `
            SELECT
                c.id AS contract_id,
                c.start_date,
                c.end_date,
                c.deposit_price,
                c.rent_price,
                c.note,
                c.status AS contract_status,
                ls.id AS listing_id,
                ls.name AS listing_name,
                ls.address AS listing_address,
                ls.price AS listing_price,
                ls.area AS listing_area,
                lt.name AS listing_type_name,
                u.full_name AS landlord_name,
                u.phone AS landlord_phone,
                u.email AS landlord_email
            FROM contracts c
            LEFT JOIN listings ls ON c.listing_id = ls.id
            LEFT JOIN listing_types lt ON c.listing_type_id = lt.id
            LEFT JOIN users u ON c.owner_id = u.id
            WHERE c.tenant_id = ?
            ORDER BY c.created_at DESC
            LIMIT 1
        `;

        const [contractResults] = await db.query(contractSql, [tenant.id]);

        console.log('📊 Contract query results:', contractResults);

        const responseData = {
            ...tenant,
            contract: contractResults.length > 0 ? contractResults[0] : null,
        };

        console.log('✅ Tenant info found:', responseData);

        res.json({
            success: true,
            data: responseData,
        });
    } catch (err) {
        console.error('❌ DB error getMyTenantInfo:', err);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy thông tin lưu trú',
        });
    }
};
