import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AccommodationInfo = () => {
    const [accommodationData, setAccommodationData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchAccommodationInfo();
    }, []);

    const fetchAccommodationInfo = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('auth_token');

            if (!token) {
                throw new Error('Bạn cần đăng nhập để xem thông tin này.');
            }

            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5175';
            const url = `${API_URL}/api/tenants/my-info`;

            console.log('📡 Calling API:', url);

            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log('✅ Response:', response.data);

            if (response.data.success) {
                setAccommodationData(response.data.data);
            }
        } catch (err) {
            console.error('❌ Error fetching accommodation info:', err);
            console.error('Response:', err.response?.data);
            console.error('Status:', err.response?.status);

            if (err.response?.status === 404) {
                setAccommodationData(null);
                setError(null);
            } else {
                setError(err.response?.data?.message || err.message || 'Đã có lỗi xảy ra.');
            }
        } finally {
            setLoading(false);
        }
    };

    const formatDate = dateString => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    if (loading) {
        return (
            <div className="p-6">
                <h2 className="text-lg font-semibold text-[#2e2a2a] uppercase mb-4">
                    Thông tin lưu trú
                </h2>
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    if (error || !accommodationData) {
        return (
            <div className="p-6">
                <h2 className="text-lg font-semibold text-[#2e2a2a] uppercase">
                    Thông tin lưu trú
                </h2>

                <div className="text-center py-12">
                    <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="w-12 h-12 text-gray-400"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Chưa có thông tin lưu trú
                    </h3>
                    <p className="text-gray-500 mb-6">
                        Bạn chưa có thông tin lưu trú nào được lưu trong hệ thống.
                    </p>
                    <button
                        onClick={() => navigate('/all')}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
                    >
                        Tìm kiếm chỗ ở
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-[#2e2a2a] uppercase">
                    Thông tin phòng trọ
                </h2>
                {accommodationData.contract?.listing_id && (
                    <button
                        onClick={() =>
                            navigate(`/listing/${accommodationData.contract.listing_id}`)
                        }
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                        Xem chi tiết →
                    </button>
                )}
            </div>

            {accommodationData.contract ? (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden p-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-4">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    stroke="currentColor"
                                    className="w-6 h-6 text-white"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                                    />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h4 className="text-lg font-semibold text-gray-900 mb-1">
                                    {accommodationData.contract.listing_name}
                                </h4>
                                <p className="text-sm text-gray-600">
                                    {accommodationData.contract.listing_address}
                                </p>
                                {accommodationData.contract.listing_type_name && (
                                    <span className="inline-block mt-2 px-2 py-1 bg-white rounded text-xs font-medium text-gray-700">
                                        {accommodationData.contract.listing_type_name}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <p className="text-sm text-gray-500">Giá thuê</p>
                            <p className="text-base font-semibold text-blue-600">
                                {accommodationData.contract.rent_price?.toLocaleString('vi-VN')}{' '}
                                VNĐ/tháng
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Tiền cọc</p>
                            <p className="text-base font-medium text-gray-900">
                                {accommodationData.contract.deposit_price?.toLocaleString('vi-VN')}{' '}
                                VNĐ
                            </p>
                        </div>
                        {accommodationData.contract.listing_area && (
                            <div>
                                <p className="text-sm text-gray-500">Diện tích</p>
                                <p className="text-base font-medium text-gray-900">
                                    {accommodationData.contract.listing_area} m²
                                </p>
                            </div>
                        )}
                        <div>
                            <p className="text-sm text-gray-500">Trạng thái hợp đồng</p>
                            <span
                                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                    accommodationData.contract.contract_status === 'Đang hiệu lực'
                                        ? 'bg-green-100 text-green-800'
                                        : accommodationData.contract.contract_status ===
                                          'Sắp hết hạn'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : accommodationData.contract.contract_status === 'Hết hạn'
                                        ? 'bg-orange-100 text-orange-800'
                                        : 'bg-gray-100 text-gray-800'
                                }`}
                            >
                                {accommodationData.contract.contract_status || 'Không xác định'}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <p className="text-sm text-gray-500">Ngày bắt đầu</p>
                            <p className="text-base font-medium text-gray-900">
                                {formatDate(accommodationData.contract.start_date)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Ngày kết thúc</p>
                            <p className="text-base font-medium text-gray-900">
                                {formatDate(accommodationData.contract.end_date)}
                            </p>
                        </div>
                    </div>

                    {/* Thông tin chủ trọ */}
                    <div className="border-t border-gray-200 pt-4 mt-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">
                            Thông tin chủ trọ
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Họ và tên</p>
                                <p className="text-base font-medium text-gray-900">
                                    {accommodationData.contract.landlord_name || 'Chưa cập nhật'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Số điện thoại</p>
                                <p className="text-base font-medium text-gray-900">
                                    {accommodationData.contract.landlord_phone || 'Chưa cập nhật'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="text-base font-medium text-gray-900">
                                    {accommodationData.contract.landlord_email || 'Chưa cập nhật'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {accommodationData.contract.note && (
                        <div className="border-t border-gray-200 pt-4 mt-4">
                            <p className="text-sm text-gray-500 mb-1">Ghi chú</p>
                            <p className="text-sm text-gray-700">
                                {accommodationData.contract.note}
                            </p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="text-center py-8">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="w-12 h-12 text-gray-400 mx-auto mb-3"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                            />
                        </svg>
                        <p className="text-sm text-gray-600">Chưa có hợp đồng thuê phòng nào</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccommodationInfo;
