import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faVideo,
    faEye,
    faClock,
    faCheckCircle,
    faTimesCircle,
    faCheck,
    faTimes,
    faFire,
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminVideoRequests = () => {
    const API_URL = import.meta.env.VITE_API_URL;
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');
    const [error, setError] = useState(null);
    const [debugInfo, setDebugInfo] = useState({});

    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [videoUrl, setVideoUrl] = useState('');
    const [adminNote, setAdminNote] = useState('');
    const [processing, setProcessing] = useState(false);

    const fetchRequests = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('=== FRONTEND DEBUG ===');
            console.log('Filter:', filter);

            const params = filter !== 'all' ? { status: filter } : {};
            console.log('Request params:', params);

            const url = `${API_URL}/api/videos/all-requests`;
            console.log('Request URL:', url);

            const token = localStorage.getItem('admin_token');
            console.log('Token exists:', !!token);

            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                params,
            });

            console.log('Response status:', response.status);
            console.log('Response data:', response.data);

            setDebugInfo(prev => ({
                ...prev,
                responseStatus: response.status,
                dataCount: response.data.data?.length,
                rawResponse: response.data,
            }));

            if (response.data.success) {
                setRequests(response.data.data || []);
                console.log('Requests set:', response.data.data?.length);
            } else {
                setError('Response success = false');
            }
        } catch (error) {
            console.error('=== FRONTEND ERROR ===');
            console.error('Error:', error);
            console.error('Error message:', error.message);
            console.error('Error response:', error.response);
            console.error('Status:', error.response?.status);
            console.error('Data:', error.response?.data);

            setError(error.response?.data?.message || error.message);
            setDebugInfo(prev => ({
                ...prev,
                error: {
                    message: error.message,
                    status: error.response?.status,
                    data: error.response?.data,
                },
            }));
        } finally {
            setLoading(false);
        }
    }, [filter, API_URL]);

    useEffect(() => {
        console.log('Component mounted');
        console.log('API_URL:', API_URL);
        fetchRequests();
    }, [fetchRequests]);

    const getStatusBadge = status => {
        const config = {
            pending: { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800' },
            approved: { label: 'Đã duyệt', color: 'bg-green-100 text-green-800' },
            rejected: { label: 'Từ chối', color: 'bg-red-100 text-red-800' },
        };
        const c = config[status] || config.pending;
        return (
            <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${c.color}`}>
                {c.label}
            </span>
        );
    };

    const handleApprove = async () => {
        if (!selectedRequest) return;

        if (selectedRequest.request_type === 'video') {
            const finalVideoUrl = videoUrl.trim() || selectedRequest.note || '';
            if (!finalVideoUrl) {
                toast.error('Không tìm thấy link video! Vui lòng nhập link video.');
                return;
            }
        }

        setProcessing(true);
        try {
            const token = localStorage.getItem('admin_token');
            const endpoint =
                selectedRequest.request_type === 'video'
                    ? `/api/videos/approve-video/${selectedRequest.id}`
                    : `/api/videos/approve-hot/${selectedRequest.id}`;

            const body =
                selectedRequest.request_type === 'video'
                    ? {
                          video_url: videoUrl.trim() || selectedRequest.note || '',
                          admin_note: adminNote || 'Đã duyệt và đăng video',
                      }
                    : { admin_note: adminNote || 'Đã duyệt hot listing' };

            const response = await axios.post(`${API_URL}${endpoint}`, body, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.success) {
                toast.success('Duyệt yêu cầu thành công!');
                setShowApproveModal(false);
                setVideoUrl('');
                setAdminNote('');
                setSelectedRequest(null);
                fetchRequests();
            }
        } catch (error) {
            console.error('Error approving:', error);
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra!');
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!selectedRequest || !adminNote.trim()) {
            toast.error('Vui lòng nhập lý do từ chối!');
            return;
        }

        setProcessing(true);
        try {
            const token = localStorage.getItem('admin_token');
            const endpoint =
                selectedRequest.request_type === 'video'
                    ? `/api/videos/reject-video/${selectedRequest.id}`
                    : `/api/videos/reject-hot/${selectedRequest.id}`;

            const response = await axios.post(
                `${API_URL}${endpoint}`,
                { admin_note: adminNote },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                toast.success('Đã từ chối yêu cầu!');
                setShowRejectModal(false);
                setAdminNote('');
                setSelectedRequest(null);
                fetchRequests();
            }
        } catch (error) {
            console.error('Error rejecting:', error);
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra!');
        } finally {
            setProcessing(false);
        }
    };

    const formatCurrency = amount => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount || 0);
    };

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-[#006ffd] rounded-xl flex items-center justify-center flex-shrink-0">
                            <FontAwesomeIcon
                                icon={faVideo}
                                className="text-white text-lg md:text-xl"
                            />
                        </div>
                        <div>
                            <h1 className="text-lg md:text-xl font-bold text-gray-900">
                                Quản lý Yêu cầu (Video & Hot Listing)
                            </h1>
                            <p className="text-gray-500 text-xs md:text-sm mt-0.5 hidden sm:block">
                                Duyệt và quản lý yêu cầu video và hot listing từ chủ trọ
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-50 px-4 md:px-5 py-2 md:py-3 rounded-xl border border-blue-200">
                            <div className="text-xs text-blue-600 font-medium mb-0.5">
                                Tổng yêu cầu
                            </div>
                            <div className="text-xl md:text-2xl font-bold text-blue-700">
                                {requests.length}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    <div className="font-semibold mb-1">Lỗi:</div>
                    <div className="text-sm">{error}</div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1">
                <div className="flex flex-wrap gap-1">
                    {[
                        { value: 'pending', label: 'Chờ xử lý', color: 'yellow' },
                        { value: 'approved', label: 'Đã duyệt', color: 'green' },
                        { value: 'rejected', label: 'Từ chối', color: 'red' },
                        { value: 'all', label: 'Tất cả', color: 'blue' },
                    ].map(tab => (
                        <button
                            key={tab.value}
                            onClick={() => setFilter(tab.value)}
                            className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                                filter === tab.value
                                    ? tab.color === 'yellow'
                                        ? 'bg-yellow-500 text-white shadow-md'
                                        : tab.color === 'green'
                                        ? 'bg-green-500 text-white shadow-md'
                                        : tab.color === 'red'
                                        ? 'bg-red-500 text-white shadow-md'
                                        : 'bg-blue-600 text-white shadow-md'
                                    : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600"></div>
                    <p className="mt-4 text-gray-500">Đang tải...</p>
                </div>
            ) : requests.length === 0 ? (
                <div className="text-center py-12">
                    <FontAwesomeIcon icon={faVideo} className="text-6xl text-gray-400 mb-4" />
                    <p className="text-gray-500">Không có yêu cầu nào</p>
                    <p className="text-sm text-gray-400 mt-2">Filter: {filter}</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-gray-200">
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                        ID
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                        Tin đăng
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                        Chủ trọ
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                        Ghi chú
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                        Trạng thái
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                        Ngày tạo
                                    </th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {requests.map(request => (
                                    <tr
                                        key={request.id}
                                        className="hover:bg-blue-50 transition-colors"
                                    >
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            #{request.id}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                {request.request_type === 'hot' ? (
                                                    <FontAwesomeIcon
                                                        icon={faFire}
                                                        className="text-orange-500"
                                                    />
                                                ) : (
                                                    <FontAwesomeIcon
                                                        icon={faVideo}
                                                        className="text-blue-500"
                                                    />
                                                )}
                                                <span
                                                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                        request.request_type === 'hot'
                                                            ? 'bg-orange-100 text-orange-800'
                                                            : 'bg-blue-100 text-blue-800'
                                                    }`}
                                                >
                                                    {request.request_type === 'hot'
                                                        ? 'HOT'
                                                        : 'VIDEO'}
                                                </span>
                                            </div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {request.listing_name}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                ID: #{request.listing_id}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">
                                                {request.user_name}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {request.user_phone}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {request.request_type === 'hot' ? (
                                                <div className="text-sm">
                                                    <div className="text-gray-900 font-medium">
                                                        {request.duration_days} ngày
                                                    </div>
                                                    <div className="text-orange-600 font-semibold">
                                                        {formatCurrency(request.fee)}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-sm text-gray-600 max-w-xs truncate">
                                                    {request.note || '-'}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(request.status)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(request.created_at).toLocaleDateString(
                                                'vi-VN'
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() =>
                                                        window.open(
                                                            `/listing/${request.listing_id}`,
                                                            '_blank'
                                                        )
                                                    }
                                                    className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                                                    title="Xem tin đăng"
                                                >
                                                    Xem
                                                </button>

                                                {request.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedRequest(request);
                                                                setShowApproveModal(true);
                                                            }}
                                                            className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-md transition-colors"
                                                            title="Duyệt yêu cầu"
                                                        >
                                                            Duyệt
                                                        </button>

                                                        <button
                                                            onClick={() => {
                                                                setSelectedRequest(request);
                                                                setShowRejectModal(true);
                                                            }}
                                                            className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                                                            title="Từ chối yêu cầu"
                                                        >
                                                            Từ chối
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {showApproveModal && selectedRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            {selectedRequest.request_type === 'hot' ? (
                                <>
                                    <FontAwesomeIcon icon={faFire} className="text-orange-500" />
                                    Duyệt Hot Listing
                                </>
                            ) : (
                                <>
                                    <FontAwesomeIcon icon={faVideo} className="text-blue-500" />
                                    Duyệt Video
                                </>
                            )}
                        </h3>

                        <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">
                                <strong>Tin đăng:</strong> {selectedRequest.listing_name}
                            </p>
                            <p className="text-sm text-gray-600 mb-2">
                                <strong>Chủ trọ:</strong> {selectedRequest.user_name}
                            </p>
                            <p className="text-sm text-gray-600">
                                <strong>Phí:</strong>{' '}
                                <span className="text-red-600 font-semibold">
                                    {formatCurrency(selectedRequest.fee)}
                                </span>
                            </p>
                        </div>

                        {selectedRequest.request_type === 'hot' && (
                            <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                <p className="text-sm text-orange-900">
                                    <strong>Thời gian hot:</strong> {selectedRequest.duration_days}{' '}
                                    ngày
                                </p>
                            </div>
                        )}

                        {selectedRequest.request_type === 'video' && selectedRequest.note && (
                            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-xs font-medium text-blue-800 mb-1">
                                    Ghi chú từ chủ trọ:
                                </p>
                                <p className="text-sm text-blue-900 break-all">
                                    {selectedRequest.note}
                                </p>
                            </div>
                        )}

                        {selectedRequest.request_type === 'video' && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Link video{' '}
                                    {!selectedRequest.note && (
                                        <span className="text-red-500">*</span>
                                    )}
                                </label>
                                <input
                                    type="url"
                                    value={videoUrl}
                                    onChange={e => setVideoUrl(e.target.value)}
                                    placeholder={
                                        selectedRequest.note || 'https://youtube.com/watch?v=...'
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {selectedRequest.note
                                        ? 'Để trống nếu dùng link từ ghi chú'
                                        : 'Nhập link video YouTube'}
                                </p>
                            </div>
                        )}

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ghi chú cho chủ trọ
                            </label>
                            <textarea
                                value={adminNote}
                                onChange={e => setAdminNote(e.target.value)}
                                placeholder="Ghi chú..."
                                rows="3"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowApproveModal(false);
                                    setVideoUrl('');
                                    setAdminNote('');
                                    setSelectedRequest(null);
                                }}
                                disabled={processing}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleApprove}
                                disabled={processing}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                            >
                                {processing ? 'Đang xử lý...' : 'Duyệt'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showRejectModal && selectedRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                            Từ chối yêu cầu video
                        </h3>

                        <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">
                                <strong>Tin đăng:</strong> {selectedRequest.listing_name}
                            </p>
                            <p className="text-sm text-gray-600">
                                <strong>Chủ trọ:</strong> {selectedRequest.user_name}
                            </p>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Lý do từ chối <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={adminNote}
                                onChange={e => setAdminNote(e.target.value)}
                                placeholder="Nhập lý do từ chối..."
                                rows="4"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setAdminNote('');
                                    setSelectedRequest(null);
                                }}
                                disabled={processing}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={processing}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                            >
                                {processing ? 'Đang xử lý...' : 'Từ chối'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminVideoRequests;
