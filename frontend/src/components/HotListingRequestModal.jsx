import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFire, faXmark, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const HotListingRequestModal = ({ show, onClose, listingId, listingName }) => {
    const API_URL = import.meta.env.VITE_API_URL;
    const [note, setNote] = useState('');
    const [durationDays, setDurationDays] = useState(30);
    const [loading, setLoading] = useState(false);

    const HOT_LISTING_BASE_FEE = 300000;
    const calculateFee = days => {
        return (HOT_LISTING_BASE_FEE / 30) * days;
    };

    const formatCurrency = amount => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.post(
                `${API_URL}/api/hot-listings/request`,
                {
                    listing_id: listingId,
                    duration_days: durationDays,
                    note: note,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (response.data.success) {
                alert(response.data.message);
                setNote('');
                setDurationDays(30);
                onClose();
                window.location.reload();
            }
        } catch (error) {
            console.error('Error requesting hot listing:', error);
            alert(error.response?.data?.message || 'Có lỗi xảy ra!');
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <FontAwesomeIcon icon={faXmark} className="text-xl" />
                </button>

                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                        <FontAwesomeIcon icon={faFire} className="text-white text-xl" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Yêu cầu Hot Listing</h2>
                        <p className="text-sm text-gray-500">{listingName}</p>
                    </div>
                </div>

                <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex gap-2">
                        <FontAwesomeIcon icon={faInfoCircle} className="text-orange-600 mt-0.5" />
                        <div className="text-sm text-gray-700">
                            <p className="font-semibold mb-1">Lợi ích Hot Listing:</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Tin đăng hiển thị ở vị trí ưu tiên</li>
                                <li>Badge "HOT" nổi bật trên tin đăng</li>
                                <li>Tăng lượt xem lên đến 300%</li>
                                <li>Phí sẽ được trừ sau khi admin duyệt</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Thời gian hot (ngày)
                        </label>
                        <select
                            value={durationDays}
                            onChange={e => setDurationDays(parseInt(e.target.value))}
                            className="w-full border border-gray-300 rounded-lg p-3 text-sm outline-none focus:border-orange-500"
                        >
                            <option value={7}>7 ngày - {formatCurrency(calculateFee(7))}</option>
                            <option value={15}>15 ngày - {formatCurrency(calculateFee(15))}</option>
                            <option value={30}>30 ngày - {formatCurrency(calculateFee(30))}</option>
                            <option value={60}>60 ngày - {formatCurrency(calculateFee(60))}</option>
                            <option value={90}>90 ngày - {formatCurrency(calculateFee(90))}</option>
                        </select>
                    </div>

                    <div className="mb-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-700 font-medium">Tổng phí:</span>
                            <span className="text-2xl font-bold text-orange-600">
                                {formatCurrency(calculateFee(durationDays))}
                            </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                            Giá cơ bản: {formatCurrency(HOT_LISTING_BASE_FEE)}/30 ngày
                        </p>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ghi chú cho Admin (không bắt buộc)
                        </label>
                        <textarea
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            rows="3"
                            placeholder="VD: Yêu cầu đặc biệt, thời gian ưu tiên..."
                            className="w-full border border-gray-300 rounded-lg p-3 text-sm outline-none focus:border-orange-500"
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:shadow-lg transition disabled:opacity-50"
                        >
                            {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default HotListingRequestModal;
