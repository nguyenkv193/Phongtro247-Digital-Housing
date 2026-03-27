import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';

const PaymentPage = ({ amount = 0, username = 'Người dùng' }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { currentUser } = useUser();

    const handlePayment = async () => {
        try {
            setLoading(true);
            setError('');

            if (!currentUser || !currentUser.id) {
                setError('Vui lòng đăng nhập để thực hiện giao dịch');
                setLoading(false);
                return;
            }

            console.log('Current user:', currentUser);
            console.log('User ID:', currentUser.id);

            const response = await fetch('http://localhost:5175/api/payment/momo/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: amount,
                    orderInfo: `Nạp tiền tài khoản ${username}`,
                    userId: currentUser.id,
                }),
            });

            const data = await response.json();
            console.log('Payment response:', data);

            if (data.success && data.payUrl) {
                window.location.href = data.payUrl;
            } else {
                setError(data.message || 'Không thể tạo đơn thanh toán');
            }
        } catch (err) {
            console.error('Payment error:', err);
            setError('Có lỗi xảy ra khi kết nối đến server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white py-8 px-6 sm:px-16 rounded-lg shadow-md mx-auto max-w-2xl">
            <h2 className="text-lg font-semibold mb-6 text-[#2e2a2a] uppercase text-center">
                Thanh toán nạp tiền
            </h2>

            <div className="border border-gray-200 rounded-lg p-6 bg-[#f9fafc] mb-6">
                <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-[15px]">Người nạp:</span>
                        <strong className="text-[#2e2a2a]">{username}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-[15px]">Số tiền:</span>
                        <strong className="text-[#006ffd] text-lg">
                            {Number(amount || 0).toLocaleString()} đ
                        </strong>
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <img
                            src="https://developers.momo.vn/v3/assets/images/icon-52bd5808cecdb1970e1aeec3c31a3ee1.png"
                            alt="MoMo"
                            className="w-10 h-10"
                        />
                        <span className="text-sm font-medium text-gray-700">
                            Thanh toán qua Ví MoMo
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 text-center">
                        Bạn sẽ được chuyển đến trang thanh toán MoMo
                    </p>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm text-center">{error}</p>
                </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                    onClick={() => window.history.back()}
                    className="px-6 py-3 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
                    disabled={loading}
                >
                    Quay lại
                </button>
                <button
                    onClick={handlePayment}
                    disabled={loading || !amount || !currentUser}
                    className={`px-8 py-3 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 ${
                        loading || !amount || !currentUser
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-[#006ffd] text-white hover:opacity-90'
                    }`}
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Đang xử lý...</span>
                        </>
                    ) : (
                        'Thanh toán với MoMo'
                    )}
                </button>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-xs text-gray-600 text-center">
                    💡 <strong>Lưu ý:</strong> Sau khi thanh toán thành công, số tiền sẽ được cộng
                    vào tài khoản của bạn trong vòng 1-2 phút
                </p>
            </div>
        </div>
    );
};

export default PaymentPage;
