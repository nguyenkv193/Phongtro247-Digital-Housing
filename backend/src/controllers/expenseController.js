const db = require('../config/db');

exports.getExpenses = async (req, res) => {
    try {
        const userId = req.user.id;
        const { type, start_date, end_date } = req.query;

        let incomeQuery = `
            SELECT 
                c.id,
                c.rent_price as amount,
                c.start_date as date,
                'Thu' as type,
                'Tiền thuê' as category,
                l.name as listing_name,
                t.name as tenant_name,
                c.created_at
            FROM contracts c
            LEFT JOIN listings l ON c.listing_id = l.id
            LEFT JOIN tenants t ON c.tenant_id = t.id
            WHERE c.owner_id = ?
        `;
        const incomeParams = [userId];

        if (start_date) {
            incomeQuery += ` AND c.start_date >= ?`;
            incomeParams.push(start_date);
        }
        if (end_date) {
            incomeQuery += ` AND c.start_date <= ?`;
            incomeParams.push(end_date);
        }

        let expenseQuery = `
            SELECT 
                t.id,
                t.amount,
                t.created_at as date,
                'Chi' as type,
                CASE 
                    WHEN t.description LIKE '%phí đăng tin%' THEN 'Phí đăng tin'
                    WHEN t.description LIKE '%hot listing%' THEN 'Phí hot listing'
                    ELSE 'Chi phí khác'
                END as category,
                t.description as listing_name,
                '' as tenant_name,
                t.created_at
            FROM transactions t
            WHERE t.user_id = ? AND t.type = 'payment'
        `;
        const expenseParams = [userId];

        if (start_date) {
            expenseQuery += ` AND DATE(t.created_at) >= ?`;
            expenseParams.push(start_date);
        }
        if (end_date) {
            expenseQuery += ` AND DATE(t.created_at) <= ?`;
            expenseParams.push(end_date);
        }

        let allTransactions = [];

        if (type === 'income') {
            const [income] = await db.query(incomeQuery, incomeParams);
            console.log('📊 Income query:', incomeQuery);
            console.log('📊 Income params:', incomeParams);
            console.log('📊 Income results:', income.length);
            allTransactions = income;
        } else if (type === 'expense') {
            const [expenses] = await db.query(expenseQuery, expenseParams);
            console.log('📊 Expense results:', expenses.length);
            allTransactions = expenses;
        } else {
            const [income] = await db.query(incomeQuery, incomeParams);
            const [expenses] = await db.query(expenseQuery, expenseParams);
            console.log('📊 User ID:', userId);
            console.log('📊 Income results:', income.length);
            console.log('📊 Expense results:', expenses.length);
            allTransactions = [...income, ...expenses];
        }

        allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        const totalIncome = allTransactions
            .filter(t => t.type === 'Thu')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);

        const totalExpense = allTransactions
            .filter(t => t.type === 'Chi')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);

        const profit = totalIncome - totalExpense;

        res.json({
            success: true,
            data: allTransactions,
            summary: {
                totalIncome,
                totalExpense,
                profit,
            },
        });
    } catch (err) {
        console.error('❌ Lỗi getExpenses:', err);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách thu chi',
        });
    }
};
