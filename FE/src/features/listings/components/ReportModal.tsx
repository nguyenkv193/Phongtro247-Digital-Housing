import React, { useState, type FormEvent, type MouseEvent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast } from 'react-toastify';
import type { EntityId } from '@/types';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    listingId: EntityId;
}

const ReportModal = ({ isOpen, onClose, listingId }: ReportModalProps) => {
    const [reportType, setReportType] = useState('Trọ đã hết phòng');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5175');
    const token = localStorage.getItem('auth_token');

    const reportTypes = ['Trọ đã hết phòng', 'Trọ sai thông tin', 'Trọ vi phạm', 'Lý do khác'];

    const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        if (!token) {
            toast.warn('Vui lòng đăng nhập để gửi phản ánh');
            return;
        }
        setIsSubmitting(true);
        try {
            const response = await axios.post(
                `${API_URL}/api/incidents`,
                {
                    listingId,
                    reason: reportType,
                    description,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (response.data.success) {
                toast.success('Phản ánh đã được gửi thành công!');
                setReportType('Trọ đã hết phòng');
                setDescription('');
                onClose();
            }
        } catch (error: unknown) {
            const errorMessage = axios.isAxiosError<{ message?: string }>(error)
                ? error.response?.data?.message || 'Có lỗi xảy ra khi gửi phản ánh'
                : 'Có lỗi xảy ra khi gửi phản ánh';
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl sm:max-w-[420px] w-full relative shadow-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                    <h2 className="text-[16px] sm:text-[17px] font-semibold text-gray-800">
                        Trọ này có vấn đề gì?
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
                    >
                        <FontAwesomeIcon icon={faXmark} className="text-xl" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 sm:p-5">
                    <div className="space-y-1 mb-4">
                        {reportTypes.map(type => (
                            <label
                                key={type}
                                className="flex items-center gap-2 sm:gap-3 cursor-pointer hover:bg-gray-50 px-2 pb-2 sm:px-3 rounded-lg transition-colors"
                            >
                                <input
                                    type="radio"
                                    name="reportType"
                                    value={type}
                                    checked={reportType === type}
                                    onChange={e => setReportType(e.target.value)}
                                    className="w-[14px] h-[14px] sm:w-[16px] sm:h-[16px] text-blue-600 cursor-pointer flex-shrink-0"
                                />
                                <span className="text-[13px] sm:text-[14px] text-gray-700">
                                    {type}
                                </span>
                            </label>
                        ))}
                    </div>

                    <div className="mb-4">
                        <label className="block text-[14px] sm:text-[15px] font-medium mb-2 text-gray-700">
                            Mô tả thêm
                        </label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg p-2.5 sm:p-3 text-[13px] sm:text-[14px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all"
                            rows={3}
                            placeholder="Nhập mô tả chi tiết..."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 text-white py-3 sm:py-[13px] rounded-lg text-[14px] sm:text-[15px] font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {isSubmitting ? 'Đang gửi...' : 'Gửi'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ReportModal;
