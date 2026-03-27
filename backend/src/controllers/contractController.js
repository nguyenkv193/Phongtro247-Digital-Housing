const db = require('../config/db');

exports.getAllListings = async (req, res) => {
    try {
        const [rows] = await db.query(`
      SELECT 
        l.id, 
        l.name AS room_name, 
        l.price, 
        l.address,
        lt.name AS listing_type,
        u.full_name AS owner_name
      FROM listings l
      LEFT JOIN listing_types lt ON l.listing_type_id = lt.id
      LEFT JOIN users u ON l.user_id = u.id
      ORDER BY l.name ASC
    `);

        res.json(rows);
    } catch (err) {
        console.error('❌ Lỗi getAllListings:', err);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách trọ' });
    }
};

exports.getContracts = async (req, res) => {
    try {
        const [rows] = await db.query(`
      SELECT 
        c.id,
        c.listing_id,
        c.tenant_id,
        c.start_date,
        c.end_date,
        c.deposit_price,
        c.rent_price,
        c.note,
        c.status,
        c.created_at,
        t.name AS tenant_name,
        t.phone AS tenant_phone,
        l.name AS room_name,
        lt.name AS listing_type_name,
        u.full_name AS owner_name
      FROM contracts c
      LEFT JOIN tenants t ON c.tenant_id = t.id
      LEFT JOIN listings l ON c.listing_id = l.id
      LEFT JOIN listing_types lt ON l.listing_type_id = lt.id
      LEFT JOIN users u ON l.user_id = u.id 
      ORDER BY c.created_at DESC
    `);

        res.json(rows);
    } catch (err) {
        console.error('❌ Lỗi getContracts:', err);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách hợp đồng' });
    }
};

exports.getContractById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query(
            `SELECT 
        c.*,
        t.name AS tenant_name,
        t.phone AS tenant_phone,
        l.name AS room_name,
        lt.name AS listing_type_name,
        u.full_name AS owner_name
      FROM contracts c
      LEFT JOIN tenants t ON c.tenant_id = t.id
      LEFT JOIN listings l ON c.listing_id = l.id
      LEFT JOIN listing_types lt ON l.listing_type_id = lt.id
      LEFT JOIN users u ON l.user_id = u.id
      
      WHERE c.id = ?`,
            [id]
        );

        if (rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy hợp đồng' });

        res.json(rows[0]);
    } catch (err) {
        console.error('❌ Lỗi getContractById:', err);
        res.status(500).json({ message: 'Lỗi khi lấy chi tiết hợp đồng' });
    }
};

exports.getListingsByType = async (req, res) => {
    try {
        const { type } = req.query;
        let sql = `
      SELECT 
        l.id, 
        l.name AS room_name, 
        l.price, 
        l.address,
        lt.name AS listing_type
      FROM listings l
      LEFT JOIN listing_types lt ON l.listing_type_id = lt.id
    `;

        const params = [];

        if (type) {
            sql += ' WHERE lt.name = ?';
            params.push(type);
        }

        sql += ' ORDER BY l.name ASC';

        const [rows] = await db.query(sql, params);
        res.json(rows);
    } catch (err) {
        console.error('❌ Lỗi getListingsByType:', err);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách trọ' });
    }
};

exports.createContract = async (req, res) => {
    try {
        const userId = req.user?.id || req.userId;
        const { tenant_id, listing_id, start_date, end_date, deposit_price, rent_price, note } =
            req.body;

        if (!tenant_id || !listing_id || !start_date || !end_date) {
            return res.status(400).json({ message: 'Thiếu thông tin hợp đồng' });
        }

        const [listingRows] = await db.query(
            'SELECT listing_type_id, user_id FROM listings WHERE id = ?',
            [listing_id]
        );

        if (listingRows.length === 0) {
            return res.status(400).json({ message: 'Listing không tồn tại' });
        }

        const { listing_type_id, user_id } = listingRows[0];
        const ownerId = userId || user_id;

        const [result] = await db.query(
            `INSERT INTO contracts 
      (tenant_id, listing_id, listing_type_id, owner_id, start_date, end_date, deposit_price, rent_price, note)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                tenant_id,
                listing_id,
                listing_type_id,
                ownerId,
                start_date,
                end_date,
                deposit_price || 0,
                rent_price || 0,
                note || '',
            ]
        );

        res.status(201).json({ message: 'Tạo hợp đồng thành công', id: result.insertId });
    } catch (err) {
        console.error('❌ Lỗi createContract:', err);
        res.status(500).json({ message: 'Lỗi khi tạo hợp đồng' });
    }
};

exports.updateContract = async (req, res) => {
    try {
        const { id } = req.params;
        const { start_date, end_date, deposit_price, rent_price, note, listing_id } = req.body;

        let status = 'Đang hiệu lực';
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const endDate = new Date(end_date);
        endDate.setHours(0, 0, 0, 0);

        const daysUntilExpiry = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

        if (daysUntilExpiry < 0) {
            status = 'Hết hạn';
        } else if (daysUntilExpiry <= 30) {
            status = 'Sắp hết hạn';
        } else {
            status = 'Đang hiệu lực';
        }

        console.log('📅 Update contract:', {
            id,
            end_date,
            daysUntilExpiry,
            status,
        });

        await db.query(
            `UPDATE contracts
       SET start_date=?, end_date=?, deposit_price=?, rent_price=?, note=?, listing_id=?, status=?, updated_at=NOW()
       WHERE id=?`,
            [start_date, end_date, deposit_price, rent_price, note, listing_id, status, id]
        );

        res.json({ message: 'Cập nhật hợp đồng thành công', status });
    } catch (err) {
        console.error('❌ Lỗi updateContract:', err);
        res.status(500).json({ message: 'Lỗi khi cập nhật hợp đồng' });
    }
};

const handleEdit = contract => {
    setEditingContract(contract);
    setIsEditing(true);
    setShowPopup(true);

    setFormData({
        loai_hinh: contract.listing_type_name || '',
        tro_id: contract.listing_id || '',
        ngay_vao: contract.start_date
            ? new Date(contract.start_date).toISOString().split('T')[0]
            : '',
        ngay_ket_thuc: contract.end_date
            ? new Date(contract.end_date).toISOString().split('T')[0]
            : '',
        gia_thue: contract.rent_price || '',
        gia_coc: contract.deposit_price || '',
        ghi_chu: contract.note || '',
        tenant_id: contract.tenant_id || '',
    });

    setSelectedLoaiHinh(contract.listing_type_name || '');
};

exports.deleteContract = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query(`DELETE FROM contracts WHERE id=?`, [id]);
        res.json({ message: 'Xóa hợp đồng thành công' });
    } catch (err) {
        console.error('❌ Lỗi deleteContract:', err);
        res.status(500).json({ message: 'Lỗi khi xóa hợp đồng' });
    }
};

exports.getTenants = async (req, res) => {
    try {
        const [rows] = await db.query(`
      SELECT id, name, phone
      FROM tenants
      ORDER BY name ASC
    `);
        res.json(rows);
    } catch (err) {
        console.error('❌ Lỗi getTenants:', err);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách khách thuê' });
    }
};
