import React from 'react';

const Plans = () => {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold text-gray-800">Gói dịch vụ</h1>
                <button className="px-3 py-2 text-sm rounded-md border bg-white shadow-sm">
                    Tạo gói
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="font-semibold">Tin thường</div>
                    <div className="text-sm text-gray-500">100.000đ</div>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="font-semibold">Tin HOT</div>
                    <div className="text-sm text-gray-500">130.000đ</div>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="font-semibold">Tin VIP</div>
                    <div className="text-sm text-gray-500">100.000đ/ tuần</div>
                </div>
            </div>
        </div>
    );
};

export default Plans;
