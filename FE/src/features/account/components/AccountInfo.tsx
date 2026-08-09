import { faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState, useEffect } from 'react';
import type { User } from '@/types';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') || 'http://localhost:5000';

const AccountInfo = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        phone: '',
        email: '',
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const loadUser = async () => {
            const raw = localStorage.getItem('auth_user');
            const token = localStorage.getItem('auth_token');
            if (!raw || !token) return;

            try {
                const user = JSON.parse(raw) as User;
                setCurrentUser(user);

                const res = await fetch(`${API_BASE}/api/user/info`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await res.json();

                if (res.ok) {
                    setFormData({
                        phone: data.phone || '',
                        email: data.email || '',
                    });
                } else {
                    setMessage('Không thể tải thông tin tài khoản.');
                }
            } catch (err) {
                console.error('Lỗi tải thông tin tài khoản:', err);
                setMessage('Lỗi khi tải dữ liệu!');
            }
        };
        loadUser();
    }, []);

    const handleSendVerificationEmail = async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) return alert('Vui lòng đăng nhập lại!');

        if (!formData.email) {
            return setMessage('Vui lòng cập nhật email trước khi xác thực!');
        }

        setLoading(true);
        setMessage('');

        try {
            const res = await fetch(`${API_BASE}/api/email-verification/send`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();

            if (res.ok) {
                setMessage('Email xác thực đã được gửi! Vui lòng kiểm tra hộp thư của bạn.');
            } else {
                setMessage(data.message || 'Không thể gửi email. Vui lòng thử lại sau.');
            }
        } catch (err) {
            console.error('Lỗi gửi email xác thực:', err);
            setMessage('Lỗi hệ thống khi gửi email!');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (field: 'phone' | 'email'): Promise<void> => {
        const token = localStorage.getItem('auth_token');
        if (!token) return alert('Vui lòng đăng nhập lại!');

        setLoading(true);
        setMessage('');

        try {
            const res = await fetch(`${API_BASE}/api/user/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    [field]: formData[field],
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage('Cập nhật thành công!');
                const user = JSON.parse(localStorage.getItem('auth_user') || 'null') as User | null;
                localStorage.setItem(
                    'auth_user',
                    JSON.stringify({ ...user, [field]: formData[field] })
                );
            } else {
                setMessage(data.message || 'Cập nhật thất bại!');
            }
        } catch (err) {
            console.error('Lỗi cập nhật:', err);
            setMessage('Lỗi hệ thống khi cập nhật!');
        } finally {
            setLoading(false);
        }
    };

    if (!currentUser) {
        return (
            <div className="p-6">
                <p className="text-gray-500">Vui lòng đăng nhập để xem thông tin</p>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div>
                <h2 className="text-lg font-semibold text-[#2e2a2a] uppercase">
                    Thông tin tài khoản
                </h2>
                <p className="text-[#898a8b] text-sm">
                    Quản lý và cập nhật thông tin tài khoản trên Phongtro247
                </p>
            </div>

            <div className="space-y-6 mt-4">
                {/* Số điện thoại */}
                <div className="flex lg:flex-row flex-col">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex-1">
                        Số điện thoại
                    </label>
                    <div className="flex-4 flex md:flex-row flex-col md:items-center gap-y-2 gap-x-4">
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            placeholder="Nhập số điện thoại của bạn"
                            onChange={e =>
                                setFormData(prev => ({ ...prev, phone: e.target.value }))
                            }
                            className="w-full md:max-w-[472px] px-3 py-2 border rounded-md text-sm border-gray-300 outline-0"
                        />
                        <div
                            onClick={() => handleUpdate('phone')}
                            className={`max-h-[38px] md:py-[11px] md:px-[13px] py-2 px-3 bg-[#0045a8] rounded-md flex items-center justify-center text-xs md:text-sm text-white w-fit cursor-pointer font-[500] ${
                                loading ? 'opacity-70 pointer-events-none' : ''
                            }`}
                        >
                            Cập nhật
                        </div>
                    </div>
                </div>

                {/* Email */}
                <div className="flex lg:flex-row flex-col">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex-1">
                        Email
                    </label>
                    <div className="flex-4 flex md:flex-row flex-col md:items-center gap-y-2 gap-x-4">
                        <input
                            type="text"
                            name="email"
                            value={formData.email}
                            placeholder="Nhập email của bạn"
                            onChange={e =>
                                setFormData(prev => ({ ...prev, email: e.target.value }))
                            }
                            className="w-full md:max-w-[472px] px-3 py-2 border rounded-md text-sm border-gray-300 outline-0"
                        />
                        <div
                            onClick={() => handleUpdate('email')}
                            className={`max-h-[38px] md:py-[11px] md:px-[13px] py-2 px-3 bg-[#0045a8] rounded-md flex items-center justify-center text-xs md:text-sm text-white w-fit cursor-pointer font-[500] ${
                                loading ? 'opacity-70 pointer-events-none' : ''
                            }`}
                        >
                            Cập nhật
                        </div>
                    </div>
                </div>

                {/* Trạng thái Email */}
                <div className="flex md:flex-row flex-col">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex-1">
                        Xác thực Email
                    </label>
                    <div className="flex-4">
                        {currentUser.email_verified ? (
                            <div className="flex items-center gap-x-1 text-green-600">
                                <FontAwesomeIcon icon={faCircleCheck} />
                                <span className="md:text-base text-sm">Email đã xác thực</span>
                            </div>
                        ) : (
                            <div className="flex md:flex-row flex-col md:items-center gap-2">
                                <span className="text-sm text-orange-600">Email chưa xác thực</span>
                                <button
                                    onClick={handleSendVerificationEmail}
                                    disabled={loading}
                                    className={`px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors w-fit ${
                                        loading ? 'opacity-70 cursor-not-allowed' : ''
                                    }`}
                                >
                                    {loading ? 'Đang gửi...' : 'Gửi email xác thực'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Trạng thái Tài khoản (cho chủ trọ) */}
                {currentUser.role === 'host' && (
                    <div className="flex md:flex-row flex-col">
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex-1">
                            Xác thực Chủ trọ
                        </label>
                        <div className="flex-4">
                            {currentUser.verified ? (
                                <div className="flex items-center gap-x-1 text-green-600">
                                    <FontAwesomeIcon icon={faCircleCheck} />
                                    <span className="md:text-base text-sm">
                                        Đã xác thực bởi Admin
                                    </span>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm text-orange-600">Chưa xác thực</span>
                                    <span className="text-xs text-gray-500">
                                        Admin sẽ xác thực sau khi kiểm tra thông tin
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Thông báo */}
                {message && (
                    <p
                        className={`text-sm mt-2 ${
                            message.includes('thành công') ? 'text-green-600' : 'text-red-500'
                        }`}
                    >
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
};

export default AccountInfo;
