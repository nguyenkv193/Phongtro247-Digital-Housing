import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ReportsManagement = () => {
    const [selectedRange, setSelectedRange] = useState('30');
    const [customDate, setCustomDate] = useState('');
    const [reportData, setReportData] = useState({
        rooms: { total: 0, rented: 0, empty: 0 },
        tenants: { total: 0 },
        contracts: { expiring: 0 },
        finance: { totalIncome: 0, totalExpense: 0, profit: 0 },
    });

    const ranges = [
        { label: '7 ngày qua', value: '7' },
        { label: '30 ngày qua', value: '30' },
        { label: '90 ngày qua', value: '90' },
    ];

    useEffect(() => {
        fetchReports();
    }, [selectedRange]);

    const fetchReports = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const res = await axios.get('http://localhost:5175/api/reports', {
                headers: { Authorization: `Bearer ${token}` },
                params: { days: selectedRange },
            });
            setReportData(res.data.data);
        } catch (err) {
            console.error('Lỗi khi lấy báo cáo:', err);
        }
    };

    const handleCustomDateChange = e => {
        const selectedDate = e.target.value;
        setCustomDate(selectedDate);

        if (selectedDate) {
            const today = new Date();
            const selected = new Date(selectedDate);
            const diffTime = Math.abs(today - selected);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            setSelectedRange(diffDays.toString());
        }
    };

    const formatCurrency = amount => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    return (
        <div className="bg-gray-50 h-fit">
            {/* Bộ lọc ngày thống kê */}
            <div className="bg-white p-4 rounded-lg shadow mb-6 flex md:flex-row flex-col md:items-center gap-4 md:gap-8">
                <div className="flex gap-4">
                    {ranges.map(range => (
                        <button
                            key={range.value}
                            onClick={() => setSelectedRange(range.value)}
                            className={`px-4 py-2 rounded text-sm cursor-pointer ${
                                selectedRange === range.value
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700'
                            }`}
                        >
                            {range.label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="date"
                        value={customDate}
                        onChange={handleCustomDateChange}
                        max={new Date().toISOString().split('T')[0]}
                        className="border border-gray-300 rounded px-3 py-[6px] text-sm"
                    />
                    <span className="text-gray-600 text-sm">
                        {customDate
                            ? `Thống kê từ ${new Date(customDate).toLocaleDateString('vi-VN')}`
                            : 'Chọn ngày bắt đầu'}
                    </span>
                </div>
            </div>

            {/* Nội dung chính */}
            <div className="grid grid-cols-4 gap-6">
                <div className="col-span-4 xl:col-span-3 bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-[#2e2a2a] mb-4">
                        TÌNH TRẠNG PHÒNG CHO THUÊ
                    </h2>
                    <div className="grid md:grid-cols-4 sm:grid-cols-3 grid-cols-2 gap-4">
                        <div className="text-white">
                            <p className="text-xs sm:text-sm bg-[#006ffd] rounded-tl-lg rounded-tr-lg p-2">
                                Tổng số phòng
                            </p>
                            <p className="text-2xl bg-[#2897ff] rounded-bl-lg rounded-br-lg p-2 font-bold">
                                {reportData.rooms.total}
                            </p>
                        </div>
                        <div className="text-white">
                            <p className="text-xs sm:text-sm bg-[#006ffd] rounded-tl-lg rounded-tr-lg p-2">
                                Số phòng trống
                            </p>
                            <p className="text-2xl bg-[#2897ff] rounded-bl-lg rounded-br-lg p-2 font-bold">
                                {reportData.rooms.empty}
                            </p>
                        </div>
                        <div className="text-white">
                            <p className="text-xs sm:text-sm bg-[#006ffd] rounded-tl-lg rounded-tr-lg p-2">
                                Số phòng cho thuê
                            </p>
                            <p className="text-2xl bg-[#2897ff] rounded-bl-lg rounded-br-lg p-2 font-bold">
                                {reportData.rooms.rented}
                            </p>
                        </div>
                        <div className="text-white">
                            <p className="text-xs sm:text-sm bg-[#006ffd] rounded-tl-lg rounded-tr-lg p-2">
                                Số khách thuê
                            </p>
                            <p className="text-2xl bg-[#2897ff] rounded-bl-lg rounded-br-lg p-2 font-bold">
                                {reportData.tenants.total}
                            </p>
                        </div>
                        <div className="text-white">
                            <p className="text-xs sm:text-sm bg-[#ff5c00] rounded-tl-lg rounded-tr-lg p-2">
                                Hợp đồng gần đến hạn
                            </p>
                            <p className="text-2xl bg-[#ff8d4d] rounded-bl-lg rounded-br-lg p-2 font-bold">
                                {reportData.contracts.expiring}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Cột 4: Thống kê tài chính */}
                <div className="xl:col-span-1 col-span-4 bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4">THỐNG KÊ TÀI CHÍNH</h2>
                    <div className="space-y-3">
                        <div className="bg-blue-100 p-3 rounded flex justify-between">
                            <span className="text-gray-700 font-medium text-sm">
                                Tổng khoản thu
                            </span>
                            <span className="font-bold text-blue-700">
                                {formatCurrency(reportData.finance.totalIncome)}
                            </span>
                        </div>
                        <div className="bg-orange-100 p-3 rounded flex justify-between">
                            <span className="text-gray-700 font-medium text-sm">
                                Tổng khoản chi
                            </span>
                            <span className="font-bold text-orange-600">
                                {formatCurrency(reportData.finance.totalExpense)}
                            </span>
                        </div>
                        <div className="bg-green-100 p-3 rounded flex justify-between">
                            <span className="text-gray-700 font-medium text-sm">Lợi nhuận</span>
                            <span
                                className={`font-bold ${
                                    reportData.finance.profit >= 0
                                        ? 'text-green-700'
                                        : 'text-red-600'
                                }`}
                            >
                                {formatCurrency(reportData.finance.profit)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportsManagement;
