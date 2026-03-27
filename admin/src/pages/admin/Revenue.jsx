import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    DollarSign,
    TrendingUp,
    Calendar,
    Filter,
    Download,
    ArrowUp,
    ArrowDown,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5175';

const StatCard = ({ label, value, accent, icon: Icon, trend, trendValue, bgGradient }) => (
    <div
        className={`relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 ${bgGradient}`}
    >
        <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8 opacity-10">
            <Icon size={128} />
        </div>
        <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Icon className="text-white" size={24} />
                </div>
                {trend && (
                    <div
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${
                            trend === 'up'
                                ? 'bg-green-500/20 text-white'
                                : 'bg-red-500/20 text-white'
                        }`}
                    >
                        {trend === 'up' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                        {trendValue}
                    </div>
                )}
            </div>
            <div className="text-white/80 text-sm font-medium mb-1">{label}</div>
            <div className="text-3xl font-bold text-white">{value}</div>
        </div>
    </div>
);

const Revenue = () => {
    const [revenues, setRevenues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState({
        today: 0,
        month: 0,
        year: 0,
    });
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetchRevenues = async () => {
            try {
                const res = await axios.get(`${API_BASE}/api/admin/revenues`);
                const data = Array.isArray(res.data) ? res.data : [];
                setRevenues(data);
                calculateSummary(data);
            } catch (err) {
                console.error('❌ Lỗi khi lấy doanh thu:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchRevenues();
    }, []);

    const calculateSummary = data => {
        const now = new Date();
        const today = now.toISOString().slice(0, 10);
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        let todaySum = 0,
            monthSum = 0,
            yearSum = 0;

        data.forEach(r => {
            const d = new Date(r.created_at);
            if (d.toISOString().slice(0, 10) === today) todaySum += Number(r.amount);
            if (d.getMonth() === currentMonth && d.getFullYear() === currentYear)
                monthSum += Number(r.amount);
            if (d.getFullYear() === currentYear) yearSum += Number(r.amount);
        });

        setSummary({
            today: todaySum,
            month: monthSum,
            year: yearSum,
        });
    };

    const formatCurrency = v => {
        const num = Number(v) || 0;
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(num);
    };

    const filteredRevenues = revenues.filter(r => {
        if (filter === 'hot') return r.is_hot;
        if (filter === 'normal') return !r.is_hot;
        return true;
    });

    const exportToExcel = () => {
        const headers = ['STT', 'Bài đăng', 'Chủ trọ', 'Loại', 'Số tiền (VND)', 'Ngày tạo'];

        const rows = filteredRevenues.map((r, i) => [
            i + 1,
            r.listing_name || '',
            r.owner_name || '',
            r.is_hot ? 'Hot' : 'Thường',
            Number(r.amount),
            new Date(r.created_at).toLocaleString('vi-VN'),
        ]);

        const totalAmount = filteredRevenues.reduce((sum, r) => sum + Number(r.amount), 0);
        rows.push([]);
        rows.push(['', '', '', 'TỔNG CỘNG:', totalAmount, '']);

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
        link.setAttribute('download', `doanh_thu_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent mb-4"></div>
                    <p className="text-gray-600 font-medium text-lg">
                        Đang tải dữ liệu doanh thu...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6">
            <div className="space-y-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                        Quản Lý Doanh Thu
                    </h1>
                    <p className="text-gray-600">Theo dõi và phân tích doanh thu từ các tin đăng</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard
                        label="Doanh thu hôm nay"
                        value={formatCurrency(summary.today)}
                        icon={DollarSign}
                        bgGradient="bg-gradient-to-br from-green-500 to-emerald-600"
                        trend="up"
                        trendValue="+15%"
                    />
                    <StatCard
                        label="Doanh thu tháng này"
                        value={formatCurrency(summary.month)}
                        icon={TrendingUp}
                        bgGradient="bg-gradient-to-br from-blue-500 to-cyan-600"
                        trend="up"
                        trendValue="+22%"
                    />
                    <StatCard
                        label="Doanh thu năm nay"
                        value={formatCurrency(summary.year)}
                        icon={Calendar}
                        bgGradient="bg-gradient-to-br from-purple-500 to-pink-600"
                        trend="up"
                        trendValue="+38%"
                    />
                </div>

                {/* Revenue Table */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                                <DollarSign className="text-white" size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">
                                    Chi tiết doanh thu
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Tổng {filteredRevenues.length} giao dịch
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
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
                                    onClick={() => setFilter('hot')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                        filter === 'hot'
                                            ? 'bg-white text-gray-800 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-800'
                                    }`}
                                >
                                    Hot
                                </button>
                                <button
                                    onClick={() => setFilter('normal')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                        filter === 'normal'
                                            ? 'bg-white text-gray-800 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-800'
                                    }`}
                                >
                                    Thường
                                </button>
                            </div>

                            {/* Export Button */}
                            <button
                                onClick={exportToExcel}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 active:scale-95"
                            >
                                <Download size={18} />
                                <span className="text-sm font-medium">Xuất Excel</span>
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        {filteredRevenues.length > 0 ? (
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b-2 border-gray-200">
                                        <th className="text-left p-4 font-semibold text-gray-700">
                                            #
                                        </th>
                                        <th className="text-left p-4 font-semibold text-gray-700">
                                            Bài đăng
                                        </th>
                                        <th className="text-left p-4 font-semibold text-gray-700">
                                            Chủ trọ
                                        </th>
                                        <th className="text-left p-4 font-semibold text-gray-700">
                                            Loại
                                        </th>
                                        <th className="text-right p-4 font-semibold text-gray-700">
                                            Số tiền
                                        </th>
                                        <th className="text-left p-4 font-semibold text-gray-700">
                                            Ngày tạo
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRevenues.map((r, i) => (
                                        <tr
                                            key={r.id}
                                            className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all"
                                        >
                                            <td className="p-4 text-gray-600">{i + 1}</td>
                                            <td className="p-4">
                                                <div className="font-medium text-gray-800">
                                                    {r.listing_name}
                                                </div>
                                            </td>
                                            <td className="p-4 text-gray-700">{r.owner_name}</td>
                                            <td className="p-4">
                                                <span
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1 ${
                                                        r.is_hot
                                                            ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-sm'
                                                            : 'bg-gray-100 text-gray-700'
                                                    }`}
                                                >
                                                    {r.is_hot ? '🔥' : ''}
                                                    {r.is_hot ? 'Hot' : 'Thường'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <span className="font-bold text-green-600 text-base">
                                                    {formatCurrency(Number(r.amount))}
                                                </span>
                                            </td>
                                            <td className="p-4 text-gray-600">
                                                {new Date(r.created_at).toLocaleString('vi-VN', {
                                                    year: 'numeric',
                                                    month: '2-digit',
                                                    day: '2-digit',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="text-center py-16">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
                                    <DollarSign size={40} className="text-gray-400" />
                                </div>
                                <p className="text-gray-500 text-lg font-medium">
                                    Không có dữ liệu doanh thu
                                </p>
                                <p className="text-gray-400 text-sm mt-2">
                                    Dữ liệu sẽ xuất hiện khi có giao dịch mới
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Revenue;
