const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/history', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const sql = `
            SELECT 
                id,
                type,
                amount,
                description,
                created_at
            FROM transactions 
            WHERE user_id = ?
            AND (
                description LIKE '%thành công%'
                OR (type != 'deposit' OR description NOT LIKE 'Nạp tiền qua MoMo - OrderID:%')
            )
            ORDER BY created_at DESC
        `;

        const [transactions] = await pool.execute(sql, [userId]);

        const formattedTransactions = transactions.map(t => ({
            id: t.id,
            date: new Date(t.created_at).toLocaleDateString('vi-VN'),
            type: formatTransactionType(t.type),
            amount: t.amount,
            description: t.description,
            status: getTransactionStatus(t.description),
            created_at: t.created_at,
        }));

        res.json({
            success: true,
            transactions: formattedTransactions,
        });
    } catch (error) {
        console.error('Get transaction history error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi lấy lịch sử giao dịch',
        });
    }
});

function formatTransactionType(type) {
    const typeMap = {
        deposit: 'Nạp tiền',
        payment: 'Thanh toán',
        refund: 'Hoàn tiền',
    };
    return typeMap[type] || type;
}

function getTransactionStatus(description) {
    if (description.includes('thành công')) {
        return 'Thành công';
    } else if (description.includes('thất bại')) {
        return 'Thất bại';
    } else if (description.includes('pending')) {
        return 'Đang xử lý';
    }
    return 'Thành công';
}

module.exports = router;
