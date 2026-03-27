import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';

const PaymentResult = () => {
    const [status, setStatus] = useState('loading');
    const [orderInfo, setOrderInfo] = useState(null);
    const { refreshUser } = useUser();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const orderId = urlParams.get('orderId');
        const resultCode = urlParams.get('resultCode');
        const message = urlParams.get('message');
        const amount = urlParams.get('amount');

        console.log('Payment Result Params:', { orderId, resultCode, message, amount });

        if (resultCode === '0') {
            setStatus('success');
            setOrderInfo({
                orderId,
                amount,
                message: 'Thanh toán thành công',
            });

            setTimeout(() => {
                refreshUser();
                console.log('✅ Đã refresh user balance');
            }, 2000);
        } else {
            setStatus('failed');
            setOrderInfo({
                orderId,
                amount,
                message: message || 'Thanh toán thất bại',
            });
        }

        if (orderId) {
            checkPaymentStatus(orderId);
        }
    }, [refreshUser]);

    const checkPaymentStatus = async orderId => {
        try {
            const response = await fetch('http://localhost:5175/api/payment/momo/check-status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ orderId }),
            });

            const data = await response.json();
            console.log('Payment Status Check:', data);

            if (data.resultCode === 0) {
                setStatus('success');
                refreshUser();
            } else if (data.resultCode) {
                setStatus('failed');
            }
        } catch (error) {
            console.error('Check status error:', error);
        }
    };

    const handleBackToHome = () => {
        refreshUser();
        window.location.href = '/landlord-dashboard';
    };

    const handleRetry = () => {
        window.location.href = '/deposit';
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">Đang xác nhận thanh toán...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
                <div className="text-center">
                    {status === 'success' ? (
                        <>
                            <div className="mb-4">
                                <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                Thanh toán thành công!
                            </h2>
                            <p className="text-gray-600 mb-6">
                                Giao dịch của bạn đã được xử lý thành công
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="mb-4">
                                <XCircle className="w-20 h-20 text-red-500 mx-auto" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                Thanh toán thất bại
                            </h2>
                            <p className="text-gray-600 mb-6">
                                {orderInfo?.message ||
                                    'Đã có lỗi xảy ra trong quá trình thanh toán'}
                            </p>
                        </>
                    )}

                    {orderInfo && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
                            {orderInfo.orderId && (
                                <p className="text-sm text-gray-600">
                                    Mã đơn hàng:{' '}
                                    <span className="font-mono font-semibold text-gray-800">
                                        {orderInfo.orderId}
                                    </span>
                                </p>
                            )}
                            {orderInfo.amount && (
                                <p className="text-sm text-gray-600">
                                    Số tiền:{' '}
                                    <span className="font-semibold text-[#006ffd]">
                                        {Number(orderInfo.amount).toLocaleString()} đ
                                    </span>
                                </p>
                            )}
                        </div>
                    )}

                    <div className="space-y-3">
                        <button
                            onClick={handleBackToHome}
                            className="w-full bg-[#006ffd] text-white py-3 rounded-lg font-medium hover:opacity-90 transition"
                        >
                            Về trang chủ trọ
                        </button>
                        {status === 'failed' && (
                            <button
                                onClick={handleRetry}
                                className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
                            >
                                Thử lại
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentResult;
