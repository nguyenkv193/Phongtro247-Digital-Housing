import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    DollarSign,
    Home,
    AlertCircle,
    Users,
    TrendingUp,
    BarChart3,
    ArrowUp,
    ArrowDown,
    Download,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5175';

const formatCurrency = v => v.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

const StatCard = ({ label, value, icon: Icon, trend, trendValue, bgGradient }) => (
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

const TypeBar = ({ name, count, max }) => {
    const pct = max > 0 ? Math.round((count / max) * 100) : 0;
    return (
        <div className="py-3 group">
            <div className="flex justify-between items-center mb-2">
                <div className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
                    {name}
                </div>
                <div className="flex items-center gap-2">
                    <div className="text-sm text-gray-600">{count} tin</div>
                    <div className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        {pct}%
                    </div>
                </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden shadow-inner">
                <div
                    style={{ width: `${pct}%` }}
                    className="h-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-full transition-all duration-500 hover:shadow-lg"
                />
            </div>
        </div>
    );
};

const Reports = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        totalRevenue: 0,
        totalListings: 0,
        totalComplaints: 0,
        newUsers30d: 0,
        listingTypes: [],
    });

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await axios.get(`${API_BASE}/api/admin/reports`);
                setData(res.data || data);
            } catch (err) {
                console.error('Lỗi khi lấy báo cáo:', err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const maxTypeCount =
        data.listingTypes.length > 0 ? Math.max(...data.listingTypes.map(t => t.count)) : 0;

    const exportReport = () => {
        const headers = ['Chỉ số', 'Giá trị'];
        const rows = [
            ['Tổng doanh thu', formatCurrency(Number(data.totalRevenue || 0))],
            ['Tổng tin đăng', data.totalListings],
            ['Tổng khiếu nại', data.totalComplaints],
            ['Người dùng mới (30 ngày)', data.newUsers30d],
            [],
            ['PHÂN BỔ THEO LOẠI HÌNH', ''],
            ...data.listingTypes.map(t => [t.name, t.count]),
        ];

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
        link.setAttribute('download', `bao_cao_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mb-4"></div>
                    <p className="text-gray-600 font-medium text-lg">Đang tải báo cáo...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                            Báo Cáo & Thống Kê
                        </h1>
                        <p className="text-gray-600">
                            Tổng quan hiệu suất và phân tích dữ liệu hệ thống
                        </p>
                    </div>
                    <button
                        onClick={exportReport}
                        className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:shadow-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-300 active:scale-95"
                    >
                        <Download size={18} />
                        <span className="text-sm font-medium">Xuất báo cáo</span>
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        label="Tổng doanh thu"
                        value={formatCurrency(Number(data.totalRevenue || 0))}
                        icon={DollarSign}
                        bgGradient="bg-gradient-to-br from-green-500 to-emerald-600"
                        trend="up"
                        trendValue="+24%"
                    />
                    <StatCard
                        label="Tin đăng"
                        value={data.totalListings}
                        icon={Home}
                        bgGradient="bg-gradient-to-br from-blue-500 to-cyan-600"
                        trend="up"
                        trendValue="+18%"
                    />
                    <StatCard
                        label="Khiếu nại"
                        value={data.totalComplaints}
                        icon={AlertCircle}
                        bgGradient="bg-gradient-to-br from-orange-500 to-red-600"
                        trend="down"
                        trendValue="-5%"
                    />
                    <StatCard
                        label="Người dùng mới (30d)"
                        value={data.newUsers30d}
                        icon={Users}
                        bgGradient="bg-gradient-to-br from-purple-500 to-pink-600"
                        trend="up"
                        trendValue="+32%"
                    />
                </div>

                {/* Listing Types Chart */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                            <BarChart3 className="text-white" size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">
                                Phân bổ theo loại hình
                            </h3>
                            <p className="text-sm text-gray-500">
                                Thống kê số lượng tin đăng theo từng danh mục
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {data.listingTypes.length > 0 ? (
                            data.listingTypes.map(t => (
                                <TypeBar
                                    key={t.id}
                                    name={t.name}
                                    count={t.count}
                                    max={maxTypeCount}
                                />
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                                    <BarChart3 size={32} className="text-gray-400" />
                                </div>
                                <p className="text-gray-500 font-medium">
                                    Không có dữ liệu loại hình
                                </p>
                                <p className="text-gray-400 text-sm mt-1">
                                    Dữ liệu sẽ xuất hiện khi có tin đăng
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Summary Table */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                            <TrendingUp className="text-white" size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">
                                Tóm tắt chi tiết
                            </h3>
                            <p className="text-sm text-gray-500">
                                Các chỉ số quan trọng của hệ thống
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm text-gray-600 mb-1">Tổng doanh thu</div>
                                    <div className="text-2xl font-bold text-green-600">
                                        {formatCurrency(Number(data.totalRevenue || 0))}
                                    </div>
                                </div>
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                    <DollarSign className="text-green-600" size={24} />
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm text-gray-600 mb-1">Tổng tin đăng</div>
                                    <div className="text-2xl font-bold text-blue-600">
                                        {data.totalListings}
                                    </div>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Home className="text-blue-600" size={24} />
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm text-gray-600 mb-1">Tổng khiếu nại</div>
                                    <div className="text-2xl font-bold text-orange-600">
                                        {data.totalComplaints}
                                    </div>
                                </div>
                                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                    <AlertCircle className="text-orange-600" size={24} />
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm text-gray-600 mb-1">
                                        Người dùng mới (30d)
                                    </div>
                                    <div className="text-2xl font-bold text-purple-600">
                                        {data.newUsers30d}
                                    </div>
                                </div>
                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                    <Users className="text-purple-600" size={24} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
