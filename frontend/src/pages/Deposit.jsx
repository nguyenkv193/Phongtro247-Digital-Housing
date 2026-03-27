import React, { useState } from 'react';
import PaymentPage from './PaymentPage';
import { useUser } from '../../contexts/UserContext';

const Deposit = () => {
    const [selectedAmount, setSelectedAmount] = useState(null);
    const [customAmount, setCustomAmount] = useState('');
    const [showPaymentPage, setShowPaymentPage] = useState(false);
    const { currentUser } = useUser();

    const username = currentUser?.full_name || 'Người dùng';

    const denominations = [
        50000,
        100000,
        200000,
        300000,
        500000,
        1000000,
        1500000,
        2000000,
        'Khác',
    ];

    const handleSelect = value => {
        setSelectedAmount(value);
        if (value !== 'Khác') setCustomAmount('');
    };

    const displayAmount =
        selectedAmount === 'Khác' ? Number(customAmount) || 0 : selectedAmount || 0;

    const handleProceed = () => {
        if (displayAmount > 0) setShowPaymentPage(true);
    };

    if (showPaymentPage) {
        return <PaymentPage amount={displayAmount} username={username} />;
    }

    return (
        <div className="bg-white p-8 rounded-lg shadow-md max-w-3xl mx-auto">
            <h2 className="text-lg font-semibold mb-3 text-[#2e2a2a] uppercase">
                Nạp tiền vào tài khoản
            </h2>

            {/* Chọn mệnh giá */}
            <div className="mb-6">
                <h3 className="text-[15px] text-[#2e2a2a] font-[300] py-3 border-t border-t-gray-200">
                    Chọn nhanh số tiền nạp:
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {denominations.map((amount, i) => (
                        <button
                            key={i}
                            onClick={() => handleSelect(amount)}
                            className={`border border-gray-200 text-[#2e2a2a] cursor-pointer rounded-lg py-3 px-4  font-[300] transition-all flex items-center gap-x-2 group`}
                        >
                            <span
                                className={`inline-block w-[20px] h-[20px] rounded-full transition-all duration-200
                                ${
                                    selectedAmount === amount
                                        ? 'border-4 border-blue-600'
                                        : 'border-[2px] border-[#c5c6cc] group-hover:border-[#006ffd]'
                                }`}
                            />
                            <span className="text-sm sm:text-[15px]">
                                {amount === 'Khác'
                                    ? 'Số khác'
                                    : `${Number(amount).toLocaleString()} đ`}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Nhập số tiền khác */}
            {selectedAmount === 'Khác' && (
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Nhập số tiền:</h3>
                    <div className="flex items-center border rounded-lg px-4 py-2 w-60">
                        <span className="text-gray-600 mr-2">VND:</span>
                        <input
                            type="number"
                            min="1000"
                            placeholder="Nhập số tiền"
                            value={customAmount}
                            onChange={e => setCustomAmount(e.target.value)}
                            className="outline-none flex-1"
                        />
                    </div>
                </div>
            )}

            {/* Chi tiết giao dịch */}
            <div className="mb-8">
                <h3 className="text-sm font-[500] mb-4 uppercase">Chi tiết giao dịch:</h3>
                <div className="text-[#2e2a2a] font-[300]">
                    <div className="flex justify-between py-2 border-b border-b-[#f4f4f4]">
                        <span className="text-[15px]">Số tiền thanh toán:</span>
                        <span className="font-semibold text-[15px]">
                            {Number(displayAmount || 0).toLocaleString()} đ
                        </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-b-[#f4f4f4]">
                        <span className="text-[15px]">Nạp vào tài khoản:</span>
                        <span className="font-semibold text-[15px]">{username}</span>
                    </div>
                </div>
            </div>

            {/* Nút chuyển tiền */}
            <div className="text-center">
                <button
                    disabled={!displayAmount}
                    onClick={handleProceed}
                    className={`px-[16px] py-[11px] rounded-lg text-sm font-[500] cursor-pointer ${
                        displayAmount
                            ? 'bg-[#006ffd] text-white hover:opacity-80 transition'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                    Chuyển tiền
                </button>
            </div>
        </div>
    );
};

export default Deposit;
