import React, { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from '@/lib/navigation/router-compat';
import { img_auth, logo } from '@/assets/assets';
import { bg_auth } from '@/assets/assets';
import axios from 'axios';
import type { User } from '@/types';

const HostInfo = () => {
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [role, setRole] = useState('chutro');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const API_URL = 'http://localhost:5175';

    useEffect(() => {
        const currentUser = JSON.parse(localStorage.getItem('auth_user') || 'null') as User | null;
        if (currentUser) {
            setFullName(currentUser.full_name || '');
            setEmail(currentUser.email || '');
            setPhone(currentUser.phone || '');
            setAddress(currentUser.address || '');
        }
    }, []);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                throw new Error('Không tìm thấy token xác thực');
            }

            const response = await axios.post(
                `${API_URL}/api/user/submit-host-info`,
                {
                    full_name: fullName,
                    phone,
                    email,
                    address,
                    role,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            const currentUser = JSON.parse(localStorage.getItem('auth_user') || 'null') as User | null;
            if (currentUser && response.data.user) {
                const updatedUser = {
                    ...currentUser,
                    ...response.data.user,
                    has_completed_host_info: true,
                };
                localStorage.setItem('auth_user', JSON.stringify(updatedUser));

                window.dispatchEvent(new Event('authChanged'));
            }

            if (role === 'chutro') {
                navigate('/landlord-dashboard');
            } else {
                navigate('/moigioi');
            }
        } catch (error: unknown) {
            console.error('Lỗi khi submit host info:', error);
            setError(
                (axios.isAxiosError<{ message?: string }>(error) ? error.response?.data?.message : undefined) ||
                    'Có lỗi xảy ra khi lưu thông tin. Vui lòng thử lại!'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center px-[10px]"
            style={{ backgroundImage: `url(${bg_auth})` }}
        >
            <div className="bg-white rounded-2xl shadow-lg flex overflow-hidden w-fit ">
                {/* Ảnh bên trái */}
                <div className="w-[400px] md:w-[600px] h-[720px] hidden lg:flex flex-col items-center justify-center p-8 bg-[linear-gradient(to_bottom,#e2efff_0%,#fff_100%)]">
                    <img
                        src={img_auth}
                        alt="Trọ Mới"
                        className="max-w-[400px] max-h-[300px] mb-4"
                    />
                    <h2 className="text-2xl font-[600] text-[#2e2a2a] mb-2 uppercase mt-4">
                        Hơn <span className="text-[#00b7ff]">50.000</span> Chủ Trọ
                    </h2>
                    <p className="text-[#2e2a2a] text-center text-[16px] font-[500]">
                        Tin tưởng và sử dụng dịch vụ của Phongtro247
                    </p>
                </div>
                {/* Form bên phải */}
                <div className="w-[380px] md:w-[400px] h-fit md:h-[720px] px-8 py-12 md:p-8 flex flex-col justify-center">
                    <div className="flex flex-col items-center">
                        <div className="w-[60px] h-[60px]">
                            <img src={logo} alt="logo" />
                        </div>
                        <h2 className="text-lg font-semibold text-[#2e2a2a] mb-6 text-center">
                            Thông Tin Host
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-[400] mb-1">Họ tên</label>
                            <input
                                type="text"
                                className="w-full border text-sm border-[#e4e4e7] hover:border-[#00b7ff] focus:border-[#00b7ff] outline-0 rounded-lg px-3 py-2"
                                value={fullName}
                                onChange={e => setFullName(e.target.value)}
                                placeholder="VD: Nguyễn Văn A"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Số điện thoại</label>
                            <input
                                type="number"
                                className="w-full border text-sm border-[#e4e4e7] hover:border-[#00b7ff] focus:border-[#00b7ff] outline-0 rounded-lg px-3 py-2"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                placeholder="VD: 0123456789"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <input
                                type="email"
                                className="w-full border text-sm border-[#e4e4e7] hover:border-[#00b7ff] focus:border-[#00b7ff] outline-0 rounded-lg px-3 py-2"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="VD: example@gmail.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Địa chỉ</label>
                            <input
                                type="text"
                                className="w-full border text-sm border-[#e4e4e7] hover:border-[#00b7ff] focus:border-[#00b7ff] outline-0 rounded-lg px-3 py-2"
                                value={address}
                                onChange={e => setAddress(e.target.value)}
                                placeholder="VD: 120 Yên Lãng, thành phố Hà Nội"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Bạn là?</label>
                            <div className="flex gap-x-6 mt-2">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="role"
                                        value="chutro"
                                        checked={role === 'chutro'}
                                        onChange={() => setRole('chutro')}
                                    />
                                    <span className="ml-2 text-sm">Chủ trọ</span>
                                </label>
                            </div>
                        </div>
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full h-[46px] ${
                                loading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-[#ff5c00] cursor-pointer hover:opacity-80'
                            } text-white py-2 rounded-lg font-semibold mt-4 text-sm transition-opacity duration-300`}
                        >
                            {loading ? 'Đang lưu...' : 'Lưu thông tin'}
                        </button>
                    </form>
                </div>
            </div>
            <div className="mt-4">
                <div className="text-[#fffc] text-xs flex items-center gap-x-4 py-[5px] px-[15px] bg-[#00000029] rounded-full">
                    <span className="hover:text-[#fff] cursor-pointer">Điều khoản</span>
                    <span className="inline-block w-[1px] h-3 bg-[#fffc]"></span>
                    <span className="hover:text-[#fff] cursor-pointer">Trợ giúp</span>
                </div>
            </div>
        </div>
    );
};

export default HostInfo;
