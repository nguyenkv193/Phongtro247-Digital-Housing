const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
    try {
        const query = 'SELECT id, name, type FROM locations ORDER BY name ASC';
        const [results] = await db.query(query);

        res.json({
            success: true,
            data: results,
        });
    } catch (error) {
        console.error('Error fetching locations:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách khu vực',
        });
    }
});

router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.trim().length === 0) {
            return res.json({
                success: true,
                data: [],
            });
        }

        const searchTerm = `%${q}%`;
        const query = `
            SELECT id, name, type 
            FROM locations 
            WHERE name LIKE ? 
            ORDER BY name ASC 
            LIMIT 20
        `;

        const [results] = await db.query(query, [searchTerm]);

        res.json({
            success: true,
            data: results,
        });
    } catch (error) {
        console.error('Error searching locations:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tìm kiếm khu vực',
        });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const query = 'SELECT id, name, type FROM locations WHERE id = ?';
        const [results] = await db.query(query, [id]);

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy khu vực',
            });
        }

        res.json({
            success: true,
            data: results[0],
        });
    } catch (error) {
        console.error('Error fetching location:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thông tin khu vực',
        });
    }
});

module.exports = router;
