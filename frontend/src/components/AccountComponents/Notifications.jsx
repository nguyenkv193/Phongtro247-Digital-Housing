import { useState, useEffect } from 'react';
import axios from 'axios';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('auth_token');

            if (!token) {
                throw new Error('Bạn cần đăng nhập để xem thông tin này.');
            }

            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5175';

            const response = await axios.get(`${API_URL}/api/notifications`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.success) {
                setNotifications(response.data.data);
                setUnreadCount(response.data.unreadCount);
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Đã có lỗi xảy ra.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async notificationId => {
        try {
            const token = localStorage.getItem('auth_token');
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5175';

            await axios.put(
                `${API_URL}/api/notifications/${notificationId}/read`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            fetchNotifications();
        } catch (err) {
            console.error('Lỗi khi đánh dấu đã đọc:', err);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5175';

            await axios.put(
                `${API_URL}/api/notifications/mark-all-read`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            fetchNotifications();
        } catch (err) {
            console.error('Lỗi khi đánh dấu tất cả đã đọc:', err);
        }
    };

    const handleDeleteNotification = async notificationId => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa thông báo này?')) {
            return;
        }

        try {
            const token = localStorage.getItem('auth_token');
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5175';

            await axios.delete(`${API_URL}/api/notifications/${notificationId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            fetchNotifications();
        } catch (err) {
            alert('Lỗi khi xóa thông báo');
            console.error(err);
        }
    };

    const formatDate = dateString => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now - date;
        const diffInMinutes = Math.floor(diffInMs / 60000);
        const diffInHours = Math.floor(diffInMs / 3600000);
        const diffInDays = Math.floor(diffInMs / 86400000);

        if (diffInMinutes < 1) return 'Vừa xong';
        if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
        if (diffInHours < 24) return `${diffInHours} giờ trước`;
        if (diffInDays < 7) return `${diffInDays} ngày trước`;

        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    };

    if (loading) {
        return (
            <div className="p-6">
                <h2 className="text-lg font-semibold text-[#2e2a2a] uppercase mb-4">Thông báo</h2>
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    if (error || notifications.length === 0) {
        return (
            <div className="p-6">
                <h2 className="text-lg font-semibold text-[#2e2a2a] uppercase">Thông báo</h2>

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
                                d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Không có thông báo mới
                    </h3>
                    <p className="text-gray-500 mb-6">Bạn không có thông báo nào trong hệ thống.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[#2e2a2a] uppercase">Thông báo</h2>
                <div className="flex items-center gap-3">
                    {unreadCount > 0 && (
                        <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-medium">
                            {unreadCount} chưa đọc
                        </span>
                    )}
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllAsRead}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Đánh dấu tất cả đã đọc
                        </button>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                {notifications.map(notification => (
                    <div
                        key={notification.id}
                        className={`rounded-lg border p-4 transition-all ${
                            notification.is_read
                                ? 'bg-white border-gray-200'
                                : 'bg-blue-50 border-blue-200'
                        }`}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    {!notification.is_read && (
                                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                    )}
                                    <h3 className="font-semibold text-gray-900">
                                        {notification.title}
                                    </h3>
                                </div>
                                <p className="text-sm text-gray-700 mb-2">{notification.message}</p>
                                <span className="text-xs text-gray-500">
                                    {formatDate(notification.created_at)}
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                {!notification.is_read && (
                                    <button
                                        onClick={() => handleMarkAsRead(notification.id)}
                                        className="text-blue-500 hover:text-blue-700 transition-colors"
                                        title="Đánh dấu đã đọc"
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
                                                d="m4.5 12.75 6 6 9-13.5"
                                            />
                                        </svg>
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDeleteNotification(notification.id)}
                                    className="text-red-500 hover:text-red-700 transition-colors"
                                    title="Xóa thông báo"
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
                                            d="M6 18 18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Notifications;
