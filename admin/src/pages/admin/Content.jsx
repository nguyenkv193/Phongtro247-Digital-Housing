import React from 'react';

const Content = () => {
    return (
        <div className="space-y-4">
            <h1 className="text-lg font-semibold text-gray-800">Nội dung</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm h-40">
                    Blog/Tin tức (placeholder)
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm h-40">
                    Banner/Quảng cáo (placeholder)
                </div>
            </div>
        </div>
    );
};

export default Content;
