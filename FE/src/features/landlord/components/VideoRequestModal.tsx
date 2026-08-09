import React, { useState, type FormEvent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVideo, faXmark, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import type { EntityId } from '@/types';

interface VideoRequestModalProps {
    show: boolean;
    onClose: () => void;
    listingId: EntityId;
    listingName: string;
}

const VideoRequestModal = ({ show, onClose, listingId, listingName }: VideoRequestModalProps) => {
    const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.post(
                `${API_URL}/api/videos/request`,
                {
                    listing_id: listingId,
                    note: note,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (response.data.success) {
                alert(response.data.message);
                setNote('');
                onClose();
            }
        } catch (error: unknown) {
            console.error('Error requesting video:', error);
            const message = axios.isAxiosError<{ message?: string }>(error)
                ? error.response?.data?.message
                : undefined;
            alert(message || 'Có lỗi xảy ra!');
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
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <FontAwesomeIcon icon={faVideo} className="text-blue-600 text-xl" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Yêu cầu đăng video</h2>
                        <p className="text-sm text-gray-500">{listingName}</p>
                    </div>
                </div>

                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex gap-2">
                        <FontAwesomeIcon icon={faInfoCircle} className="text-blue-600 mt-0.5" />
                        <div className="text-sm text-gray-700">
                            <p className="font-semibold mb-1">Thông tin quan trọng:</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>
                                    Phí đăng video:{' '}
                                    <span className="font-bold text-orange-600">500,000 VNĐ</span>
                                </li>
                                <li>Admin sẽ xử lý trong vòng 24-48h</li>
                                <li>Video sẽ được hiển thị trên tin đăng sau khi duyệt</li>
                                <li>Phí sẽ được trừ sau khi admin duyệt</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ghi chú cho Admin (không bắt buộc)
                        </label>
                        <textarea
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            rows={4}
                            placeholder="VD: Link video YouTube, yêu cầu đặc biệt..."
                            className="w-full border border-gray-300 rounded-lg p-3 text-sm outline-none focus:border-blue-500"
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
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                        >
                            {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VideoRequestModal;
