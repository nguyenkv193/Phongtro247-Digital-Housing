import React, { useState, useEffect, type ChangeEvent } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import type { Contract, EntityId, Tenant } from '@/types';

interface ContractListing {
    id: EntityId;
    listing_type?: string;
    listing_type_name?: string;
    listing_type_id?: EntityId;
    room_name?: string;
    price?: string | number;
}

interface ContractRecord extends Contract {
    created_at: string;
    start_date: string;
    end_date: string;
    room_name?: string;
}

interface ContractFormData {
    loai_hinh: string;
    tro_id: string;
    tenant_id: EntityId | '';
    ngay_vao: string;
    ngay_ket_thuc: string;
    gia_thue: string;
    gia_coc: string;
    ghi_chu: string;
}

const ContractManagement = () => {
    const [showPopup, setShowPopup] = useState(false);
    const [listings, setListings] = useState<ContractListing[]>([]);
    const [filteredListings, setFilteredListings] = useState<ContractListing[]>([]);
    const [selectedLoaiHinh, setSelectedLoaiHinh] = useState('');
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
    const [contracts, setContracts] = useState<ContractRecord[]>([]);
    const [editingContract, setEditingContract] = useState<ContractRecord | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('');

    const [formData, setFormData] = useState<ContractFormData>({
        loai_hinh: '',
        tro_id: '',
        tenant_id: '',
        ngay_vao: '',
        ngay_ket_thuc: '',
        gia_thue: '',
        gia_coc: '',
        ghi_chu: '',
    });

    useEffect(() => {
        const fetchListings = async () => {
            try {
                const res = await axios.get('http://localhost:5175/api/contracts/listings/by-type');
                setListings(res.data);
            } catch (error) {
                console.error('Lỗi lấy danh sách trọ:', error);
            }
        };
        fetchListings();
    }, []);

    const handleLoaiHinhChange = (e: ChangeEvent<HTMLSelectElement>): void => {
        const loai = e.target.value;
        setSelectedLoaiHinh(loai);
        setFormData({ ...formData, loai_hinh: loai });
        if (loai) {
            const filtered = listings.filter(item => item.listing_type === loai);
            setFilteredListings(filtered);
        } else {
            setFilteredListings([]);
        }
    };

    useEffect(() => {
        const fetchTenants = async () => {
            try {
                const res = await axios.get('http://localhost:5175/api/contracts/tenants');

                setTenants(res.data);
            } catch (err) {
                console.error('Lỗi lấy danh sách khách thuê:', err);
            }
        };
        fetchTenants();
    }, []);

    const handleTroChange = (e: ChangeEvent<HTMLSelectElement>): void => {
        const selectedListingId = e.target.value;
        const selectedListing = listings.find(l => String(l.id) === selectedListingId);

        let formattedPrice = '';
        if (selectedListing && selectedListing.price) {
            console.log('Original price from API:', selectedListing.price);
            console.log('Type of price:', typeof selectedListing.price);

            const priceValue = Number(selectedListing.price);
            console.log('Parsed price value:', priceValue);

            formattedPrice = Math.round(priceValue).toString();
            console.log('Formatted price:', formattedPrice);
        }

        setFormData({
            ...formData,
            tro_id: selectedListingId,
            gia_thue: formattedPrice,
        });
    };

    const handleSave = async () => {
        try {
            if (
                !formData.tro_id ||
                !formData.ngay_vao ||
                !formData.ngay_ket_thuc ||
                !formData.gia_thue ||
                !formData.gia_coc
            ) {
                alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
                return;
            }

            if (!formData.tenant_id && !isEditing) {
                alert('Vui lòng chọn khách thuê!');
                return;
            }

            const selectedListing = listings.find(l => String(l.id) === formData.tro_id);

            if (isEditing && editingContract) {
                await axios.put(`http://localhost:5175/api/contracts/${editingContract.id}`, {
                    start_date: formData.ngay_vao,
                    end_date: formData.ngay_ket_thuc,
                    deposit_price: formData.gia_coc,
                    rent_price: formData.gia_thue,
                    note: formData.ghi_chu,
                    listing_id: formData.tro_id,
                });

                alert('Cập nhật hợp đồng thành công!');
                await fetchContracts();
            } else {
                await axios.post('http://localhost:5175/api/contracts', {
                    tenant_id: formData.tenant_id,
                    listing_id: formData.tro_id,
                    listing_type_id: selectedListing ? selectedListing.listing_type_id : null,
                    start_date: formData.ngay_vao,
                    end_date: formData.ngay_ket_thuc,
                    rent_price: formData.gia_thue,
                    deposit_price: formData.gia_coc,
                    note: formData.ghi_chu,
                });
                alert('Tạo hợp đồng thành công!');
                await fetchContracts();
            }

            setShowPopup(false);
            setIsEditing(false);
            setEditingContract(null);
             setFormData({
                 loai_hinh: '',
                 tro_id: '',
                 tenant_id: '',
                 ngay_vao: '',
                ngay_ket_thuc: '',
                gia_thue: '',
                gia_coc: '',
                ghi_chu: '',
            });
        } catch (err) {
            console.error('❌ Lỗi khi lưu hợp đồng:', err);
            alert('Không thể lưu hợp đồng!');
        }
    };

    const fetchContracts = async () => {
        try {
            const res = await axios.get('http://localhost:5175/api/contracts');
            setContracts(res.data);
        } catch (err) {
            console.error('Lỗi khi tải lại danh sách hợp đồng:', err);
        }
    };

    useEffect(() => {
        fetchContracts();
    }, []);

    const handleDelete = async (id: EntityId): Promise<void> => {
        if (!window.confirm('Bạn có chắc muốn xóa hợp đồng này không?')) return;

        try {
            await axios.delete(`http://localhost:5175/api/contracts/${id}`);
            alert('Xóa hợp đồng thành công!');
            setContracts(prev => prev.filter(c => c.id !== id));
        } catch (err) {
            console.error('❌ Lỗi xóa hợp đồng:', err);
            alert('Không thể xóa hợp đồng!');
        }
    };

    const handleEdit = (contract: ContractRecord): void => {
        setEditingContract(contract);
        setIsEditing(true);
        setShowPopup(true);

        const loai = contract.listing_type_name || '';
        setSelectedLoaiHinh(loai);

        setSelectedTenant({
            id: contract.tenant_id ?? '',
            name: contract.tenant_name,
            phone: contract.tenant_phone,
        });

        setFormData({
            loai_hinh: loai,
            tro_id: contract.listing_id ? String(contract.listing_id) : '',
            ngay_vao: contract.start_date
                ? new Date(contract.start_date).toISOString().split('T')[0]
                : '',
            ngay_ket_thuc: contract.end_date
                ? new Date(contract.end_date).toISOString().split('T')[0]
                : '',
            gia_thue: contract.rent_price != null ? String(contract.rent_price) : '',
            gia_coc: contract.deposit_price != null ? String(contract.deposit_price) : '',
            ghi_chu: contract.note || '',
            tenant_id: contract.tenant_id || '',
        });

        setTimeout(() => {
            let filtered = listings.filter(
                item => item.listing_type === loai || item.listing_type_name === loai
            );

            if (!filtered.some(t => t.id === contract.listing_id)) {
                const currentTro = listings.find(t => t.id === contract.listing_id);
                if (currentTro) filtered = [currentTro, ...filtered];
            }

            setFilteredListings(filtered);
        }, 150);
    };

    useEffect(() => {
        if (selectedLoaiHinh) {
            const filtered = listings.filter(item => item.listing_type === selectedLoaiHinh);
            setFilteredListings(filtered);
        } else {
            setFilteredListings([]);
        }
    }, [selectedLoaiHinh, listings]);

    return (
        <div className="bg-white rounded-lg shadow p-6 relative">
            <h2 className="text-lg font-semibold mb-4 text-[#2e2a2a]">QUẢN LÝ HỢP ĐỒNG</h2>

            <div className="flex flex-col gap-y-2 mb-4 p-3 bg-[#f9f9f9] border border-gray-200 rounded-lg">
                <h2 className="font-[500] text-sm text-[#2e2a2a]">Trạng thái</h2>
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-x-5 mb-4">
                        {[
                            'Tất cả',
                            'Đang hiệu lực',
                            'Sắp đến hạn',
                            'Đã quá hạn',
                            'Đã kết thúc',
                        ].map(label => (
                            <label
                                key={label}
                                className="flex items-center gap-x-2 text-sm text-[#2e2a2a]"
                            >
                                <input
                                    type="radio"
                                    name="status"
                                    value={label}
                                    checked={selectedStatus === label}
                                    onChange={e => setSelectedStatus(e.target.value)}
                                />
                                {label}
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex items-center md:flex-row flex-col gap-y-2 flex-wrap gap-x-2 mb-4">
                <div className="md:ml-auto md:w-1/3 w-full relative">
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
                <button
                    onClick={() => setShowPopup(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer hover:opacity-80 transition-opacity duration-300 w-full md:w-fit"
                >
                    + Lập hợp đồng
                </button>
            </div>

            <div className="w-full overflow-x-auto scrollbar-thin">
                <table className="min-w-[900px] w-full text-sm border-collapse">
                    <thead>
                        <tr className="bg-[#f9f9f9] text-[#2e2a2a] text-sm">
                            {[
                                'Mã hợp đồng',
                                'Tên trọ',
                                'Người đại diện',

                                'Ngày lập',
                                'Ngày vào',
                                'Ngày đến hạn',
                                'Ngày kết thúc',
                                'Tình trạng',
                                'Thao tác',
                            ].map(head => (
                                <th
                                    key={head}
                                    className="border border-[#eaecf0] p-2 text-left font-[500]"
                                >
                                    {head}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {contracts.length === 0 ? (
                            <tr>
                                <td
                                     colSpan={10}
                                    className="text-center border-[#eaecf0] p-4 text-gray-500"
                                >
                                    Không có bản ghi nào!
                                </td>
                            </tr>
                        ) : (
                            contracts
                                .filter(c => {
                                    if (!selectedStatus) return true;
                                    const today = new Date();
                                    const endDate = new Date(c.end_date);
                                    const diffDays = Math.ceil(
                                         (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
                                    );
                                    if (selectedStatus === 'Tất cả') return true;
                                    if (selectedStatus === 'Đang hiệu lực') return diffDays > 7;
                                    if (selectedStatus === 'Sắp đến hạn')
                                        return diffDays > 0 && diffDays <= 7;
                                    if (selectedStatus === 'Đã quá hạn') return diffDays < 0;
                                    if (selectedStatus === 'Đã kết thúc')
                                        return c.status === 'Đã kết thúc';
                                    return true;
                                })
                                .map(c => (
                                    <tr key={c.id}>
                                        <td className="border border-[#eaecf0] p-2">{c.id}</td>
                                        <td className="border border-[#eaecf0] p-2">
                                            {c.room_name}
                                        </td>
                                        <td className="border border-[#eaecf0] p-2">
                                            {c.tenant_name}
                                        </td>

                                        <td className="border border-[#eaecf0] p-2">
                                            {new Date(c.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="border border-[#eaecf0] p-2">
                                            {new Date(c.start_date).toLocaleDateString()}
                                        </td>
                                        <td className="border border-[#eaecf0] p-2 font-semibold">
                                            {(() => {
                                                const today = new Date();
                                                const endDate = new Date(c.end_date);
                                                 const diffTime = endDate.getTime() - today.getTime();
                                                const diffDays = Math.ceil(
                                                    diffTime / (1000 * 60 * 60 * 24)
                                                );

                                                let text = '';
                                                let color = '';

                                                if (diffDays > 7) {
                                                    text = `Còn ${diffDays} ngày`;
                                                    color = 'text-green-600';
                                                } else if (diffDays > 0) {
                                                    text = `Còn ${diffDays} ngày`;
                                                    color = 'text-orange-500';
                                                } else if (diffDays === 0) {
                                                    text = 'Hết hạn hôm nay';
                                                    color = 'text-red-600';
                                                } else {
                                                    text = `Đã quá hạn ${Math.abs(diffDays)} ngày`;
                                                    color = 'text-red-600';
                                                }

                                                return <span className={color}>{text}</span>;
                                            })()}
                                        </td>

                                        <td className="border border-[#eaecf0] p-2">
                                            {new Date(c.end_date).toLocaleDateString()}
                                        </td>
                                        <td className="border border-[#eaecf0] p-2">{c.status}</td>
                                        <td className="border border-[#eaecf0] p-2 flex gap-2">
                                            <button
                                                onClick={() => handleEdit(c)}
                                                className="px-3 py-1 cursor-pointer bg-yellow-400 text-white rounded hover:opacity-80 text-xs"
                                            >
                                                Sửa
                                            </button>

                                            <button
                                                onClick={() => handleDelete(c.id)}
                                                className="px-3 cursor-pointer py-1 bg-red-600 text-white rounded hover:opacity-80 text-xs"
                                            >
                                                Xóa
                                            </button>
                                        </td>
                                    </tr>
                                ))
                        )}
                    </tbody>
                </table>
            </div>

            {showPopup && (
                <div className="fixed inset-0 bg-opacity-20 flex items-center justify-center z-50 bg-black/70">
                    <div className="bg-white rounded-2xl w-[700px] max-h-[90vh] overflow-y-auto shadow-lg p-6 relative">
                        <h2 className="text-lg font-semibold mb-4 text-[#2e2a2a] text-center">
                            {isEditing ? 'SỬA HỢP ĐỒNG' : 'LẬP HỢP ĐỒNG'}
                        </h2>

                        <div className="mb-6">
                            <h3 className="font-semibold text-sm text-[#2e2a2a] mb-2">
                                Thông tin hợp đồng
                            </h3>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Loại hình cho thuê */}
                                <div>
                                    <label className="text-sm font-medium">
                                        Loại hình cho thuê <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        className="border border-gray-300 rounded px-3 py-2 w-full text-sm mt-1"
                                        value={selectedLoaiHinh}
                                        onChange={handleLoaiHinhChange}
                                    >
                                        <option value="">Vui lòng chọn</option>
                                        {[...new Set(listings.map(l => l.listing_type))].map(
                                            loai => (
                                                 <option key={loai} value={loai}>
                                                    {loai}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>

                                {/* Chọn trọ */}
                                <div>
                                    <label className="text-sm font-medium">
                                        Chọn trọ <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        className="border border-gray-300 rounded px-3 py-2 w-full text-sm mt-1"
                                        value={formData.tro_id}
                                        onChange={handleTroChange}
                                    >
                                        <option value="">Vui lòng chọn</option>
                                        {filteredListings.map(tro => (
                                            <option key={tro.id} value={tro.id}>
                                                {tro.room_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Chọn khách thuê */}
                                <div>
                                    <label className="text-sm font-medium">
                                        Khách thuê <span className="text-red-500">*</span>
                                    </label>

                                    {isEditing ? (
                                        <div className="border border-gray-300 rounded px-3 py-2 w-full text-sm mt-1 bg-gray-100">
                                            {selectedTenant ? (
                                                <>
                                                    <p>
                                                        <strong>Họ tên:</strong>{' '}
                                                        {selectedTenant.name}
                                                    </p>
                                                    <p>
                                                        <strong>Điện thoại:</strong>{' '}
                                                        {selectedTenant.phone}
                                                    </p>
                                                </>
                                            ) : (
                                                <p className="text-gray-500">
                                                    Không có dữ liệu khách thuê
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <select
                                            className="border border-gray-300 rounded px-3 py-2 w-full text-sm mt-1"
                                            value={formData.tenant_id || ''}
                                            onChange={e => {
                                                const tenant = tenants.find(
                                                    t => t.id === parseInt(e.target.value)
                                                );
                                                setSelectedTenant(tenant || null);
                                                setFormData({
                                                    ...formData,
                                                    tenant_id: tenant ? tenant.id : '',
                                                });
                                            }}
                                        >
                                            <option value="">Vui lòng chọn khách thuê</option>
                                            {tenants.map(t => (
                                                <option key={t.id} value={t.id}>
                                                    {t.name} - {t.phone}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                {/* Ngày khách vào */}
                                <div>
                                    <label className="text-sm font-medium">
                                        Ngày khách vào <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        className="border border-gray-300 rounded px-3 py-2 w-full text-sm mt-1"
                                        value={formData.ngay_vao}
                                        onChange={e =>
                                            setFormData({ ...formData, ngay_vao: e.target.value })
                                        }
                                    />
                                </div>

                                {/* Ngày kết thúc */}
                                <div>
                                    <label className="text-sm font-medium">
                                        Ngày kết thúc <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        className="border border-gray-300 rounded px-3 py-2 w-full text-sm mt-1"
                                        value={formData.ngay_ket_thuc}
                                        onChange={e =>
                                            setFormData({
                                                ...formData,
                                                ngay_ket_thuc: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                {/* Giá thuê */}
                                <div>
                                    <label className="text-sm font-medium">
                                        Giá thuê <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Vui lòng nhập"
                                        className="border border-gray-300 rounded px-3 py-2 w-full text-sm mt-1"
                                        value={formData.gia_thue}
                                        onChange={e =>
                                            setFormData({ ...formData, gia_thue: e.target.value })
                                        }
                                    />
                                </div>

                                {/* Giá cọc */}
                                <div>
                                    <label className="text-sm font-medium">
                                        Giá cọc <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Vui lòng nhập"
                                        className="border border-gray-300 rounded px-3 py-2 w-full text-sm mt-1"
                                        value={formData.gia_coc}
                                        onChange={e =>
                                            setFormData({ ...formData, gia_coc: e.target.value })
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        {/* GHI CHÚ */}
                        <div className="mb-6">
                            <h3 className="font-semibold text-sm text-[#2e2a2a] mb-2">Ghi chú</h3>
                            <textarea
                                 rows={3}
                                placeholder="Nhập ghi chú hợp đồng"
                                className="border border-gray-300 rounded px-3 py-2 w-full text-sm"
                                value={formData.ghi_chu}
                                onChange={e =>
                                    setFormData({ ...formData, ghi_chu: e.target.value })
                                }
                            ></textarea>
                        </div>

                        {/* NÚT HÀNH ĐỘNG */}
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setShowPopup(false);
                                    setIsEditing(false);
                                    setEditingContract(null);
                                }}
                                className="px-4 py-2 rounded border border-gray-300 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                Đóng
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 rounded bg-blue-600 text-white text-sm font-semibold hover:opacity-90"
                            >
                                Lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContractManagement;
