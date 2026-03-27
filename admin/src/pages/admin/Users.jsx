import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users as UsersIcon, Shield, Home, Search, Lock, Unlock } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5175';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_BASE}/api/admin/users`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const sorted = res.data
                    .map(u => ({ ...u, is_blocked: u.is_blocked || 0 }))
                    .sort((a, b) => a.id - b.id);
                setUsers(sorted);
            } catch (error) {
                console.error('Lỗi khi tải danh sách người dùng:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleToggleBlockUser = async id => {
        const token = localStorage.getItem('token');
        const user = users.find(u => u.id === id);
        const action = user.is_blocked ? 'mở khóa' : 'khóa';
        if (!window.confirm(`Bạn có chắc muốn ${action} tài khoản này?`)) return;

        try {
            const res = await axios.patch(`${API_BASE}/api/admin/users/${id}/block`, null, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setUsers(prev =>
                prev.map(u => (u.id === id ? { ...u, is_blocked: res.data.is_blocked } : u))
            );

            alert(res.data.message);
        } catch (error) {
            console.error('Lỗi khi thay đổi trạng thái tài khoản:', error);
            alert(`${action.charAt(0).toUpperCase() + action.slice(1)} thất bại!`);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                    <p className="mt-4 text-gray-600 font-medium">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    const hosts = users.filter(u => Number(u.has_completed_host_info) === 1 && u.role !== 'admin');
    const customers = users.filter(
        u => Number(u.has_completed_host_info) !== 1 && u.role !== 'admin'
    );
    const admins = users.filter(u => u.role === 'admin');

    const getFilteredUsers = () => {
        let filtered = [];
        switch (activeTab) {
            case 'customers':
                filtered = customers;
                break;
            case 'hosts':
                filtered = hosts;
                break;
            case 'admins':
                filtered = admins;
                break;
            default:
                filtered = [...customers, ...hosts, ...admins];
        }

        if (searchTerm) {
            filtered = filtered.filter(
                u =>
                    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return filtered;
    };

    const filteredUsers = getFilteredUsers();

    const renderBadge = user => {
        if (user.role === 'admin') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm">
                    <Shield size={12} />
                    Admin
                </span>
            );
        }
        if (Number(user.has_completed_host_info) === 1) {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-sm">
                    <Home size={12} />
                    Chủ trọ
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-400 to-cyan-500 text-white shadow-sm">
                <UsersIcon size={12} />
                Người dùng
            </span>
        );
    };

    const tabs = [
        { id: 'all', label: 'Tất cả', count: users.length, icon: UsersIcon },
        { id: 'customers', label: 'Người dùng', count: customers.length, icon: UsersIcon },
        { id: 'hosts', label: 'Chủ trọ', count: hosts.length, icon: Home },
        { id: 'admins', label: 'Quản trị viên', count: admins.length, icon: Shield },
    ];

    return (
        <div className="p-4 md:p-6">
            <div>
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-gray-600 to-gray-900 bg-clip-text text-transparent mb-2">
                        Quản lý tài khoản
                    </h1>
                    <p className="text-gray-600">
                        Quản lý và theo dõi tất cả người dùng trong hệ thống
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <div
                                key={tab.id}
                                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-5 border border-gray-100"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">
                                            {tab.label}
                                        </p>
                                        <p className="text-2xl font-bold text-gray-800 mt-1">
                                            {tab.count}
                                        </p>
                                    </div>
                                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-lg">
                                        <Icon className="text-white" size={24} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        {/* Tabs */}
                        <div className="flex gap-2 flex-wrap">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                                        activeTab === tab.id
                                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {tab.label} ({tab.count})
                                </button>
                            ))}
                        </div>

                        {/* Search */}
                        <div className="relative w-full md:w-80">
                            <Search
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                size={18}
                            />
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo tên hoặc email..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        ID
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Người dùng
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Vai trò
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Trạng thái
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <UsersIcon className="text-gray-300" size={48} />
                                                <p className="text-gray-400 font-medium">
                                                    Không tìm thấy người dùng nào
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user, i) => (
                                        <tr
                                            key={user.id}
                                            className={`hover:bg-gray-50 transition-colors ${
                                                i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                                            }`}
                                        >
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-semibold text-gray-700">
                                                    #{user.id}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {user.avatar ? (
                                                        <img
                                                            src={user.avatar}
                                                            alt={user.full_name}
                                                            className="w-10 h-10 rounded-full object-cover"
                                                            onError={e => {
                                                                e.target.style.display = 'none';
                                                                e.target.nextSibling.style.display =
                                                                    'flex';
                                                            }}
                                                        />
                                                    ) : null}
                                                    <div
                                                        className="w-10 h-10 rounded-full bg-[#006ffd] flex items-center justify-center text-white font-bold"
                                                        style={{
                                                            display: user.avatar ? 'none' : 'flex',
                                                        }}
                                                    >
                                                        {user.full_name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="font-medium text-gray-800">
                                                        {user.full_name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {user.email}
                                            </td>
                                            <td className="px-6 py-4">{renderBadge(user)}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    {user.verified ? (
                                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                                                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                                            Đã xác minh
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500">
                                                            <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                                                            Chưa xác minh
                                                        </span>
                                                    )}
                                                    {user.is_blocked ? (
                                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600">
                                                            <Lock size={12} />
                                                            Đã khóa
                                                        </span>
                                                    ) : null}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleToggleBlockUser(user.id)}
                                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                                        user.is_blocked
                                                            ? 'bg-green-100 text-green-700 hover:bg-green-200 hover:shadow-md'
                                                            : 'bg-red-100 text-red-700 hover:bg-red-200 hover:shadow-md'
                                                    }`}
                                                >
                                                    {user.is_blocked ? (
                                                        <>
                                                            <Unlock size={16} />
                                                            Mở khóa
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Lock size={16} />
                                                            Khóa TK
                                                        </>
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    {filteredUsers.length > 0 && (
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                            <p className="text-sm text-gray-600">
                                Hiển thị{' '}
                                <span className="font-semibold text-gray-800">
                                    {filteredUsers.length}
                                </span>{' '}
                                trong tổng số{' '}
                                <span className="font-semibold text-gray-800">{users.length}</span>{' '}
                                tài khoản
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Users;
