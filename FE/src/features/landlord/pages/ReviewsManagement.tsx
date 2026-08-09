import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import type { EntityId } from '@/types';

interface ManagedReview {
    id: EntityId;
    name?: string;
    room?: string;
    rating: number;
    comment?: string;
    date: string;
}

const ReviewsManagement = () => {
    const [reviews, setReviews] = useState<ManagedReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedReview, setSelectedReview] = useState<ManagedReview | null>(null);
    const [filter, setFilter] = useState('all');
    useEffect(() => {
        const fetchMyReviews = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('auth_token');

                if (!token) {
                    throw new Error('Bạn cần đăng nhập để xem chức năng này.');
                }

                const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') || '';
                const response = await axios.get(`${API_URL}/api/reviews/my-listings`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.data.success) {
                    setReviews(response.data.data);
                } else {
                    throw new Error('Không thể tải dữ liệu đánh giá.');
                }
            } catch (err: unknown) {
                const message = axios.isAxiosError<{ message?: string }>(err)
                    ? err.response?.data?.message
                    : err instanceof Error
                    ? err.message
                    : undefined;
                setError(message || 'Đã có lỗi xảy ra.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchMyReviews();
    }, []);

    const filteredReviews =
        filter === 'all' ? reviews : reviews.filter(r => r.rating === Number(filter));

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-lg shadow text-center">
                <p>Đang tải danh sách đánh giá...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white p-6 rounded-lg shadow text-center text-red-500">
                <p>Lỗi: {error}</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4 text-[#2e2a2a] uppercase">
                KHÁCH HÀNG ĐÁNH GIÁ
            </h2>

            {/* Bộ lọc */}
            <div className="flex items-center justify-between mb-4">
                <div className="text-gray-700 font-medium text-sm">
                    Tổng số đánh giá:{' '}
                    <span className="text-[#1976d2] font-bold">{reviews.length}</span>
                </div>
                <select
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                    className="border rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-[#1976d2] text-sm"
                >
                    <option value="all">Tất cả</option>
                    <option value="5">5 sao</option>
                    <option value="4">4 sao</option>
                    <option value="3">3 sao</option>
                    <option value="2">2 sao</option>
                    <option value="1">1 sao</option>
                </select>
            </div>

            {/* Bảng đánh giá */}
            <div className="w-full overflow-x-auto scrollbar-thin">
                <table className="min-w-[900px] w-full text-sm border-collapse">
                    <thead>
                        {/* Header của bảng  */}
                        <tr className="bg-[#f9f9f9] text-[#2e2a2a] text-sm">
                            <th className="border border-[#eaecf0] p-2 text-center font-[500]">
                                Khách hàng
                            </th>
                            <th className="border border-[#eaecf0] p-2 text-center font-[500]">
                                Phòng / Nhà
                            </th>
                            <th className="border border-[#eaecf0] p-2 text-center font-[500]">
                                Đánh giá
                            </th>
                            <th className="border border-[#eaecf0] p-2 text-center font-[500]">
                                Bình luận
                            </th>
                            <th className="border border-[#eaecf0] p-2 text-center font-[500]">
                                Ngày
                            </th>
                            <th className="border border-[#eaecf0] p-2 text-center font-[500]">
                                Hành động
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {/*Xử lý trường hợp không có đánh giá nào */}
                        {filteredReviews.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center p-4 text-gray-500">
                                    Chưa có đánh giá nào cho tin đăng của bạn.
                                </td>
                            </tr>
                        ) : (
                            filteredReviews.map(r => (
                                <tr key={r.id} className="hover:bg-[#f9fcff] transition">
                                    <td className="border border-[#eaecf0] p-3 text-sm text-center">
                                        {r.name}
                                    </td>
                                    <td className="border border-[#eaecf0] p-3 text-sm text-center">
                                        {r.room}
                                    </td>
                                    <td className="border border-[#eaecf0] p-3 text-sm text-center">
                                        {[...Array(5)].map((_, i) => (
                                            <FontAwesomeIcon
                                                key={i}
                                                icon={faStar}
                                                className={`text-xs ${
                                                    i < r.rating
                                                        ? 'text-yellow-400'
                                                        : 'text-gray-300'
                                                }`}
                                            />
                                        ))}
                                    </td>
                                    <td className="border border-[#eaecf0] p-3 text-sm text-center">
                                        {r.comment}
                                    </td>
                                    <td className="border border-[#eaecf0] p-3 text-sm text-center">
                                        {new Date(r.date).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="border border-[#eaecf0] p-3 text-sm text-center">
                                        <button
                                            className="text-[#1976d2] hover:underline"
                                            onClick={() => setSelectedReview(r)}
                                        >
                                            Xem
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Popup chi tiết đánh giá */}
            {selectedReview && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
                        <h3 className="text-lg font-bold text-[#1976d2] mb-4">Chi tiết đánh giá</h3>
                        <div className="space-y-2 text-gray-700">
                            <p>
                                <span className="font-semibold">Khách hàng:</span>{' '}
                                {selectedReview.name}
                            </p>
                            <p>
                                <span className="font-semibold">Phòng / Nhà:</span>{' '}
                                {selectedReview.room}
                            </p>
                            <p className="flex items-center gap-1">
                                <span className="font-semibold">Đánh giá:</span>
                                {[...Array(5)].map((_, i) => (
                                    <FontAwesomeIcon
                                        key={i}
                                        icon={faStar}
                                        className={`${
                                            i < selectedReview.rating
                                                ? 'text-yellow-400'
                                                : 'text-gray-300'
                                        }`}
                                    />
                                ))}
                            </p>
                            <p>
                                <span className="font-semibold">Ngày:</span>{' '}
                                {new Date(selectedReview.date).toLocaleDateString('vi-VN')}
                            </p>
                            <p>
                                <span className="font-semibold">Bình luận:</span>
                                <br />
                                {selectedReview.comment}
                            </p>
                        </div>
                        <div className="mt-6 text-right">
                            <button
                                onClick={() => setSelectedReview(null)}
                                className="bg-[#1976d2] text-white px-4 py-2 rounded font-semibold hover:bg-[#125ea6] transition"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReviewsManagement;
