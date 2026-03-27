import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    AlertCircle,
    CheckCircle,
    XCircle,
    Clock,
    User,
    Home,
    Filter,
    Download,
    Search,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5175';

const StatCard = ({ label, value, icon: Icon, bgGradient }) => (
    <div
        className={`relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 ${bgGradient}`}
    >
        <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8 opacity-10">
            <Icon size={128} />
        </div>
        <div className="relative z-10">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl w-fit mb-3">
                <Icon className="text-white" size={24} />
            </div>
            <div className="text-white/80 text-sm font-medium mb-1">{label}</div>
            <div className="text-3xl font-bold text-white">{value}</div>
        </div>
    </div>
);

const Complaints = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchComplaints = async () => {
        try {
            const res = await axios.get(`${API_BASE}/api/admin/complaints`);
            setComplaints(res.data);
        } catch (err) {
            console.error('❌ Lỗi khi tải khiếu nại:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await axios.put(`${API_BASE}/api/admin/complaints/${id}`, { status });
            fetchComplaints();
        } catch (err) {
            console.error('❌ Lỗi khi cập nhật trạng thái:', err);
        }
    };

    useEffect(() => {
        fetchComplaints();
    }, []);

    const filteredComplaints = complaints.filter(c => {
        const matchFilter = filter === 'all' || c.status === filter;
        const matchSearch =
            c.reporter_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.listing_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.reason?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchFilter && matchSearch;
    });

    const stats = {
        total: complaints.length,
        pending: complaints.filter(c => c.status === 'pending').length,
        resolved: complaints.filter(c => c.status === 'resolved').length,
        rejected: complaints.filter(c => c.status === 'rejected').length,
    };

    const exportToExcel = () => {
        const headers = [
            'Mã',
            'Người báo cáo',
            'Tin bị báo cáo',
            'Lý do',
            'Trạng thái',
            'Ngày gửi',
        ];
        const rows = filteredComplaints.map(c => [
            `KN-${String(c.id).padStart(4, '0')}`,
            c.reporter_name || '',
            c.listing_name || '',
            c.reason || '',
            c.status === 'pending'
                ? 'Đang xử lý'
                : c.status === 'resolved'
                ? 'Đã giải quyết'
                : 'Từ chối',
            new Date(c.created_at).toLocaleDateString('vi-VN'),
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row =>
                row
                    .map(cell => {
                        if (
                            typeof cell === 'string' &&
                            (cell.includes(',') || cell.includes('"'))
                        ) {
                            return `"${cell.replace(/"/g, '""')}"`;
                        }
                        return cell;
                    })
                    .join(',')
            ),
        ].join('\n');

        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `khieu_nai_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent mb-4"></div>
                    <p className="text-gray-600 font-medium text-lg">Đang tải khiếu nại...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6">
            <div className="space-y-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
                        Quản Lý Khiếu Nại
                    </h1>
                    <p className="text-gray-600">Theo dõi và xử lý các khiếu nại từ người dùng</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        label="Tổng khiếu nại"
                        value={stats.total}
                        icon={AlertCircle}
                        bgGradient="bg-gradient-to-br from-gray-500 to-gray-600"
                    />
                    <StatCard
                        label="Đang xử lý"
                        value={stats.pending}
                        icon={Clock}
                        bgGradient="bg-gradient-to-br from-yellow-500 to-orange-600"
                    />
                    <StatCard
                        label="Đã giải quyết"
                        value={stats.resolved}
                        icon={CheckCircle}
                        bgGradient="bg-gradient-to-br from-green-500 to-emerald-600"
                    />
                    <StatCard
                        label="Từ chối"
                        value={stats.rejected}
                        icon={XCircle}
                        bgGradient="bg-gradient-to-br from-red-500 to-pink-600"
                    />
                </div>

                {/* Complaints Table */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex flex-col gap-4 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl">
                                <AlertCircle className="text-white" size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">
                                    Danh sách khiếu nại
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Tổng {filteredComplaints.length} khiếu nại
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                            {/* Search */}
                            <div className="relative flex-1">
                                <Search
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    size={18}
                                />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm theo người báo cáo, tin đăng hoặc lý do..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>

                            {/* Filter */}
                            <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
                                <button
                                    onClick={() => setFilter('all')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                        filter === 'all'
                                            ? 'bg-white text-gray-800 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-800'
                                    }`}
                                >
                                    Tất cả
                                </button>
                                <button
                                    onClick={() => setFilter('pending')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                        filter === 'pending'
                                            ? 'bg-white text-gray-800 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-800'
                                    }`}
                                >
                                    Đang xử lý
                                </button>
                                <button
                                    onClick={() => setFilter('resolved')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                        filter === 'resolved'
                                            ? 'bg-white text-gray-800 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-800'
                                    }`}
                                >
                                    Đã giải quyết
                                </button>
                                <button
                                    onClick={() => setFilter('rejected')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                        filter === 'rejected'
                                            ? 'bg-white text-gray-800 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-800'
                                    }`}
                                >
                                    Từ chối
                                </button>
                            </div>

                            {/* Export Button */}
                            <button
                                onClick={exportToExcel}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:shadow-lg hover:from-orange-600 hover:to-red-700 transition-all duration-300 active:scale-95"
                            >
                                <Download size={18} />
                                <span className="text-sm font-medium">Xuất Excel</span>
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        {filteredComplaints.length > 0 ? (
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b-2 border-gray-200">
                                        <th className="text-left p-4 font-semibold text-gray-700">
                                            Mã
                                        </th>
                                        <th className="text-left p-4 font-semibold text-gray-700">
                                            Người báo cáo
                                        </th>
                                        <th className="text-left p-4 font-semibold text-gray-700">
                                            Tin bị báo cáo
                                        </th>
                                        <th className="text-left p-4 font-semibold text-gray-700">
                                            Lý do
                                        </th>
                                        <th className="text-left p-4 font-semibold text-gray-700">
                                            Trạng thái
                                        </th>
                                        <th className="text-left p-4 font-semibold text-gray-700">
                                            Ngày gửi
                                        </th>
                                        <th className="text-left p-4 font-semibold text-gray-700">
                                            Thao tác
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredComplaints.map(c => (
                                        <tr
                                            key={c.id}
                                            className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 transition-all"
                                        >
                                            <td className="p-4">
                                                <span className="font-mono text-gray-800 font-semibold">
                                                    KN-{String(c.id).padStart(4, '0')}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <User size={16} className="text-blue-600" />
                                                    </div>
                                                    <span className="font-medium text-gray-800">
                                                        {c.reporter_name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Home size={16} className="text-gray-400" />
                                                    <span className="text-gray-700">
                                                        {c.listing_name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-gray-600 line-clamp-2">
                                                    {c.reason}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1 ${
                                                        c.status === 'resolved'
                                                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                                                            : c.status === 'rejected'
                                                            ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                                                            : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                                                    }`}
                                                >
                                                    {c.status === 'pending' && <Clock size={12} />}
                                                    {c.status === 'resolved' && (
                                                        <CheckCircle size={12} />
                                                    )}
                                                    {c.status === 'rejected' && (
                                                        <XCircle size={12} />
                                                    )}
                                                    {c.status === 'pending'
                                                        ? 'Đang xử lý'
                                                        : c.status === 'resolved'
                                                        ? 'Đã giải quyết'
                                                        : 'Từ chối'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-gray-600">
                                                {new Date(c.created_at).toLocaleDateString(
                                                    'vi-VN',
                                                    {
                                                        year: 'numeric',
                                                        month: '2-digit',
                                                        day: '2-digit',
                                                    }
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <select
                                                    className="border-2 border-gray-200 rounded-lg px-3 py-2 text-sm font-medium hover:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all cursor-pointer"
                                                    value={c.status}
                                                    onChange={e =>
                                                        updateStatus(c.id, e.target.value)
                                                    }
                                                >
                                                    <option value="pending">Đang xử lý</option>
                                                    <option value="resolved">Đã giải quyết</option>
                                                    <option value="rejected">Từ chối</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="text-center py-16">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
                                    <AlertCircle size={40} className="text-gray-400" />
                                </div>
                                <p className="text-gray-500 text-lg font-medium">
                                    {searchTerm || filter !== 'all'
                                        ? 'Không tìm thấy khiếu nại phù hợp'
                                        : 'Không có khiếu nại nào'}
                                </p>
                                <p className="text-gray-400 text-sm mt-2">
                                    {searchTerm || filter !== 'all'
                                        ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                                        : 'Khiếu nại mới sẽ xuất hiện tại đây'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Complaints;
