import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5175';

const Listings = () => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchListings = async () => {
            try {
                const res = await axios.get(`${API_BASE}/api/admin/adminlistings`);
                const sortedData = Array.isArray(res.data)
                    ? res.data.sort((a, b) => a.id - b.id)
                    : [];
                setListings(sortedData);
            } catch (err) {
                console.error('❌ Lỗi khi tải tin đăng:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchListings();
    }, []);

    const handleApprove = async (listingId, newStatus) => {
        try {
            await axios.put(`${API_BASE}/api/admin/adminlistings/${listingId}/status`, {
                status: newStatus,
            });
            setListings(prev =>
                prev.map(l => (l.id === listingId ? { ...l, status: newStatus } : l))
            );
        } catch (err) {
            console.error('❌ Lỗi khi cập nhật trạng thái:', err);
        }
    };

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                            <svg
                                className="w-5 h-5 md:w-6 md:h-6 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-lg md:text-xl font-bold text-gray-900">
                                Quản lý Tin đăng
                            </h1>
                            <p className="text-gray-500 text-xs md:text-sm mt-0.5 hidden sm:block">
                                Duyệt và quản lý tất cả tin đăng trên hệ thống
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 px-4 md:px-5 py-2 md:py-3 rounded-xl border border-blue-200">
                            <div className="text-xs text-blue-600 font-medium mb-0.5">
                                Tổng tin đăng
                            </div>
                            <div className="text-xl md:text-2xl font-bold text-blue-700">
                                {listings.length}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <p className="text-center text-gray-500 italic p-4">Đang tải dữ liệu...</p>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-gray-200">
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                        STT
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                        Loại hình
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                        Tiêu đề
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                        Phòng
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                        Địa chỉ
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                        Chủ trọ
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                        Nhãn
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                        Trạng thái
                                    </th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {listings.length > 0 ? (
                                    listings.map((listing, index) => (
                                        <tr
                                            key={listing.id}
                                            className="hover:bg-blue-50 transition-colors"
                                        >
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {index + 1}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {listing.listing_type_name}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                {listing.name}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {listing.room_count || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {listing.address || '—'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {listing.owner_name}
                                            </td>

                                            <td className="px-6 py-4">
                                                <span
                                                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                                                        listing.is_hot
                                                            ? 'bg-orange-100 text-orange-700'
                                                            : 'bg-gray-100 text-gray-600'
                                                    }`}
                                                >
                                                    {listing.is_hot ? '🔥 Hot' : 'Normal'}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-block px-2 text-center py-1 text-xs font-medium rounded ${
                                                        listing.status === 'published'
                                                            ? 'bg-green-100 text-green-800'
                                                            : listing.status === 'rejected'
                                                            ? 'bg-red-100 text-red-800'
                                                            : 'bg-yellow-100 text-yellow-800'
                                                    }`}
                                                >
                                                    {listing.status === 'published'
                                                        ? 'Đã duyệt'
                                                        : listing.status === 'rejected'
                                                        ? 'Từ chối'
                                                        : 'Chờ duyệt'}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() =>
                                                            handleApprove(listing.id, 'published')
                                                        }
                                                        className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-md transition-colors"
                                                    >
                                                        Duyệt
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleApprove(listing.id, 'rejected')
                                                        }
                                                        className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                                                    >
                                                        Từ chối
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="9"
                                            className="text-center text-gray-500 p-4 italic"
                                        >
                                            Không có dữ liệu hiển thị
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Listings;
