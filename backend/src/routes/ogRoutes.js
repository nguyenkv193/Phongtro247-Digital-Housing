const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/listing/:id', async (req, res) => {
    try {
        const listingId = req.params.id;

        const [listings] = await db.query(
            `SELECT 
                l.id,
                l.name,
                l.description,
                l.price,
                l.address,
                (SELECT image_url FROM listing_images WHERE listing_id = l.id AND is_main = 1 LIMIT 1) as image
            FROM listings l
            WHERE l.id = ?`,
            [listingId]
        );

        if (listings.length === 0) {
            return res.status(404).send('Listing not found');
        }

        const listing = listings[0];
        const title = listing.name || 'Phòng trọ';
        const imageUrl = listing.image
            ? `${req.protocol}://${req.get('host')}${listing.image}`
            : `${req.protocol}://${req.get('host')}/uploads/default.jpg`;

        const ogUrl = `${req.protocol}://${req.get('host')}/og/listing/${listingId}`;

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const pageUrl = `${frontendUrl}/listing/${listingId}`;
        const description = listing.description || title;
        const priceText = listing.price
            ? `${(listing.price / 1000000).toFixed(1)} triệu/tháng`
            : '';

        const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Basic Meta Tags -->
    <title>${title} - Phongtro247</title>
    <meta name="description" content="${description}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${ogUrl}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:site_name" content="Phongtro247">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${ogUrl}">
    <meta property="twitter:title" content="${title}">
    <meta property="twitter:description" content="${description}">
    <meta property="twitter:image" content="${imageUrl}">
    
    <script>
        if (!/bot|crawler|spider|crawling|facebookexternalhit/i.test(navigator.userAgent)) {
            window.location.href = "${pageUrl}";
        }
    </script>
</head>
<body>
    <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <img src="${imageUrl}" alt="${title}" style="max-width: 100%; height: auto; border-radius: 8px; margin-bottom: 20px;" onerror="this.style.display='none'">
        <h1 style="color: #333; margin-bottom: 10px;">${title}</h1>
        <p style="color: #ff5c00; font-size: 24px; font-weight: bold; margin: 10px 0;">${priceText}</p>
        <p style="color: #666; margin: 10px 0;">${listing.address || ''}</p>
        <p style="color: #999; margin: 20px 0;">Đang chuyển hướng đến trang chi tiết...</p>
        <a href="${pageUrl}" style="display: inline-block; background: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">Xem chi tiết ngay</a>
    </div>
</body>
</html>
        `;

        res.send(html);
    } catch (error) {
        console.error('Error generating OG page:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
