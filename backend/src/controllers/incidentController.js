const db = require('../config/db');

const createIncident = async (req, res) => {
    try {
        const tenantId = req.user.id;
        const { listingId, reason, description } = req.body;

        if (!listingId || !reason) {
            return res.status(400).json({ success: false, message: 'Thông tin không hợp lệ.' });
        }

        const title = reason;
        const query =
            'INSERT INTO incidents (listing_id, tenant_id, title, description, created_at) VALUES (?, ?, ?, ?, NOW())';
        await db.query(query, [listingId, tenantId, title, description || null]);

        res.status(201).json({ success: true, message: 'Sự cố đã được gửi thành công!' });
    } catch (error) {
        console.error('Error creating incident:', error);
        res.status(500).json({ success: false, message: 'Lỗi server khi tạo sự cố.' });
    }
};

const getIncidentsForLandlord = async (req, res) => {
    try {
        const landlordId = req.user.id;
        const { status, search } = req.query;

        let query = `
            SELECT 
                i.id, i.title, i.description, i.status, i.created_at,
                l.name AS listing_name, u.full_name AS tenant_name
            FROM incidents i
            JOIN listings l ON i.listing_id = l.id
            JOIN users u ON i.tenant_id = u.id
            WHERE l.user_id = ?
        `;
        const params = [landlordId];

        if (status === 'resolved') {
            query += " AND i.status = 'Đã giải quyết'";
        } else if (status === 'unresolved') {
            query += " AND i.status = 'Chưa giải quyết'";
        }

        if (search) {
            query += ' AND (i.title LIKE ? OR l.name LIKE ?)';
            params.push(`%${search}%`);
            params.push(`%${search}%`);
        }

        query += ' ORDER BY i.created_at DESC';
        const [incidents] = await db.query(query, params);
        res.status(200).json({ success: true, data: incidents });
    } catch (error) {
        console.error('Error fetching incidents for landlord:', error);
        res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách sự cố.' });
    }
};

const updateIncidentStatus = async (req, res) => {
    try {
        const landlordId = req.user.id;
        const { incidentId } = req.params;
        const { status, admin_response } = req.body;

        const [incident] = await db.query(
            `SELECT i.id, i.tenant_id, i.title, l.name as listing_name 
            FROM incidents i 
            JOIN listings l ON i.listing_id = l.id 
            WHERE i.id = ? AND l.user_id = ?`,
            [incidentId, landlordId]
        );

        if (incident.length === 0) {
            return res
                .status(403)
                .json({ success: false, message: 'Bạn không có quyền thực hiện hành động này.' });
        }

        const tenantId = incident[0].tenant_id;
        const incidentTitle = incident[0].title;
        const listingName = incident[0].listing_name;

        const newStatus = status || 'Đã giải quyết';
        const resolvedAt = newStatus === 'Đã giải quyết' ? 'NOW()' : 'NULL';

        await db.query(
            `UPDATE incidents 
            SET status = ?, admin_response = ?, admin_id = ?, resolved_at = ${resolvedAt}, updated_at = NOW() 
            WHERE id = ?`,
            [newStatus, admin_response || null, landlordId, incidentId]
        );

        if (admin_response) {
            const notificationTitle = `Phản hồi sự cố: ${incidentTitle}`;
            const notificationMessage = `Chủ trọ đã phản hồi sự cố "${incidentTitle}" tại ${listingName}: ${admin_response}`;

            await db.query(
                'INSERT INTO notifications (user_id, title, message, created_at) VALUES (?, ?, ?, NOW())',
                [tenantId, notificationTitle, notificationMessage]
            );
        }

        res.status(200).json({
            success: true,
            message: 'Cập nhật trạng thái và gửi thông báo thành công.',
        });
    } catch (error) {
        console.error('Error updating incident status:', error);
        res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật trạng thái.' });
    }
};

module.exports = {
    createIncident,
    getIncidentsForLandlord,
    updateIncidentStatus,
};
