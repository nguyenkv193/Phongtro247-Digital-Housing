import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import React from 'react';

const ServicesManagement = () => {
    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-4 flex md:flex-row flex-col md:items-center justify-between gap-y-4">
                <h2 className="text-lg font-semibold text-[#2e2a2a]">QUẢN LÝ DỊCH VỤ</h2>
                <div className="flex items-center md:flex-row flex-col gap-y-2 flex-wrap gap-x-2 mb-4">
                    <div className="md:w-auto w-full relative">
                        <input
                            type="text"
                            placeholder="Tìm kiếm"
                            className="border border-gray-300 rounded pl-9 px-3 py-2 outline-0 text-sm w-full"
                        />
                        <FontAwesomeIcon
                            icon={faMagnifyingGlass}
                            className="absolute top-1/2 left-2 -translate-y-1/2 text-[#65676b]"
                        />
                    </div>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer hover:opacity-80 transition-opacity duration-300 w-full md:w-fit">
                        + Thêm khách
                    </button>
                </div>
            </div>

            {/* Bảng khách thuê */}
            <div className="w-full overflow-x-auto scrollbar-thin">
                <table className="min-w-[900px] w-full text-sm border-collapse">
                    <thead>
                        <tr className="bg-[#f9f9f9] text-[#2e2a2a] text-sm">
                            <th className="border border-[#eaecf0] p-2 text-left font-[500]">
                                Tên dịch vụ
                            </th>
                            <th className="border border-[#eaecf0] p-2 text-left font-[500]">
                                Đơn vị tính
                            </th>
                            <th className="border border-[#eaecf0] p-2 text-left font-[500]">
                                Giá dịch vụ
                            </th>
                            <th className="border border-[#eaecf0] p-2 text-left font-[500]">
                                Dãy trọ{' '}
                            </th>
                            <th className="border border-[#eaecf0] p-2 text-left font-[500]">
                                Loại phòng áp dụng
                            </th>
                            <th className="border border-[#eaecf0] p-2 text-left font-[500]">
                                Thao tác
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colSpan={9} className="text-center p-4 text-gray-500">
                                Không có bản ghi nào!
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ServicesManagement;
