import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast } from 'react-toastify';
import type { EntityId } from '@/types';

interface Incident {
    id: EntityId;
    title?: string;
    tenant_name?: string;
    description?: string;
    created_at?: string;
    status?: string;
    listing_name?: string;
    [key: string]: unknown;
}

const useDebounce = <T,>(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};

const ComplaintsManagement = () => {
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState('unresolved');
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
    const [showResponseModal, setShowResponseModal] = useState(false);
    const [adminResponse, setAdminResponse] = useState('');

    useEffect(() => {
        const fetchIncidents = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('auth_token');
                const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');
                const response = await axios.get(`${API_URL}/api/incidents/my-listings`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { status: filterStatus, search: debouncedSearchTerm },
                });
                if (response.data.success) {
                    setIncidents(response.data.data);
                }
            } catch (err) {
                setError('Không thể tải danh sách sự cố.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchIncidents();
    }, [filterStatus, debouncedSearchTerm]);

    const handleOpenResponseModal = (incident: Incident): void => {
        setSelectedIncident(incident);
        setAdminResponse('');
        setShowResponseModal(true);
    };

    const handleSubmitResponse = async () => {
        if (!adminResponse.trim()) {
            toast.error('Vui lòng nhập phản hồi!');
            return;
        }

        if (!selectedIncident) return;

        const incident = selectedIncident;
        try {
            const token = localStorage.getItem('auth_token');
            const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');
            await axios.patch(
                `${API_URL}/api/incidents/${incident.id}/status`,
                {
                    status: 'Đã giải quyết',
                    admin_response: adminResponse,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setIncidents(prevIncidents =>
                 prevIncidents.map(inc =>
                     inc.id === incident.id ? { ...inc, status: 'Đã giải quyết' } : inc
                )
            );
            toast.success('Đã phản hồi và gửi thông báo cho người dùng!');
            setShowResponseModal(false);
            setSelectedIncident(null);
            setAdminResponse('');
        } catch (error) {
            console.error('Error:', error);
            toast.error('Lỗi khi gửi phản hồi.');
        }
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
                <h2 className="text-lg font-semibold text-[#2e2a2a] uppercase">Quản lý sự cố</h2>
                <div className="sm:w-1/3 w-full relative">
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên sự cố, phòng"
                        className="border border-gray-300 rounded pl-9 px-3 py-2 outline-0 text-sm w-full"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <FontAwesomeIcon
                        icon={faMagnifyingGlass}
                        className="absolute top-1/2 left-3 -translate-y-1/2 text-[#65676b]"
                    />
                </div>
            </div>

            <div className="flex flex-col gap-y-2 mb-4 p-3 bg-[#f9f9f9] border border-gray-200 rounded-lg">
                <h2 className="font-[500] text-sm text-[#2e2a2a]">Tình trạng</h2>
                <div className="flex flex-wrap items-center gap-4">
                    {/* SỬA LẠI: Dùng đúng text 'Chưa giải quyết' */}
                    <label className="flex items-center gap-x-2 text-sm text-[#2e2a2a]">
                        <input
                            type="radio"
                            name="status"
                            value="unresolved"
                            checked={filterStatus === 'unresolved'}
                            onChange={e => setFilterStatus(e.target.value)}
                        />{' '}
                        Chưa giải quyết
                    </label>
                    <label className="flex items-center gap-x-2 text-sm text-[#2e2a2a]">
                        <input
                            type="radio"
                            name="status"
                            value="resolved"
                            checked={filterStatus === 'resolved'}
                            onChange={e => setFilterStatus(e.target.value)}
                        />{' '}
                        Đã giải quyết
                    </label>
                </div>
            </div>

            <div className="w-full overflow-x-auto scrollbar-thin">
                <table className="min-w-[900px] w-full text-sm border-collapse">
                    <thead>
                        <tr className="bg-[#f9f9f9] text-[#2e2a2a] text-sm">
                            <th className="border border-[#eaecf0] p-2 text-center font-[500]">
                                Tên sự cố
                            </th>
                            <th className="border border-[#eaecf0] p-2 text-center font-[500]">
                                Người gửi
                            </th>
                            <th className="border border-[#eaecf0] p-2 text-center font-[500]">
                                Mô tả thêm
                            </th>
                            <th className="border border-[#eaecf0] p-2 text-center font-[500]">
                                Ngày gửi
                            </th>
                            <th className="border border-[#eaecf0] p-2 text-center font-[500]">
                                Tình trạng
                            </th>
                            <th className="border border-[#eaecf0] p-2 text-center font-[500]">
                                Phòng
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="text-center p-4 text-gray-500">
                                    Đang tải...
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan={6} className="text-center p-4 text-red-500">
                                    {error}
                                </td>
                            </tr>
                        ) : incidents.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center p-4 text-gray-500">
                                    Không có bản ghi nào!
                                </td>
                            </tr>
                        ) : (
                             incidents.map((incident: Incident) => (
                                <tr key={incident.id} className="hover:bg-gray-50">
                                    <td className="border border-[#eaecf0] p-3 text-center">
                                        {incident.title}
                                    </td>
                                    <td className="border border-[#eaecf0] p-3 text-center">
                                        {incident.tenant_name}
                                    </td>
                                    <td className="border border-[#eaecf0] p-3 text-center">
                                        {incident.description ? (
                                            <button
                                                onClick={() => setSelectedIncident(incident)}
                                                className="text-blue-600 hover:underline"
                                            >
                                                Xem
                                            </button>
                                        ) : (
                                            <span className="text-gray-500">Không</span>
                                        )}
                                    </td>
                                    <td className="border border-[#eaecf0] p-3 text-center">
                                        {new Date(incident.created_at || '').toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="border border-[#eaecf0] p-3 text-center">
                                        {incident.status === 'Đã giải quyết' ? (
                                            <span className="px-2 py-1 text-xs rounded-full bg-green-200 text-green-800">
                                                {incident.status}
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => handleOpenResponseModal(incident)}
                                                className="px-3 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                                            >
                                                Phản hồi
                                            </button>
                                        )}
                                    </td>
                                    <td className="border border-[#eaecf0] p-3 text-center">
                                        {incident.listing_name}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {selectedIncident && !showResponseModal && (
                <div
                    className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4"
                    onClick={() => setSelectedIncident(null)}
                >
                    <div
                        className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg flex flex-col"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex-shrink-0">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">
                                Nội dung mô tả thêm
                            </h3>
                        </div>
                        <div className="flex-grow overflow-y-auto max-h-[60vh] bg-gray-50 p-4 rounded-md border text-sm text-gray-700 whitespace-pre-wrap">
                            {selectedIncident.description}
                        </div>
                        <div className="mt-6 text-right flex-shrink-0">
                            <button
                                onClick={() => setSelectedIncident(null)}
                                className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Response Modal */}
            {showResponseModal && selectedIncident && (
                <div
                    className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4"
                    onClick={() => setShowResponseModal(false)}
                >
                    <div
                        className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg"
                        onClick={e => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-bold text-gray-800 mb-4">
                            Phản hồi sự cố: {selectedIncident.title}
                        </h3>
                        
                        <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">
                                <strong>Khách thuê:</strong> {selectedIncident.tenant_name}
                            </p>
                            <p className="text-sm text-gray-600 mb-2">
                                <strong>Phòng:</strong> {selectedIncident.listing_name}
                            </p>
                            {selectedIncident.description && (
                                <div className="bg-gray-50 p-3 rounded border text-sm text-gray-700 mb-3">
                                    <strong>Mô tả:</strong>
                                    <p className="mt-1">{selectedIncident.description}</p>
                                </div>
                            )}
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Phản hồi của bạn <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={adminResponse}
                                onChange={(e) => setAdminResponse(e.target.value)}
                                 rows={5}
                                className="w-full border border-gray-300 rounded-lg p-3 text-sm outline-none focus:border-blue-500"
                                placeholder="Nhập phản hồi cho khách thuê..."
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setShowResponseModal(false);
                                    setSelectedIncident(null);
                                    setAdminResponse('');
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSubmitResponse}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
                            >
                                Gửi phản hồi
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ComplaintsManagement;
