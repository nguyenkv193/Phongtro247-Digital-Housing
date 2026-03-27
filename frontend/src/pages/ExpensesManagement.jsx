import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ExpensesManagement = () => {
    const [transactions, setTransactions] = useState([]);
    const [summary, setSummary] = useState({
        totalIncome: 0,
        totalExpense: 0,
        profit: 0,
    });
    const [filterType, setFilterType] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchExpenses();
    }, [filterType]);

    const fetchExpenses = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const params = {};
            if (filterType === 'income') params.type = 'income';
            if (filterType === 'expense') params.type = 'expense';

            const res = await axios.get('http://localhost:5175/api/expenses', {
                headers: { Authorization: `Bearer ${token}` },
                params,
            });

            setTransactions(res.data.data);
            setSummary(res.data.summary);
        } catch (err) {
            console.error('Lỗi khi lấy danh sách thu chi:', err);
        }
    };

    const formatCurrency = amount => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    const filteredTransactions = transactions.filter(t => {
        const searchLower = searchTerm.toLowerCase();
        return (
            t.listing_name?.toLowerCase().includes(searchLower) ||
            t.tenant_name?.toLowerCase().includes(searchLower) ||
            t.category?.toLowerCase().includes(searchLower)
        );
    });

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 text-[#2e2a2a]">QUẢN LÝ THU CHI</h2>

            <div className="flex flex-col gap-y-2 mb-4 p-3 bg-[#f9f9f9] border border-gray-200 rounded-lg">
                <h2 className="font-[500] text-sm text-[#2e2a2a]">Loại giao dịch</h2>
                <div className="flex gap-x-4">
                    <label className="flex items-center gap-x-2 text-sm text-[#2e2a2a]">
                        <input
                            type="radio"
                            name="type"
                            value="all"
                            checked={filterType === 'all'}
                            onChange={e => setFilterType(e.target.value)}
                        />{' '}
                        Tất cả
                    </label>
                    <label className="flex items-center gap-x-2 text-sm text-[#2e2a2a]">
                        <input
                            type="radio"
                            name="type"
                            value="income"
                            checked={filterType === 'income'}
                            onChange={e => setFilterType(e.target.value)}
                        />{' '}
                        Khoản thu
                    </label>
                    <label className="flex items-center gap-x-2 text-sm text-[#2e2a2a]">
                        <input
                            type="radio"
                            name="type"
                            value="expense"
                            checked={filterType === 'expense'}
                            onChange={e => setFilterType(e.target.value)}
                        />{' '}
                        Khoản chi
                    </label>
                </div>
            </div>

            {/* Tổng hợp thu chi */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-md">
                    <p className="text-gray-700 text-sm mb-1">Tổng khoản thu</p>
                    <p className="text-blue-600 font-bold text-lg">
                        {formatCurrency(summary.totalIncome)}
                    </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-md">
                    <p className="text-gray-700 text-sm mb-1">Tổng khoản chi</p>
                    <p className="text-orange-500 font-bold text-lg">
                        {formatCurrency(summary.totalExpense)}
                    </p>
                </div>
                <div className="bg-green-50 p-4 rounded-md">
                    <p className="text-gray-700 text-sm mb-1">Lợi nhuận</p>
                    <p
                        className={`font-bold text-lg ${
                            summary.profit >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                    >
                        {formatCurrency(summary.profit)}
                    </p>
                </div>
            </div>

            {/* Thanh tìm kiếm */}
            <div className="flex items-center md:flex-row flex-col gap-y-2 flex-wrap gap-x-2 mb-4">
                <div className="md:ml-auto md:w-1/3 w-full relative">
                    <input
                        type="text"
                        placeholder="Tìm kiếm"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="border border-gray-300 rounded pl-9 px-3 py-2 outline-0 text-sm w-full"
                    />
                    <FontAwesomeIcon
                        icon={faMagnifyingGlass}
                        className="absolute top-1/2 left-2 -translate-y-1/2 text-[#65676b]"
                    />
                </div>
            </div>

            {/* Bảng danh sách giao dịch */}
            <div className="w-full overflow-x-auto scrollbar-thin">
                <table className="min-w-[900px] w-full text-sm border-collapse">
                    <thead>
                        <tr className="bg-[#f9f9f9] text-[#2e2a2a] text-sm">
                            <th className="border border-[#eaecf0] p-2 text-left font-[500]">
                                Ngày
                            </th>
                            <th className="border border-[#eaecf0] p-2 text-left font-[500]">
                                Loại
                            </th>
                            <th className="border border-[#eaecf0] p-2 text-left font-[500]">
                                Danh mục
                            </th>
                            <th className="border border-[#eaecf0] p-2 text-left font-[500]">
                                Mô tả
                            </th>
                            <th className="border border-[#eaecf0] p-2 text-left font-[500]">
                                Khách thuê
                            </th>
                            <th className="border border-[#eaecf0] p-2 text-left font-[500]">
                                Số tiền
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTransactions.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center p-4 text-gray-500">
                                    Không có bản ghi nào!
                                </td>
                            </tr>
                        ) : (
                            filteredTransactions.map((t, index) => (
                                <tr key={index}>
                                    <td className="border border-[#eaecf0] p-2">
                                        {new Date(t.date).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="border border-[#eaecf0] p-2">
                                        <span
                                            className={`px-2 py-1 rounded text-xs font-semibold ${
                                                t.type === 'Thu'
                                                    ? 'bg-blue-100 text-blue-600'
                                                    : 'bg-orange-100 text-orange-600'
                                            }`}
                                        >
                                            {t.type}
                                        </span>
                                    </td>
                                    <td className="border border-[#eaecf0] p-2">{t.category}</td>
                                    <td className="border border-[#eaecf0] p-2">
                                        {t.listing_name || '-'}
                                    </td>
                                    <td className="border border-[#eaecf0] p-2">
                                        {t.tenant_name || '-'}
                                    </td>
                                    <td
                                        className={`border border-[#eaecf0] p-2 font-semibold ${
                                            t.type === 'Thu' ? 'text-blue-600' : 'text-orange-600'
                                        }`}
                                    >
                                        {t.type === 'Thu' ? '+' : '-'}
                                        {formatCurrency(t.amount)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ExpensesManagement;
