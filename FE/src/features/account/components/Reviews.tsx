import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';
import { useNavigate } from '@/lib/navigation/router-compat';
import type { EntityId, Review } from '@/types';

const Reviews = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchMyReviews();
    }, []);

    const fetchMyReviews = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('auth_token');

            if (!token) {
                throw new Error('Bạn cần đăng nhập để xem thông tin này.');
            }

            const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5175') || 'http://localhost:5175';

            const response = await axios.get(`${API_URL}/api/reviews/my-reviews`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.success) {
                setReviews(response.data.data as Review[]);
            }
        } catch (err: unknown) {
            setError(
                (axios.isAxiosError<{ message?: string }>(err) ? err.response?.data?.message : undefined) ||
                    (err instanceof Error ? err.message : 'Đã có lỗi xảy ra.')
            );
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteReview = async (reviewId: EntityId): Promise<void> => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
            return;
        }

        try {
            const token = localStorage.getItem('auth_token');
            const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5175') || 'http://localhost:5175';

            const response = await axios.delete(`${API_URL}/api/reviews/${reviewId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.success) {
                alert('Xóa đánh giá thành công!');
                fetchMyReviews();
            }
        } catch (err: unknown) {
            alert(
                (axios.isAxiosError<{ message?: string }>(err) ? err.response?.data?.message : undefined) ||
                    'Lỗi khi xóa đánh giá'
            );
            console.error(err);
        }
    };

    const formatDate = (dateString?: string): string => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const renderStars = (rating = 0): ReactNode => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                    <svg
                        key={star}
                        xmlns="http://www.w3.org/2000/svg"
                        fill={star <= rating ? 'currentColor' : 'none'}
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className={`w-5 h-5 ${
                            star <= rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
                        />
                    </svg>
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="p-6">
                <h2 className="text-lg font-semibold text-[#2e2a2a] uppercase mb-4">
                    Quản lý đánh giá
                </h2>
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    if (error || reviews.length === 0) {
        return (
            <div className="p-6">
                <h2 className="text-lg font-semibold text-[#2e2a2a] uppercase">Quản lý đánh giá</h2>

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
                                d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có đánh giá nào</h3>
                    <p className="text-gray-500 mb-6">Bạn chưa có đánh giá nào trong hệ thống.</p>
                    <button
                        onClick={() => navigate('/all')}
                        className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                        Tìm phòng trọ để đánh giá
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[#2e2a2a] uppercase">Quản lý đánh giá</h2>
                <span className="text-sm text-gray-500">
                    Tổng số: <span className="font-semibold text-blue-600">{reviews.length}</span>{' '}
                    đánh giá
                </span>
            </div>

            <div className="space-y-4">
                {reviews.map(review => (
                    <div
                        key={review.id}
                        className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 mb-1">
                                    {review.listing_name}
                                </h3>
                                {renderStars(review.rating)}
                            </div>
                            <button
                                onClick={() => handleDeleteReview(review.id)}
                                className="text-red-500 hover:text-red-700 transition-colors"
                                title="Xóa đánh giá"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    stroke="currentColor"
                                    className="w-5 h-5"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                    />
                                </svg>
                            </button>
                        </div>

                        {review.comment && (
                            <p className="text-gray-700 text-sm mb-2 line-clamp-3">
                                {review.comment}
                            </p>
                        )}

                        <div className="flex items-center justify-between text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
                            <span>{formatDate(review.created_at)}</span>
                            <button
                                onClick={() => navigate(`/listing/${review.listing_id}`)}
                                className="text-blue-500 hover:text-blue-700 font-medium"
                            >
                                Xem chi tiết →
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Reviews;
