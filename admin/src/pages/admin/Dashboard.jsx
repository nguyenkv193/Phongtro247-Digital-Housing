import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Users,
    TrendingUp,
    Home,
    AlertCircle,
    DollarSign,
    BarChart3,
    PieChart,
    ArrowUp,
    ArrowDown,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5175';

const formatCurrency = v => {
    const num = Number(v) || 0;
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(num);
};

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
            <div className="text-3xl font-bold text-white break-words">{value}</div>
        </div>
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalHosts: 0,
        totalCustomers: 0,
        todayRevenue: 0,
        activeListings: 0,
        newComplaints: 0,
        revenueLast7: [],
        statusCounts: {},
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('admin_token');

                const [usersRes, listingsRes, revenuesRes, complaintsRes] = await Promise.all([
                    axios.get(`${API_BASE}/api/admin/users`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get(`${API_BASE}/api/admin/adminlistings`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get(`${API_BASE}/api/admin/revenues`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get(`${API_BASE}/api/admin/complaints`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                const allUsers = usersRes.data;
                const totalUsers = allUsers.length;
                const totalHosts = allUsers.filter(
                    u => Number(u.has_completed_host_info) === 1 && u.role !== 'admin'
                ).length;
                const totalCustomers = totalUsers - totalHosts;

                const today = new Date().toISOString().slice(0, 10);
                const todayRevenue = revenuesRes.data
                    .filter(r => r.created_at?.slice(0, 10) === today)
                    .reduce((sum, r) => sum + Number(r.amount || 0), 0);

                const listings = listingsRes.data;
                const activeListings = listings.filter(l => l.status === 'published').length;

                const complaints = complaintsRes.data;
                const newComplaints = complaints.filter(c => c.status === 'pending').length;

                const last7Days = [];
                for (let i = 6; i >= 0; i--) {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    const dayStr = date.toISOString().slice(0, 10);
                    const total = revenuesRes.data
                        .filter(r => r.created_at?.slice(0, 10) === dayStr)
                        .reduce((sum, r) => sum + Number(r.amount || 0), 0);
                    last7Days.push({ day: dayStr.slice(5), total });
                }

                const statusCounts = {
                    published: listings.filter(l => l.status === 'published').length,
                    pending: listings.filter(l => l.status === 'pending').length,
                    rejected: listings.filter(l => l.status === 'rejected').length,
                };

                setStats({
                    totalUsers,
                    totalHosts,
                    totalCustomers,
                    todayRevenue,
                    activeListings,
                    newComplaints,
                    revenueLast7: last7Days,
                    statusCounts,
                });
            } catch (error) {
                console.error('❌ Lỗi khi lấy dữ liệu Dashboard:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4"></div>
                    <p className="text-gray-600 font-medium text-lg">
                        Đang tải dữ liệu dashboard...
                    </p>
                </div>
            </div>
        );
    }

    const pieChartData = [
        { name: 'Đã duyệt', value: stats.statusCounts.published || 0, color: '#22C55E' },
        { name: 'Chờ duyệt', value: stats.statusCounts.pending || 0, color: '#FACC15' },
        { name: 'Bị từ chối', value: stats.statusCounts.rejected || 0, color: '#EF4444' },
    ];

    const totalStatus = Object.values(stats.statusCounts).reduce((a, b) => a + b, 0);

    return (
        <div className="p-4 md:p-6">
            <div className="space-y-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-[#006ffd] mb-2">Trang chủ</h1>
                    <p className="text-gray-600">Tổng quan về hệ thống và hoạt động kinh doanh</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        label="Tổng tài khoản"
                        value={stats.totalUsers}
                        icon={Users}
                        bgGradient="bg-[#006ffd]"
                        trend="up"
                        trendValue="+12%"
                    />
                    <StatCard
                        label="Doanh thu hôm nay"
                        value={formatCurrency(stats.todayRevenue)}
                        icon={DollarSign}
                        bgGradient="bg-emerald-600"
                        trend="up"
                        trendValue="+8%"
                    />
                    <StatCard
                        label="Tin đang hoạt động"
                        value={stats.activeListings}
                        icon={Home}
                        bgGradient="bg-cyan-600"
                        trend="up"
                        trendValue="+5%"
                    />
                    <StatCard
                        label="Khiếu nại mới"
                        value={stats.newComplaints}
                        icon={AlertCircle}
                        bgGradient="bg-amber-600"
                        trend="down"
                        trendValue="-3%"
                    />
                </div>

                {/* User Breakdown Card */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-[#006ffd] rounded-xl">
                            <Users className="text-white" size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">
                                Phân loại người dùng
                            </h3>
                            <p className="text-sm text-gray-500">Thống kê chi tiết theo vai trò</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Người dùng</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {stats.totalCustomers}
                                    </p>
                                </div>
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Users className="text-blue-600" size={28} />
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Chủ trọ</p>
                                    <p className="text-2xl font-bold text-amber-600">
                                        {stats.totalHosts}
                                    </p>
                                </div>
                                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                                    <Home className="text-amber-600" size={28} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Revenue Chart */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                            <BarChart3 className="text-white" size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">
                                Biểu đồ doanh thu
                            </h3>
                            <p className="text-sm text-gray-500">7 ngày gần nhất</p>
                        </div>
                    </div>
                    <div className="h-80 flex items-end justify-between gap-3 px-4">
                        {stats.revenueLast7.map((item, idx) => {
                            const max = Math.max(...stats.revenueLast7.map(d => d.total), 1);
                            const heightPercent = max > 0 ? (item.total / max) * 100 : 0;
                            const minHeight = 8;

                            return (
                                <div key={idx} className="flex-1 flex flex-col items-center group">
                                    <div className="relative w-full h-64 flex items-end">
                                        <div
                                            className="w-full rounded-t-xl bg-gradient-to-t from-blue-500 to-purple-500 transition-all duration-300 hover:from-blue-600 hover:to-purple-600 cursor-pointer relative"
                                            style={{
                                                height:
                                                    item.total > 0
                                                        ? `${Math.max(heightPercent, minHeight)}%`
                                                        : `${minHeight}px`,
                                            }}
                                        >
                                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white px-3 py-1.5 rounded-lg text-xs whitespace-nowrap shadow-lg z-10">
                                                {formatCurrency(item.total)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-600 mt-3 font-medium">
                                        {item.day}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Pie Chart */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                            <PieChart className="text-white" size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">
                                Trạng thái tin đăng
                            </h3>
                            <p className="text-sm text-gray-500">Phân bổ theo trạng thái duyệt</p>
                        </div>
                    </div>
                    <div className="flex flex-col lg:flex-row items-center justify-around gap-8">
                        {/* Pie Chart */}
                        <div className="relative">
                            <svg width="240" height="240" viewBox="0 0 240 240">
                                <circle
                                    cx="120"
                                    cy="120"
                                    r="100"
                                    fill="none"
                                    stroke="#f3f4f6"
                                    strokeWidth="40"
                                />
                                {totalStatus > 0 &&
                                    pieChartData.reduce(
                                        (acc, item, index) => {
                                            const startAngle = acc.angle;
                                            const sliceAngle = (item.value / totalStatus) * 360;
                                            const endAngle = startAngle + sliceAngle;

                                            const startRad = ((startAngle - 90) * Math.PI) / 180;
                                            const endRad = ((endAngle - 90) * Math.PI) / 180;

                                            const x1 = 120 + 100 * Math.cos(startRad);
                                            const y1 = 120 + 100 * Math.sin(startRad);
                                            const x2 = 120 + 100 * Math.cos(endRad);
                                            const y2 = 120 + 100 * Math.sin(endRad);

                                            const largeArc = sliceAngle > 180 ? 1 : 0;

                                            acc.elements.push(
                                                <path
                                                    key={index}
                                                    d={`M 120 120 L ${x1} ${y1} A 100 100 0 ${largeArc} 1 ${x2} ${y2} Z`}
                                                    fill={item.color}
                                                    className="hover:opacity-80 transition-opacity cursor-pointer"
                                                />
                                            );

                                            acc.angle = endAngle;
                                            return acc;
                                        },
                                        { angle: 0, elements: [] }
                                    ).elements}
                                <circle cx="120" cy="120" r="60" fill="white" />
                            </svg>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                                <div className="text-sm text-gray-600 font-medium">Tổng tin</div>
                                <div className="text-3xl font-bold text-gray-800">
                                    {totalStatus}
                                </div>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="w-full lg:w-1/2 space-y-3">
                            {pieChartData.map((item, index) => {
                                const percent = totalStatus
                                    ? Math.round((item.value / totalStatus) * 100)
                                    : 0;
                                return (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-4 rounded-xl hover:shadow-md transition-all cursor-pointer"
                                        style={{ backgroundColor: `${item.color}15` }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-5 h-5 rounded-full shadow-sm"
                                                style={{ backgroundColor: item.color }}
                                            ></div>
                                            <span className="font-semibold text-gray-700">
                                                {item.name}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-gray-800">
                                                {item.value}
                                            </div>
                                            <div className="text-sm text-gray-500">{percent}%</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
