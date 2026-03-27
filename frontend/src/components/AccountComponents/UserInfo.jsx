import { useState, useEffect } from 'react';

const UserInfo = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [formData, setFormData] = useState({
        full_name: '',
        gender: '',
        birthday: '',
        cccd: '',
        email: '',
        address: '',
    });

    const token = localStorage.getItem('auth_token');

    const fetchUserInfo = async () => {
        try {
            const res = await fetch('http://localhost:5175/api/user/info', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();

            if (res.ok) {
                const formattedBirthday = data.birthday
                    ? new Date(data.birthday).toISOString().split('T')[0]
                    : '';

                setCurrentUser(data);
                setFormData({
                    full_name: data.full_name || '',
                    gender: data.gender || '',
                    birthday: formattedBirthday,
                    cccd: data.cccd || '',
                    email: data.email || '',
                    address: data.address || '',
                });
            } else {
                console.log('Lỗi tải:', data.message);
            }
        } catch (err) {
            console.log('Lỗi tải:', err);
        }
    };

    const handleUpdate = async () => {
        try {
            const { ...dataToUpdate } = formData;

            const res = await fetch('http://localhost:5175/api/user/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(dataToUpdate),
            });

            const data = await res.json();
            if (res.ok) {
                alert('Cập nhật thành công!');
                fetchUserInfo();
            } else {
                alert(data.message || 'Có lỗi khi cập nhật!');
            }
        } catch (err) {
            alert('Lỗi khi cập nhật!');
            console.log(err);
        }
    };

    useEffect(() => {
        fetchUserInfo();
    }, []);

    if (!token) {
        return (
            <div className="p-6">
                <p className="text-gray-500">Vui lòng đăng nhập để xem thông tin</p>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-lg font-semibold text-[#2e2a2a] uppercase">
                        Thông tin cá nhân
                    </h2>
                    <p className="text-[#898a8b] text-sm">
                        Cập nhật thông tin của bạn và tìm hiểu các thông tin này được sử dụng ra
                        sao.
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Họ tên */}
                <div className="flex">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex-1">
                        Họ và tên
                    </label>
                    <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md flex-4 text-sm border-gray-300 outline-0"
                    />
                </div>

                {/* Giới tính */}
                <div className="flex">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex-1">
                        Giới tính
                    </label>
                    <select
                        value={formData.gender}
                        onChange={e => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md flex-4 text-sm border-gray-300 outline-0"
                    >
                        <option value="">Chọn giới tính</option>
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                        <option value="Khác">Khác</option>
                    </select>
                </div>

                {/* Ngày sinh */}
                <div className="flex">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex-1">
                        Ngày sinh
                    </label>
                    <input
                        type="date"
                        value={formData.birthday || ''}
                        onChange={e => setFormData({ ...formData, birthday: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md flex-4 text-sm border-gray-300 outline-0"
                    />
                </div>

                {/* CCCD */}
                <div className="flex">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex-1">
                        Số căn cước công dân
                    </label>
                    <input
                        type="text"
                        value={formData.cccd}
                        onChange={e => setFormData({ ...formData, cccd: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md flex-4 text-sm border-gray-300 outline-0"
                    />
                </div>

                {/* Email */}
                <div className="flex">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex-1">
                        Email
                    </label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md flex-4 text-sm border-gray-300 outline-0"
                    />
                </div>

                {/* Địa chỉ */}
                <div className="flex">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex-1">
                        Địa chỉ
                    </label>
                    <input
                        type="text"
                        value={formData.address}
                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md flex-4 text-sm border-gray-300 outline-0"
                    />
                </div>
            </div>

            <div
                onClick={handleUpdate}
                className="mt-4 h-[38px] py-[11px] px-[13px] bg-[#0045a8] rounded-md flex items-center justify-center text-sm text-white w-fit cursor-pointer ml-auto font-[500]"
            >
                Cập nhật
            </div>
        </div>
    );
};

export default UserInfo;
