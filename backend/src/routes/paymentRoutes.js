const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const https = require('https');
const pool = require('../config/db');

router.post('/momo/create', async (req, res) => {
    try {
        const { amount, orderInfo, userId } = req.body;

        if (!amount || amount < 1000) {
            return res.status(400).json({
                success: false,
                message: 'Số tiền phải lớn hơn 1000 VND',
            });
        }

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin người dùng',
            });
        }

        const accessKey = process.env.MOMO_ACCESS_KEY || 'F8BBA842ECF85';
        const secretKey = process.env.MOMO_SECRET_KEY || 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
        const partnerCode = process.env.MOMO_PARTNER_CODE || 'MOMO';
        const redirectUrl = process.env.MOMO_REDIRECT_URL || 'http://localhost:5173/payment-result';
        const ipnUrl =
            process.env.MOMO_IPN_URL || 'http://localhost:5175/api/payment/momo/callback';
        const requestType = 'payWithMethod';
        const orderId = partnerCode + new Date().getTime();
        const requestId = orderId;
        const extraData = Buffer.from(JSON.stringify({ userId: userId })).toString('base64');
        const orderGroupId = '';
        const autoCapture = true;
        const lang = 'vi';

        const rawSignature =
            'accessKey=' +
            accessKey +
            '&amount=' +
            amount +
            '&extraData=' +
            extraData +
            '&ipnUrl=' +
            ipnUrl +
            '&orderId=' +
            orderId +
            '&orderInfo=' +
            orderInfo +
            '&partnerCode=' +
            partnerCode +
            '&redirectUrl=' +
            redirectUrl +
            '&requestId=' +
            requestId +
            '&requestType=' +
            requestType;

        console.log('--------------------RAW SIGNATURE----------------');
        console.log(rawSignature);

        const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

        console.log('--------------------SIGNATURE----------------');
        console.log(signature);

        const requestBody = JSON.stringify({
            partnerCode: partnerCode,
            partnerName: 'Test',
            storeId: 'MomoTestStore',
            requestId: requestId,
            amount: amount,
            orderId: orderId,
            orderInfo: orderInfo,
            redirectUrl: redirectUrl,
            ipnUrl: ipnUrl,
            lang: lang,
            requestType: requestType,
            autoCapture: autoCapture,
            extraData: extraData,
            orderGroupId: orderGroupId,
            signature: signature,
        });

        const options = {
            hostname: 'test-payment.momo.vn',
            port: 443,
            path: '/v2/gateway/api/create',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(requestBody),
            },
        };

        const momoReq = https.request(options, momoRes => {
            console.log(`Status: ${momoRes.statusCode}`);

            momoRes.setEncoding('utf8');
            let body = '';

            momoRes.on('data', chunk => {
                body += chunk;
            });

            momoRes.on('end', async () => {
                console.log('MoMo Response:', body);

                try {
                    const jsonResponse = JSON.parse(body);
                    console.log('resultCode:', jsonResponse.resultCode);

                    if (jsonResponse.resultCode === 0) {
                        try {
                            const sql = `INSERT INTO transactions (user_id, type, amount, description) 
                                         VALUES (?, 'deposit', ?, ?)`;
                            const [result] = await pool.execute(sql, [
                                userId,
                                amount,
                                `Nạp tiền qua MoMo - OrderID: ${orderId}`,
                            ]);
                            console.log('✅ Đã tạo transaction pending:', result.insertId);
                        } catch (dbError) {
                            console.error('Lỗi lưu transaction:', dbError);
                        }

                        res.json({
                            success: true,
                            payUrl: jsonResponse.payUrl,
                            orderId: orderId,
                            deeplink: jsonResponse.deeplink,
                            qrCodeUrl: jsonResponse.qrCodeUrl,
                            message: 'Tạo đơn hàng thành công',
                        });
                    } else {
                        res.status(400).json({
                            success: false,
                            message: jsonResponse.message || 'Tạo đơn hàng thất bại',
                            resultCode: jsonResponse.resultCode,
                        });
                    }
                } catch (error) {
                    console.error('Parse error:', error);
                    res.status(500).json({
                        success: false,
                        message: 'Lỗi xử lý phản hồi từ MoMo',
                    });
                }
            });
        });

        momoReq.on('error', e => {
            console.log(`Problem with request: ${e.message}`);
            res.status(500).json({
                success: false,
                message: 'Lỗi kết nối đến MoMo',
            });
        });

        console.log('Sending to MoMo....');
        momoReq.write(requestBody);
        momoReq.end();
    } catch (error) {
        console.error('Payment creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi tạo đơn thanh toán',
        });
    }
});

router.post('/momo/callback', async (req, res) => {
    console.log('========== MoMo CALLBACK ==========');
    console.log(req.body);

    let connection;

    try {
        const {
            orderId,
            requestId,
            amount,
            orderInfo,
            partnerCode,
            resultCode,
            message,
            responseTime,
            extraData,
            signature,
            transId,
            payType,
            orderType,
        } = req.body;

        const secretKey = process.env.MOMO_SECRET_KEY || 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
        const accessKey = process.env.MOMO_ACCESS_KEY || 'F8BBA842ECF85';

        const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${
            orderType || 'momo_wallet'
        }&partnerCode=${partnerCode}&payType=${
            payType || 'qr'
        }&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;

        const calculatedSignature = crypto
            .createHmac('sha256', secretKey)
            .update(rawSignature)
            .digest('hex');

        console.log('Signature Match:', signature === calculatedSignature);

        if (signature !== calculatedSignature) {
            console.log('❌ Signature không hợp lệ!');
            return res.status(200).json({ message: 'Invalid signature' });
        }

        if (resultCode === 0) {
            console.log('✅ Thanh toán thành công:', orderId);

            try {
                const userInfo = JSON.parse(Buffer.from(extraData, 'base64').toString());
                const userId = userInfo.userId;

                console.log('🔍 User ID:', userId);
                console.log('💰 Amount to add:', amount);

                connection = await pool.getConnection();
                await connection.beginTransaction();

                try {
                    const updateBalanceSql = 'UPDATE users SET balance = balance + ? WHERE id = ?';
                    const [updateResult] = await connection.execute(updateBalanceSql, [
                        amount,
                        userId,
                    ]);
                    console.log('✅ Đã cộng tiền, affected rows:', updateResult.affectedRows);

                    const [checkBalance] = await connection.execute(
                        'SELECT balance FROM users WHERE id = ?',
                        [userId]
                    );
                    console.log('💵 Balance mới:', checkBalance[0]?.balance);

                    const insertTransactionSql = `
                INSERT INTO transactions (user_id, type, amount, description) 
                VALUES (?, 'deposit', ?, ?)
            `;
                    const transactionDesc = `Nạp tiền qua MoMo thành công - OrderID: ${orderId} - TransID: ${transId}`;
                    await connection.execute(insertTransactionSql, [
                        userId,
                        amount,
                        transactionDesc,
                    ]);
                    console.log('✅ Đã lưu lịch sử giao dịch');

                    await connection.commit();
                    console.log('✅ Transaction hoàn tất thành công!');

                    return res.status(204).send();
                } catch (dbError) {
                    await connection.rollback();
                    console.error('❌ Database error:', dbError);
                    return res.status(200).send();
                }
            } catch (decodeError) {
                console.error('❌ Decode extraData error:', decodeError);
                return res.status(200).send();
            } finally {
                if (connection) connection.release();
            }
        } else {
            console.log('❌ Thanh toán thất bại:', orderId, message);

            try {
                const userInfo = JSON.parse(Buffer.from(extraData, 'base64').toString());
                const sql = `INSERT INTO transactions (user_id, type, amount, description) 
                             VALUES (?, 'deposit', 0, ?)`;
                await pool.execute(sql, [
                    userInfo.userId,
                    `Nạp tiền thất bại - OrderID: ${orderId} - ${message}`,
                ]);
            } catch (e) {
                console.error('Lỗi lưu transaction thất bại:', e);
            }

            return res.status(204).send();
        }
    } catch (error) {
        console.error('Callback error:', error);
        if (connection) {
            try {
                await connection.rollback();
                connection.release();
            } catch (e) {
                console.error('Rollback error:', e);
            }
        }
        return res.status(200).send();
    }
});

router.post('/momo/check-status', (req, res) => {
    try {
        const { orderId } = req.body;

        const accessKey = process.env.MOMO_ACCESS_KEY || 'F8BBA842ECF85';
        const secretKey = process.env.MOMO_SECRET_KEY || 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
        const partnerCode = process.env.MOMO_PARTNER_CODE || 'MOMO';
        const requestId = orderId;

        const rawSignature = `accessKey=${accessKey}&orderId=${orderId}&partnerCode=${partnerCode}&requestId=${requestId}`;
        const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

        const requestBody = JSON.stringify({
            partnerCode,
            requestId,
            orderId,
            signature,
            lang: 'vi',
        });

        const options = {
            hostname: 'test-payment.momo.vn',
            port: 443,
            path: '/v2/gateway/api/query',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(requestBody),
            },
        };

        const momoReq = https.request(options, momoRes => {
            let body = '';

            momoRes.on('data', chunk => {
                body += chunk;
            });

            momoRes.on('end', () => {
                try {
                    const response = JSON.parse(body);
                    res.json(response);
                } catch (error) {
                    res.status(500).json({
                        success: false,
                        message: 'Lỗi xử lý phản hồi',
                    });
                }
            });
        });

        momoReq.on('error', e => {
            console.error('Check status error:', e);
            res.status(500).json({
                success: false,
                message: 'Lỗi kiểm tra trạng thái',
            });
        });

        momoReq.write(requestBody);
        momoReq.end();
    } catch (error) {
        console.error('Check status error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi kiểm tra trạng thái',
        });
    }
});

module.exports = router;
