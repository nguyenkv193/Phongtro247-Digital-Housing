import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

const InsufficientBalanceModal = ({ show, onClose, currentBalance, requiredFee }) => {
    const navigate = useNavigate();

    if (!show) return null;

    const handleDeposit = () => {
        onClose();
        navigate('/landlord/deposit');
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                        <FontAwesomeIcon
                            icon={faExclamationTriangle}
                            className="text-orange-500 text-xl"
                        />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Số dư không đủ</h3>
                </div>

                <div className="space-y-3 mb-6">
                    <p className="text-gray-600">
                        Loại hình này yêu cầu thanh toán phí đăng tin trước khi đăng bài.
                    </p>

                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Số dư hiện tại:</span>
                            <span className="font-semibold text-gray-900">
                                {new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND',
                                }).format(currentBalance)}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Phí đăng tin:</span>
                            <span className="font-semibold text-orange-500">
                                {new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND',
                                }).format(requiredFee)}
                            </span>
                        </div>
                        <div className="pt-2 border-t border-gray-200">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Cần nạp thêm:</span>
                                <span className="font-bold text-red-500">
                                    {new Intl.NumberFormat('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND',
                                    }).format(Math.max(0, requiredFee - currentBalance))}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleDeposit}
                        className="flex-1 px-4 py-2 bg-[#006ffd] text-white rounded-lg hover:opacity-80 transition-opacity"
                    >
                        Nạp tiền ngay
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InsufficientBalanceModal;
