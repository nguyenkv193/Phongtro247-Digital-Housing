const db = require('../config/db');

function formatPrice(price) {
    if (!price) return '0 đồng';

    if (price >= 1000000) {
        return `${(price / 1000000).toFixed(1)} triệu/tháng`;
    }
    return `${price.toLocaleString('vi-VN')} đồng/tháng`;
}

const POSTING_FEES = {
    'Nhà nguyên căn': 1000000,
    'Căn hộ': 1500000,
};

const getListingsByType = async (req, res) => {
    try {
        const {
            type_slug,
            limit = 50,
            is_hot,
            min_price,
            max_price,
            min_area,
            max_area,
            location_id,
            sort_by = 'newest',
            has_video,
            amenities,
            surroundings,
        } = req.query;

        let query = `
            SELECT 
                l.id,
                l.name as title,
                l.price,
                l.area,
                l.address,
                l.status,
                l.is_hot,
                l.views,
                l.created_at,
                l.amenities,
                l.surroundings,
                l.has_video,
                l.video_url,
                lt.name as type_name,
                lt.slug as type_slug,
                loc.name as location,
                (SELECT image_url FROM listing_images WHERE listing_id = l.id AND is_main = 1 LIMIT 1) as main_image,
                u.full_name as owner_name,
                u.phone as owner_phone
            FROM listings l
            LEFT JOIN listing_types lt ON l.listing_type_id = lt.id
            LEFT JOIN locations loc ON l.location_id = loc.id
            LEFT JOIN users u ON l.user_id = u.id
            WHERE l.status = 'published'
        `;

        const params = [];

        if (type_slug) {
            query += ` AND lt.slug = ?`;
            params.push(type_slug);
        }

        if (is_hot === 'true') {
            query += ` AND l.is_hot = 1`;
        }

        if (min_price) {
            query += ` AND l.price >= ?`;
            params.push(parseInt(min_price));
        }
        if (max_price) {
            query += ` AND l.price <= ?`;
            params.push(parseInt(max_price));
        }

        if (min_area) {
            query += ` AND l.area >= ?`;
            params.push(parseInt(min_area));
        }
        if (max_area) {
            query += ` AND l.area <= ?`;
            params.push(parseInt(max_area));
        }

        if (location_id) {
            query += ` AND l.location_id = ?`;
            params.push(location_id);
        }

        if (has_video === 'true') {
            query += ` AND l.has_video = TRUE`;
        }

        switch (sort_by) {
            case 'price_asc':
                query += ` ORDER BY l.price ASC`;
                break;
            case 'price_desc':
                query += ` ORDER BY l.price DESC`;
                break;
            case 'newest':
            default:
                query += ` ORDER BY l.created_at DESC`;
                break;
        }

        query += ` LIMIT ?`;
        params.push(parseInt(limit));

        let [listings] = await db.query(query, params);

        if (amenities) {
            const amenitiesList = JSON.parse(amenities);
            listings = listings.filter(listing => {
                if (!listing.amenities) return false;

                let listingAmenities = [];

                if (Array.isArray(listing.amenities)) {
                    listingAmenities = listing.amenities;
                } else if (typeof listing.amenities === 'string') {
                    try {
                        listingAmenities = JSON.parse(listing.amenities);
                    } catch (e) {
                        listingAmenities = listing.amenities.split(',').map(a => a.trim());
                    }
                }

                return amenitiesList.every(amenity => listingAmenities.includes(amenity));
            });
        }

        if (surroundings) {
            const surroundingsList = JSON.parse(surroundings);
            listings = listings.filter(listing => {
                if (!listing.surroundings) return false;

                let listingSurroundings = [];

                if (Array.isArray(listing.surroundings)) {
                    listingSurroundings = listing.surroundings;
                } else if (typeof listing.surroundings === 'string') {
                    try {
                        listingSurroundings = JSON.parse(listing.surroundings);
                    } catch (e) {
                        listingSurroundings = listing.surroundings.split(',').map(s => s.trim());
                    }
                }

                return surroundingsList.every(surrounding =>
                    listingSurroundings.includes(surrounding)
                );
            });
        }

        const formattedListings = listings.map(listing => ({
            id: listing.id,
            title: listing.title,
            price: formatPrice(listing.price),
            rawPrice: listing.price,
            area: `${listing.area} m²`,
            rawArea: listing.area,
            location: listing.location || listing.address,
            type: listing.type_name,
            typeSlug: listing.type_slug,
            image: listing.main_image || '/default-image.jpg',
            isHot: Boolean(listing.is_hot),
            hasVideo: Boolean(listing.has_video),
            videoUrl: listing.video_url,
            views: listing.views,
            createdAt: listing.created_at,
            owner: {
                name: listing.owner_name,
                phone: listing.owner_phone,
            },
        }));

        res.json({
            success: true,
            data: formattedListings,
            total: formattedListings.length,
        });
    } catch (error) {
        console.error('Error fetching listings:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách tin đăng',
        });
    }
};

const getListingById = async (req, res) => {
    try {
        const { id } = req.params;

        const query = `
            SELECT 
                l.id,
                l.name as title,
                l.price,
                l.area,
                l.address,
                l.street,
                l.status,
                l.is_hot,
                l.has_video,        
                l.video_url,
                l.views,
                l.description,
                l.rules,
                l.amenities,
                l.surroundings,
                l.created_at,
                l.room_count,
                lt.name as type_name,
                lt.slug as type_slug,
                loc.name as location,
                u.full_name as owner_name,
                u.phone as owner_phone
            FROM listings l
            LEFT JOIN listing_types lt ON l.listing_type_id = lt.id
            LEFT JOIN locations loc ON l.location_id = loc.id
            LEFT JOIN users u ON l.user_id = u.id
            WHERE l.id = ? AND l.status = 'published'
        `;

        const [listings] = await db.query(query, [id]);

        if (listings.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tin đăng',
            });
        }

        const listing = listings[0];

        const [images] = await db.query(
            'SELECT image_url, is_main FROM listing_images WHERE listing_id = ? ORDER BY is_main DESC',
            [id]
        );

        await db.query('UPDATE listings SET views = views + 1 WHERE id = ?', [id]);

        const formattedListing = {
            id: listing.id,
            title: listing.title,
            price: formatPrice(listing.price),
            area: `${listing.area} m²`,
            address: listing.address,
            street: listing.street,
            location: listing.location,
            type: listing.type_name,
            typeSlug: listing.type_slug,
            images: images.map(img => img.image_url),
            image: images.find(img => img.is_main)?.image_url || images[0]?.image_url,
            isHot: Boolean(listing.is_hot),
            hasVideo: Boolean(listing.has_video),
            videoUrl: listing.video_url,
            views: listing.views + 1,
            description: listing.description,
            rules: listing.rules,
            amenities: listing.amenities,
            surroundings: listing.surroundings,
            roomCount: listing.room_count,
            createdAt: listing.created_at,
            owner: {
                name: listing.owner_name,
                phone: listing.owner_phone,
            },
        };

        res.json({
            success: true,
            data: formattedListing,
        });
    } catch (error) {
        console.error('Error fetching listing detail:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy chi tiết tin đăng',
        });
    }
};

const getHotListings = async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const query = `
            SELECT 
                l.id,
                l.name as title,
                l.price,
                l.area,
                l.address,
                l.is_hot,
                l.has_video,        
                l.video_url, 
                lt.name as type_name,
                lt.slug as type_slug, 
                loc.name as location,
                (SELECT image_url FROM listing_images WHERE listing_id = l.id AND is_main = 1 LIMIT 1) as main_image
            FROM listings l
            LEFT JOIN listing_types lt ON l.listing_type_id = lt.id
            LEFT JOIN locations loc ON l.location_id = loc.id
            WHERE l.status = 'published' AND l.is_hot = 1
            ORDER BY l.created_at DESC
            LIMIT ?
        `;

        const [listings] = await db.query(query, [parseInt(limit)]);

        const formattedListings = listings.map(listing => ({
            id: listing.id,
            title: listing.title,
            price: formatPrice(listing.price),
            area: `${listing.area} m²`,
            location: listing.location || listing.address,
            type: listing.type_name,
            image: listing.main_image || '/default-image.jpg',
            isHot: true,
            hasVideo: Boolean(listing.has_video),
            videoUrl: listing.video_url,
        }));

        res.json({
            success: true,
            data: formattedListings,
        });
    } catch (error) {
        console.error('Error fetching hot listings:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy tin đăng HOT',
        });
    }
};

const getHomeListings = async (req, res) => {
    try {
        const types = ['nha-tro-phong-tro', 'nha-nguyen-can', 'can-ho'];
        const result = {};

        for (const typeSlug of types) {
            const query = `
                SELECT 
                    l.id,
                    l.name as title,
                    l.price,
                    l.area,
                    l.address,
                    l.is_hot,
                    l.has_video,
                    l.video_url,
                    lt.name as type_name,
                    lt.slug as type_slug,
                    loc.name as location,
                    (SELECT image_url FROM listing_images WHERE listing_id = l.id AND is_main = 1 LIMIT 1) as main_image,
                    COALESCE((SELECT AVG(rating) FROM reviews WHERE listing_id = l.id), 0) as avg_rating,
                    (SELECT COUNT(*) FROM reviews WHERE listing_id = l.id) as review_count
                FROM listings l
                LEFT JOIN listing_types lt ON l.listing_type_id = lt.id
                LEFT JOIN locations loc ON l.location_id = loc.id
                WHERE l.status = 'published' AND lt.slug = ?
                ORDER BY l.created_at DESC
                LIMIT 10
            `;

            const [listings] = await db.query(query, [typeSlug]);

            result[typeSlug] = listings.map(listing => ({
                id: listing.id,
                title: listing.title,
                price: formatPrice(listing.price),
                area: `${listing.area} m²`,
                location: listing.location || listing.address,
                type: listing.type_name,
                typeSlug: listing.type_slug,
                image: listing.main_image || '/default-image.jpg',
                isHot: Boolean(listing.is_hot),
                hasVideo: Boolean(listing.has_video),
                videoUrl: listing.video_url,
                rating: parseFloat(listing.avg_rating).toFixed(1),
                reviewCount: listing.review_count,
            }));
        }

        res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error('Error fetching home listings:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách tin đăng trang chủ',
        });
    }
};

const createListing = async (req, res) => {
    try {
        const userId = req.userId || req.user?.id;

        const {
            listingType,
            name,
            roomCount,
            area,
            locationId,
            street,
            address,
            price,
            amenities,
            surroundings,
            description,
            rules,
        } = req.body;

        let numericPrice = price;
        if (typeof price === 'string') {
            numericPrice = price.replace(/[,\s₫]/g, '');
        }

        const safePrice = Math.round(parseFloat(numericPrice));
        console.log('📊 Safe price after parsing (rounded to integer):', safePrice);

        if (isNaN(safePrice) || safePrice <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Giá thuê không hợp lệ',
            });
        }

        const parsedAmenities = typeof amenities === 'string' ? JSON.parse(amenities) : amenities;
        const parsedSurroundings =
            typeof surroundings === 'string' ? JSON.parse(surroundings) : surroundings;

        if (!name || !listingType || !price || !area) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng điền đầy đủ thông tin bắt buộc',
            });
        }

        const [typeResult] = await db.query(
            'SELECT id, name FROM listing_types WHERE slug = ? OR name = ?',
            [listingType, listingType]
        );

        if (typeResult.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Loại hình cho thuê không hợp lệ: ' + listingType,
            });
        }

        const listingTypeId = typeResult[0].id;
        const listingTypeName = typeResult[0].name;

        let status = 'pending';

        const postingFee = POSTING_FEES[listingTypeName] || 0;

        if (postingFee > 0) {
            const [userBalance] = await db.query('SELECT balance FROM users WHERE id = ?', [
                userId,
            ]);

            if (userBalance.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy thông tin người dùng',
                });
            }

            const currentBalance = userBalance[0].balance || 0;

            if (currentBalance < postingFee) {
                return res.status(400).json({
                    success: false,
                    message: `Số dư không đủ! Cần ${new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                    }).format(
                        postingFee
                    )} để đăng tin ${listingTypeName}. Số dư hiện tại: ${new Intl.NumberFormat(
                        'vi-VN',
                        {
                            style: 'currency',
                            currency: 'VND',
                        }
                    ).format(currentBalance)}`,
                });
            }

            await db.query('UPDATE users SET balance = balance - ? WHERE id = ?', [
                postingFee,
                userId,
            ]);

            await db.query(
                'INSERT INTO transactions (user_id, type, amount, description, created_at) VALUES (?, ?, ?, ?, NOW())',
                [
                    userId,
                    'payment',
                    postingFee,
                    `Thanh toán phí đăng tin ${listingTypeName}: ${name}`,
                ]
            );
        }

        const amenitiesJson = JSON.stringify(parsedAmenities || []);
        const surroundingsJson = JSON.stringify(parsedSurroundings || []);

        const finalLocationId = locationId && locationId !== '' ? locationId : null;

        const [result] = await db.query(
            `INSERT INTO listings (
                user_id, listing_type_id, name, room_count, area, 
                location_id, street, address, price, 
                amenities, surroundings, description, rules, 
                is_hot, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
                userId,
                listingTypeId,
                name,
                roomCount || 1,
                area,
                finalLocationId,
                street,
                address,
                safePrice,
                amenitiesJson,
                surroundingsJson,
                description,
                rules,
                0,
                status,
            ]
        );

        const listingId = result.insertId;

        if (req.files && req.files.length > 0) {
            const imageValues = req.files.map((file, index) => [
                listingId,
                `/uploads/${file.filename}`,
                index === 0 ? 1 : 0,
            ]);

            await db.query('INSERT INTO listing_images (listing_id, image_url, is_main) VALUES ?', [
                imageValues,
            ]);
        }

        res.status(201).json({
            success: true,
            message:
                postingFee > 0
                    ? `Đăng tin thành công! Đã trừ ${new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                      }).format(postingFee)} phí đăng tin. Tin đăng đang chờ admin duyệt.`
                    : 'Đăng tin thành công! Tin đăng đang chờ admin duyệt.',
            data: {
                id: listingId,
                name,
                price,
                area,
                isHot: false,
                status: status,
            },
        });
    } catch (error) {
        console.error('Error creating listing:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tạo tin đăng',
            error: error.message,
        });
    }
};

const updateListing = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const updateData = req.body;

        const [listing] = await db.query('SELECT user_id FROM listings WHERE id = ?', [id]);

        if (listing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tin đăng',
            });
        }

        if (listing[0].user_id !== userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền chỉnh sửa tin đăng này',
            });
        }

        const updateFields = [];
        const updateValues = [];

        const allowedFields = [
            'name',
            'room_count',
            'area',
            'price',
            'address',
            'street',
            'description',
            'rules',
            'is_hot',
            'status',
        ];

        allowedFields.forEach(field => {
            if (updateData[field] !== undefined) {
                updateFields.push(`${field} = ?`);
                updateValues.push(updateData[field]);
            }
        });

        if (updateData.amenities) {
            updateFields.push('amenities = ?');
            updateValues.push(JSON.stringify(updateData.amenities));
        }

        if (updateData.surroundings) {
            updateFields.push('surroundings = ?');
            updateValues.push(JSON.stringify(updateData.surroundings));
        }

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Không có dữ liệu để cập nhật',
            });
        }

        updateValues.push(id);

        await db.query(`UPDATE listings SET ${updateFields.join(', ')} WHERE id = ?`, updateValues);

        res.json({
            success: true,
            message: 'Cập nhật tin đăng thành công',
        });
    } catch (error) {
        console.error('Error updating listing:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật tin đăng',
        });
    }
};

const deleteListing = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        const [listing] = await connection.query('SELECT user_id FROM listings WHERE id = ?', [id]);

        if (listing.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Không tìm thấy tin đăng' });
        }

        if (listing[0].user_id !== userId && req.user.role !== 'admin') {
            await connection.rollback();
            return res
                .status(403)
                .json({ success: false, message: 'Bạn không có quyền xóa tin đăng này' });
        }

        await connection.query('DELETE FROM revenues WHERE listing_id = ?', [id]);
        await connection.query('DELETE FROM listing_reports WHERE listing_id = ?', [id]);

        await connection.query('DELETE FROM listings WHERE id = ?', [id]);

        await connection.commit();

        res.json({ success: true, message: 'Xóa tin đăng và các dữ liệu liên quan thành công' });
    } catch (error) {
        await connection.rollback();
        console.error('Error deleting listing:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi xóa tin đăng' });
    } finally {
        connection.release();
    }
};

const getMyListings = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status, limit = 20, offset = 0 } = req.query;

        let query = `
            SELECT 
                l.id,
                l.name,
                l.price,
                l.area,
                l.address,
                l.status,
                l.is_hot,
                l.has_video,        
                l.video_url,
                l.views,
                l.created_at,
                lt.name as type_name,
                (SELECT image_url FROM listing_images WHERE listing_id = l.id AND is_main = 1 LIMIT 1) as main_image
            FROM listings l
            LEFT JOIN listing_types lt ON l.listing_type_id = lt.id
            WHERE l.user_id = ?
        `;

        const params = [userId];

        if (status) {
            query += ' AND l.status = ?';
            params.push(status);
        }

        query += ' ORDER BY l.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [listings] = await db.query(query, params);

        res.json({
            success: true,
            data: listings,
            total: listings.length,
        });
    } catch (error) {
        console.error('Error fetching my listings:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách tin đăng',
        });
    }
};

const getLocations = async (req, res) => {
    try {
        const [locations] = await db.query('SELECT id, name FROM locations ORDER BY name ASC');

        res.json({
            success: true,
            data: locations,
        });
    } catch (error) {
        console.error('Error fetching locations:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách địa điểm',
        });
    }
};

const getLocationStats = async (req, res) => {
    try {
        const { limit = 12 } = req.query;

        const query = `
            SELECT 
                loc.id,
                loc.name,
                COUNT(l.id) as room_count
            FROM locations loc
            LEFT JOIN listings l ON loc.id = l.location_id AND l.status = 'published'
            GROUP BY loc.id, loc.name
            ORDER BY room_count DESC
            LIMIT ?
        `;

        const [locations] = await db.query(query, [parseInt(limit)]);

        res.json({
            success: true,
            data: locations,
        });
    } catch (error) {
        console.error('Error fetching location stats:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thống kê địa điểm',
        });
    }
};

const hideListing = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const [listing] = await db.query('SELECT user_id, status FROM listings WHERE id = ?', [id]);

        if (listing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tin đăng',
            });
        }

        if (listing[0].user_id !== userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền thực hiện hành động này',
            });
        }

        if (listing[0].status !== 'published') {
            return res.status(400).json({
                success: false,
                message: `Chỉ có thể ẩn các tin đăng đang hiển thị. Trạng thái hiện tại: ${listing[0].status}`,
            });
        }

        await db.query("UPDATE listings SET status = 'hidden' WHERE id = ?", [id]);

        res.json({
            success: true,
            message: 'Ẩn tin đăng thành công',
        });
    } catch (error) {
        console.error('Error hiding listing:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi ẩn tin đăng',
        });
    }
};
const unhideListing = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const [listing] = await db.query('SELECT user_id, status FROM listings WHERE id = ?', [id]);

        if (listing.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy tin đăng' });
        }

        if (listing[0].user_id !== userId && req.user.role !== 'admin') {
            return res
                .status(403)
                .json({ success: false, message: 'Bạn không có quyền thực hiện hành động này' });
        }

        if (listing[0].status !== 'hidden') {
            return res
                .status(400)
                .json({ success: false, message: 'Chỉ có thể hiện lại các tin đăng đã ẩn.' });
        }

        await db.query("UPDATE listings SET status = 'published' WHERE id = ?", [id]);

        res.json({ success: true, message: 'Tin đăng đã hiển thị lại thành công.' });
    } catch (error) {
        console.error('Error un-hiding listing:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi gửi yêu cầu hiển thị lại' });
    }
};

const getVideoListings = async (req, res) => {
    try {
        const { limit = 10, location_id } = req.query;

        let query = `
            SELECT 
                l.id,
                l.name as title,
                l.price,
                l.area,
                l.address,
                l.is_hot,
                l.has_video,
                l.video_url,
                l.views,
                lt.name as type_name,
                lt.slug as type_slug,
                loc.name as location,
                (SELECT image_url FROM listing_images WHERE listing_id = l.id AND is_main = 1 LIMIT 1) as main_image,
                COALESCE((SELECT AVG(rating) FROM reviews WHERE listing_id = l.id), 0) as avg_rating,
                (SELECT COUNT(*) FROM reviews WHERE listing_id = l.id) as review_count
            FROM listings l
            LEFT JOIN listing_types lt ON l.listing_type_id = lt.id
            LEFT JOIN locations loc ON l.location_id = loc.id
            WHERE l.status = 'published' AND l.has_video = TRUE
        `;

        const params = [];

        if (location_id) {
            query += ` AND l.location_id = ?`;
            params.push(location_id);
        }

        query += ` ORDER BY l.created_at DESC LIMIT ?`;
        params.push(parseInt(limit));

        const [listings] = await db.query(query, params);

        const formattedListings = listings.map(listing => ({
            id: listing.id,
            title: listing.title,
            price: formatPrice(listing.price),
            area: `${listing.area} m²`,
            location: listing.location || listing.address,
            address: listing.address,
            type: listing.type_name,
            typeSlug: listing.type_slug,
            image: listing.main_image || '/default-image.jpg',
            isHot: Boolean(listing.is_hot),
            hasVideo: Boolean(listing.has_video),
            videoUrl: listing.video_url,
            views: listing.views,
            rating: parseFloat(listing.avg_rating).toFixed(1),
            reviewCount: listing.review_count,
        }));

        res.json({
            success: true,
            data: formattedListings,
            total: formattedListings.length,
        });
    } catch (error) {
        console.error('Error fetching video listings:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách tin đăng có video',
        });
    }
};

module.exports = {
    getListingsByType,
    getHotListings,
    getHomeListings,
    createListing,
    updateListing,
    deleteListing,
    getMyListings,
    getListingById,
    hideListing,
    unhideListing,
    getVideoListings,
    getLocations,
    getLocationStats,
};
