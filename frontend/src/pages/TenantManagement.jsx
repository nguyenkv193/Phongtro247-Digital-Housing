import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const TenantManagement = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const modalRef = useRef(null);
    const [wards, setWards] = useState([]);
    const [tenants, setTenants] = useState([]);
    const [filterStatus, setFilterStatus] = useState('Tất cả');

    const owner_id = localStorage.getItem('user_id') || 1;

    const [formData, setFormData] = useState({
        name: '',
        birthday: '',
        gender: 'Nam',
        ward_id: '',
        address: '',
        phone: '',
        email: '',
        occupation: '',
        cccd: '',
        stay_status: 'Chưa đăng ký',
    });

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const handleOutsideClick = e => {
        if (modalRef.current && !modalRef.current.contains(e.target)) closeModal();
    };

    useEffect(() => {
        fetchTenants();
    }, []);

    const fetchTenants = async () => {
        try {
            const res = await axios.get(`http://localhost:5175/api/tenants?owner_id=${owner_id}`);
            setTenants(res.data);
        } catch (err) {
            console.error('Lỗi tải danh sách khách thuê:', err);
        }
    };

    useEffect(() => {
        if (isModalOpen) {
            axios
                .get('http://localhost:5175/api/tenants/wards')
                .then(res => setWards(res.data))
                .catch(err => console.error('Lỗi tải danh sách phường/xã:', err));
        }
    }, [isModalOpen]);

    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            const payload = { ...formData, owner_id };
            const res = await axios.post('http://localhost:5175/api/tenants', payload);
            alert(res.data.message);
            closeModal();
            setFormData({
                name: '',
                birthday: '',
                gender: 'Nam',
                ward_id: '',
                address: '',
                phone: '',
                email: '',
                occupation: '',
                cccd: '',
                stay_status: 'Chưa đăng ký',
            });
            fetchTenants();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Lỗi khi thêm khách thuê');
        }
    };

    const updateTenantStatus = async (tenantId, data) => {
        try {
            await axios.patch(`http://localhost:5175/api/tenants/${tenantId}`, data);
            setTenants(prev => prev.map(t => (t.id === tenantId ? { ...t, ...data } : t)));
        } catch (err) {
            console.error(err);
            alert('Cập nhật thất bại');
        }
    };

    const filteredTenants =
        filterStatus === 'Tất cả' ? tenants : tenants.filter(t => t.stay_status === filterStatus);

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 text-[#2e2a2a]">QUẢN LÝ KHÁCH THUÊ</h2>

            {/* Bộ lọc trạng thái */}
            <div className="flex items-center flex-wrap gap-6 mb-4 text-sm">
                {['Tất cả', 'Đang ở', 'Đã rời đi', 'Chưa đăng ký'].map((status, i) => (
                    <label key={i} className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="statusFilter"
                            value={status}
                            checked={filterStatus === status}
                            onChange={e => setFilterStatus(e.target.value)}
                            className={`cursor-pointer ${
                                status === 'Đang ở'
                                    ? 'accent-green-600'
                                    : status === 'Đã rời đi'
                                    ? 'accent-red-500'
                                    : status === 'Chưa đăng ký'
                                    ? 'accent-gray-500'
                                    : 'accent-blue-600'
                            }`}
                        />
                        <span>{status}</span>
                    </label>
                ))}
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
                    onClick={openModal}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer hover:opacity-80 transition-opacity duration-300 w-full md:w-fit"
                >
                    + Thêm khách
                </button>
            </div>

            <div className="w-full overflow-x-auto scrollbar-thin">
                <table className="min-w-[900px] w-full text-sm border-collapse">
                    <thead>
                        <tr className="bg-[#f9f9f9] text-[#2e2a2a] text-sm">
                            <th className="border border-[#eaecf0] p-2 text-left font-[500]">
                                Tên khách hàng
                            </th>
                            <th className="border border-[#eaecf0] p-2 text-left font-[500]">
                                Số điện thoại
                            </th>
                            <th className="border border-[#eaecf0] p-2 text-left font-[500]">
                                Ngày sinh
                            </th>
                            <th className="border border-[#eaecf0] p-2 text-left font-[500]">
                                Giới tính
                            </th>
                            <th className="border border-[#eaecf0] p-2 text-left font-[500]">
                                Địa chỉ
                            </th>
                            <th className="border border-[#eaecf0] p-2 text-left font-[500]">
                                Số CCCD
                            </th>
                            <th className="border border-[#eaecf0] p-2 text-left font-[500]">
                                Trạng thái lưu trú
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTenants.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="text-center p-4 text-gray-500">
                                    Không có bản ghi nào!
                                </td>
                            </tr>
                        ) : (
                            filteredTenants.map(t => (
                                <tr key={t.id}>
                                    <td className="border p-2 border-[#eaecf0]">{t.name}</td>
                                    <td className="border p-2 border-[#eaecf0]">{t.phone}</td>
                                    <td className="border p-2 border-[#eaecf0]">
                                        {t.birthday
                                            ? new Date(t.birthday).toLocaleDateString('vi-VN')
                                            : '-'}
                                    </td>
                                    <td className="border p-2 border-[#eaecf0]">{t.gender}</td>
                                    <td className="border p-2 border-[#eaecf0]">{t.address}</td>
                                    <td className="border p-2 border-[#eaecf0]">{t.cccd}</td>
                                    <td className="border p-2 border-[#eaecf0]">
                                        <select
                                            value={t.stay_status}
                                            onChange={e =>
                                                updateTenantStatus(t.id, {
                                                    stay_status: e.target.value,
                                                })
                                            }
                                            className="border border-gray-300 rounded px-2 py-1 w-full"
                                        >
                                            <option value="Chưa đăng ký">Chưa đăng ký</option>
                                            <option value="Đang ở">Đang ở</option>
                                            <option value="Đã rời đi">Đã rời đi</option>
                                        </select>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal thêm khách */}
            {isModalOpen && (
                <div
                    onClick={handleOutsideClick}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800/40 backdrop-blur-sm"
                >
                    <div
                        ref={modalRef}
                        className="bg-white rounded-lg w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto shadow-lg"
                    >
                        <h3 className="text-lg font-semibold mb-4 text-[#2e2a2a]">
                            THÊM KHÁCH THUÊ
                        </h3>

                        <form className="grid grid-cols-2 gap-4 text-sm" onSubmit={handleSubmit}>
                            <div className="col-span-2">
                                <label className="block mb-1 font-medium">
                                    Họ và tên <span className="text-red-500">(*)</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Vui lòng nhập"
                                    className="border border-gray-300 rounded px-3 py-2 w-full"
                                />
                            </div>

                            <div>
                                <label className="block mb-1 font-medium">Ngày sinh</label>
                                <input
                                    type="date"
                                    name="birthday"
                                    value={formData.birthday}
                                    onChange={handleChange}
                                    className="border border-gray-300 rounded px-3 py-2 w-full"
                                />
                            </div>

                            <div>
                                <label className="block mb-1 font-medium">Giới tính</label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="border border-gray-300 rounded px-3 py-2 w-full"
                                >
                                    <option>Nam</option>
                                    <option>Nữ</option>
                                    <option>Khác</option>
                                </select>
                            </div>

                            <div>
                                <label className="block mb-1 font-medium">Phường/Xã</label>
                                <select
                                    name="ward_id"
                                    value={formData.ward_id}
                                    onChange={handleChange}
                                    className="border border-gray-300 rounded px-3 py-2 w-full"
                                >
                                    <option value="">Vui lòng chọn</option>
                                    {wards.map(w => (
                                        <option key={w.id} value={w.id}>
                                            {w.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-span-2">
                                <label className="block mb-1 font-medium">Địa chỉ nhà</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Số nhà, tên đường"
                                    className="border border-gray-300 rounded px-3 py-2 w-full"
                                />
                            </div>

                            <div>
                                <label className="block mb-1 font-medium">
                                    Số điện thoại <span className="text-red-500">(*)</span>
                                </label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Vui lòng nhập"
                                    className="border border-gray-300 rounded px-3 py-2 w-full"
                                />
                            </div>

                            <div>
                                <label className="block mb-1 font-medium">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Vui lòng nhập"
                                    className="border border-gray-300 rounded px-3 py-2 w-full"
                                />
                            </div>

                            <div>
                                <label className="block mb-1 font-medium">Nghề nghiệp</label>
                                <input
                                    type="text"
                                    name="occupation"
                                    value={formData.occupation}
                                    onChange={handleChange}
                                    placeholder="Vui lòng nhập"
                                    className="border border-gray-300 rounded px-3 py-2 w-full"
                                />
                            </div>

                            <div>
                                <label className="block mb-1 font-medium">Căn cước công dân</label>
                                <input
                                    type="text"
                                    name="cccd"
                                    value={formData.cccd}
                                    onChange={handleChange}
                                    placeholder="Vui lòng nhập"
                                    className="border border-gray-300 rounded px-3 py-2 w-full"
                                />
                            </div>

                            {/* Nút hành động */}
                            <div className="col-span-2 flex justify-end gap-2 mt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                                >
                                    Đóng
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded bg-blue-600 text-white hover:opacity-80"
                                >
                                    Lưu
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TenantManagement;
