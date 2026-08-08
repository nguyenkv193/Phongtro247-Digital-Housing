import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from '@/lib/navigation/router-compat';
import type { User } from '@/types';

const Account = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const loadUser = () => {
            const raw = localStorage.getItem('auth_user');
            try {
                setCurrentUser(raw ? JSON.parse(raw) : null);
            } catch {
                setCurrentUser(null);
            }
        };
        loadUser();
        const onAuthChanged = () => loadUser();
        window.addEventListener('authChanged', onAuthChanged);
        return () => window.removeEventListener('authChanged', onAuthChanged);
    }, []);

    const userInitials = currentUser?.full_name
        ? currentUser.full_name
              .trim()
              .split(/\s+/)
              .slice(0, 2)
              .map((s: string) => s[0]?.toUpperCase())
              .join('')
        : 'U';

    const getActiveTab = () => {
        const path = location.pathname;
        if (path.includes('/user-info')) return 'profile';
        if (path.endsWith('/account-info')) return 'account';
        if (path.includes('/accommodation')) return 'accommodation';
        if (path.includes('/reviews')) return 'reviews';
        if (path.includes('/saved')) return 'saved';
        if (path.includes('/notifications')) return 'notifications';
        return 'profile';
    };

    const activeTab = getActiveTab();

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        window.dispatchEvent(new Event('authChanged'));
        navigate('/');
    };

    if (!currentUser) {
        return (
            <div className="min-h-96 mt-[72px] py-5 2xl:px-48 xl:px-32 md:px-10 px-[10px]">
                <div className="text-center">
                    <p className="text-gray-500">Vui lòng đăng nhập để xem thông tin tài khoản</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-96 mt-[72px] py-5 2xl:px-48 xl:px-32 md:px-10 px-[10px] flex gap-x-6">
            <div className="w-80 p-5 pb-0 shadow rounded-lg lg:block hidden h-fit">
                <div className="flex items-center gap-x-2 pb-3 border-b  border-b-gray-100 cursor-pointer">
                    <div className="w-[40px] h-[40px] relative cursor-pointer rounded-full bg-[#ef6c00] text-white flex items-center justify-center text-sm font-semibold">
                        {currentUser?.avatar ? (
                            <img 
                                src={currentUser.avatar} 
                                alt={currentUser.full_name}
                                className="w-full h-full object-cover rounded-full"
                            />
                        ) : (
                            userInitials
                        )}
                    </div>
                    <div>
                        <p className="font-semibold text-sm capitalize text-[#2e2a2a]">
                            {currentUser.full_name}
                        </p>
                        <p className="text-[#898a8b] text-[10px] font-[300]">
                            ID: #{currentUser.id}
                        </p>
                    </div>
                </div>

                <div className="py-3 border-b border-b-gray-100">
                    <div
                        className={`flex items-center gap-x-2 p-[10px] text-[#2e2a2a] hover:bg-[#f9f9f9] transition-colors duration-300 cursor-pointer ${
                            activeTab === 'profile' ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                        }`}
                        onClick={() => navigate('/account-info/user-info')}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="size-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z"
                            ></path>
                        </svg>
                        <span className="text-sm font-[400]">Thông tin cá nhân</span>
                    </div>
                    <div
                        className={`flex items-center gap-x-2 p-[10px] text-[#2e2a2a] hover:bg-[#f9f9f9] transition-colors duration-300 cursor-pointer ${
                            activeTab === 'account' ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                        }`}
                        onClick={() => navigate('/account-info/account-info')}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="size-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                            ></path>
                        </svg>
                        <span className="text-sm font-[400]">Thông tin tài khoản</span>
                    </div>
                </div>

                <div className="py-3 border-b border-b-gray-100">
                    <div
                        className={`flex items-center gap-x-2 p-[10px] text-[#2e2a2a] hover:bg-[#f9f9f9] transition-colors duration-300 cursor-pointer ${
                            activeTab === 'accommodation'
                                ? 'bg-blue-50 border-r-2 border-blue-500'
                                : ''
                        }`}
                        onClick={() => navigate('/account-info/accommodation')}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="size-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                            ></path>
                        </svg>
                        <span className="text-sm font-[400]">Thông tin lưu trú</span>
                    </div>
                    <div
                        className={`flex items-center gap-x-2 p-[10px] text-[#2e2a2a] hover:bg-[#f9f9f9] transition-colors duration-300 cursor-pointer ${
                            activeTab === 'reviews' ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                        }`}
                        onClick={() => navigate('/account-info/reviews')}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="size-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
                            ></path>
                        </svg>
                        <span className="text-sm font-[400]">Quản lý đánh giá</span>
                    </div>
                    <div
                        className={`flex items-center gap-x-2 p-[10px] text-[#2e2a2a] hover:bg-[#f9f9f9] transition-colors duration-300 cursor-pointer ${
                            activeTab === 'saved' ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                        }`}
                        onClick={() => navigate('/account-info/saved')}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="size-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                            ></path>
                        </svg>
                        <span className="text-sm font-[400]">Lưu trữ</span>
                    </div>
                    <div
                        className={`flex items-center gap-x-2 p-[10px] text-[#2e2a2a] hover:bg-[#f9f9f9] transition-colors duration-300 cursor-pointer ${
                            activeTab === 'notifications'
                                ? 'bg-blue-50 border-r-2 border-blue-500'
                                : ''
                        }`}
                        onClick={() => navigate('/account-info/notifications')}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="size-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                            ></path>
                        </svg>
                        <span className="text-sm font-[400]">Thông báo</span>
                    </div>
                </div>

                <div className="py-3 border-b border-b-gray-100">
                    <div
                        className="flex items-center gap-x-2 p-[10px] text-[#2e2a2a] hover:bg-[#f9f9f9] transition-colors duration-300 cursor-pointer"
                        onClick={handleLogout}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="size-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
                            ></path>
                        </svg>
                        <span className="text-sm font-[400]">Đăng xuất</span>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 shadow rounded-lg">
                <Outlet />
            </div>
        </div>
    );
};

export default Account;
