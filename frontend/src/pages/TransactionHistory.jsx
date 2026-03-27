/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { Loader2 } from 'lucide-react';

const TransactionHistory = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { currentUser } = useUser();

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            setError('');

            const token = localStorage.getItem('auth_token');

            if (!token) {
                setError('Vui lòng đăng nhập');
                setLoading(false);
                return;
            }

            const response = await fetch('http://localhost:5175/api/transactions/history', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (data.success) {
                setTransactions(data.transactions);
            } else {
                setError(data.message || 'Không thể lấy lịch sử giao dịch');
            }
        } catch (err) {
            console.error('Fetch transactions error:', err);
            setError('Có lỗi xảy ra khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    <span className="ml-2 text-gray-600">Đang tải...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-center py-8">
                    <p className="text-red-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4 text-[#2e2a2a] uppercase">
                Lịch sử giao dịch
            </h2>

            {transactions.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500">Chưa có giao dịch nào</p>
                </div>
            ) : (
                <div className="w-full overflow-x-auto scrollbar-thin">
                    <table className="min-w-[900px] w-full text-sm border-collapse">
                        <thead>
                            <tr className="bg-[#f9f9f9] text-[#2e2a2a] text-sm">
                                <th className="border border-[#eaecf0] px-4 py-2 text-left">
                                    Ngày
                                </th>
                                <th className="border border-[#eaecf0] px-4 py-2 text-left">
                                    Loại giao dịch
                                </th>
                                <th className="border border-[#eaecf0] px-4 py-2 text-left">
                                    Mô tả
                                </th>
                                <th className="border border-[#eaecf0] px-4 py-2 text-right">
                                    Số tiền
                                </th>
                                <th className="border border-[#eaecf0] px-4 py-2 text-center">
                                    Trạng thái
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map(t => (
                                <tr key={t.id} className="hover:bg-gray-50 text-sm">
                                    <td className="border border-[#eaecf0] px-4 py-2">{t.date}</td>
                                    <td className="border border-[#eaecf0] px-4 py-2">
                                        <span
                                            className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                                t.type === 'Nạp tiền'
                                                    ? 'bg-green-100 text-green-700'
                                                    : t.type === 'Thanh toán'
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'bg-orange-100 text-orange-700'
                                            }`}
                                        >
                                            {t.type}
                                        </span>
                                    </td>
                                    <td className="border border-[#eaecf0] px-4 py-2 text-gray-600">
                                        {t.description}
                                    </td>
                                    <td className="border border-[#eaecf0] px-4 py-2 text-right">
                                        <span
                                            className={`font-semibold ${
                                                t.type === 'Nạp tiền' || t.type === 'Hoàn tiền'
                                                    ? 'text-green-600'
                                                    : 'text-red-600'
                                            }`}
                                        >
                                            {t.type === 'Nạp tiền' || t.type === 'Hoàn tiền'
                                                ? '+'
                                                : '-'}
                                            {Number(t.amount).toLocaleString('vi-VN')}₫
                                        </span>
                                    </td>
                                    <td className="border border-[#eaecf0] px-4 py-2 text-center">
                                        <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                                            {t.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination nếu cần */}
            {transactions.length > 0 && (
                <div className="mt-4 text-sm text-gray-500 text-center">
                    Hiển thị {transactions.length} giao dịch
                </div>
            )}
        </div>
    );
};

export default TransactionHistory;
