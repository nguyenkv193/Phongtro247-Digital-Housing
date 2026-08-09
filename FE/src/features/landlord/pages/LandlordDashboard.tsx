import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from '@/lib/navigation/router-compat';
import { admin_logo, coin, logo } from '@/assets/assets';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useUser } from '@/providers/UserContext';
import type { EntityId, Notification } from '@/types';

const LandlordDashboard = () => {
    const { currentUser } = useUser();
    const [showDropdown, setShowDropdown] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const [openMenus, setOpenMenus] = useState({
        rental: true,
        payment: false,
        system: false,
    });

    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (e: globalThis.MouseEvent): void => {
            const target = e.target instanceof Element ? e.target : null;
            if (!target?.closest('.user-avatar-dropdown')) {
                setShowDropdown(false);
            }
            if (!target?.closest('.notification-dropdown')) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const res = await axios.get('http://localhost:5000/api/notifications', {
                headers: { Authorization: `Bearer ${token}` },
                params: { limit: 10 },
            });
            setNotifications(res.data.data);
            setUnreadCount(res.data.unreadCount);
        } catch (err) {
            console.error('Lỗi khi lấy thông báo:', err);
        }
    };

    const markAsRead = async (notificationId: EntityId): Promise<void> => {
        try {
            const token = localStorage.getItem('auth_token');
            await axios.put(
                `http://localhost:5000/api/notifications/${notificationId}/read`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchNotifications();
        } catch (err) {
            console.error('Lỗi khi đánh dấu đã đọc:', err);
        }
    };

    const toggleMenu = (menu: keyof typeof openMenus): void => {
        setOpenMenus(prev => ({
            ...prev,
            [menu]: !prev[menu],
        }));
    };

    const handleLogout = () => {
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_token');
        delete axios.defaults.headers.common['Authorization'];
        window.dispatchEvent(new Event('authChanged'));
        setShowDropdown(false);
        navigate('/');
    };

    const handleDropdownNavigate = (path: string): void => {
        navigate(path);
        setShowDropdown(false);
    };

    const userInitials = currentUser?.full_name
        ? currentUser.full_name
              .trim()
              .split(/\s+/)
              .slice(0, 2)
              .map((s: string) => s[0]?.toUpperCase())
              .join('')
        : 'U';

    const linkBase =
        'cursor-pointer text-sm font-[400] text-[#3a3c3e] px-3 py-2 rounded-md transition-colors';
    const active = 'bg-[#e3f2fd] text-[#1976d2] font-semibold';
    const inactive = 'text-gray-700 hover:bg-[#f0f7ff] hover:text-[#1976d2]';

    const SidebarNav = () => (
        <>
            {/* 1. Menu Quản lý cho thuê */}
            <div>
                <div
                    className="font-bold text-[#3a3c3e] mb-3 cursor-pointer flex gap-x-3 items-center"
                    onClick={() => toggleMenu('rental')}
                >
                    <span className="text-[15px]">Quản lý cho thuê</span>
                    <span className="ml-auto">{openMenus.rental ? '▾' : '▸'}</span>
                </div>

                {openMenus.rental && (
                    <nav className="flex flex-col gap-y-2 pl-2">
                        <NavLink
                            to=""
                            end
                            className={({ isActive }) =>
                                `${linkBase} ${isActive ? active : inactive}`
                            }
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            Nhà trọ
                        </NavLink>
                        <NavLink
                            to="tenants"
                            className={({ isActive }) =>
                                `${linkBase} ${isActive ? active : inactive}`
                            }
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            Khách thuê
                        </NavLink>
                        <NavLink
                            to="contracts"
                            className={({ isActive }) =>
                                `${linkBase} ${isActive ? active : inactive}`
                            }
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            Hợp đồng
                        </NavLink>
                        <NavLink
                            to="expenses"
                            className={({ isActive }) =>
                                `${linkBase} ${isActive ? active : inactive}`
                            }
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            Thu chi
                        </NavLink>
                        <NavLink
                            to="reports"
                            className={({ isActive }) =>
                                `${linkBase} ${isActive ? active : inactive}`
                            }
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            Báo cáo
                        </NavLink>
                        <NavLink
                            to="complaints"
                            className={({ isActive }) =>
                                `${linkBase} ${isActive ? active : inactive}`
                            }
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            Phản ánh, sự cố
                        </NavLink>
                        <NavLink
                            to="reviews"
                            className={({ isActive }) =>
                                `${linkBase} ${isActive ? active : inactive}`
                            }
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            Khách hàng đánh giá
                        </NavLink>
                    </nav>
                )}
            </div>

            {/* 2. Menu Thanh toán */}
            <div className="mt-6">
                <div
                    className="font-bold text-[#3a3c3e] mb-3 cursor-pointer flex gap-x-3 items-center"
                    onClick={() => toggleMenu('payment')}
                >
                    <span className="text-[15px]">Thanh toán</span>
                    <span className="ml-auto">{openMenus.payment ? '▾' : '▸'}</span>
                </div>

                {openMenus.payment && (
                    <nav className="flex flex-col gap-y-2 pl-2">
                        <NavLink
                            to="deposit"
                            className={({ isActive }) =>
                                `${linkBase} ${isActive ? active : inactive}`
                            }
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            Nạp tiền
                        </NavLink>
                        <NavLink
                            to="transactions"
                            className={({ isActive }) =>
                                `${linkBase} ${isActive ? active : inactive}`
                            }
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            Lịch sử giao dịch
                        </NavLink>
                    </nav>
                )}
            </div>

            {/* Footer */}
            {!isSidebarOpen && (
                <div className="mt-auto pt-8">
                    <div className="text-sm font-[500] text-[#2e2a2a] mb-2">Nhân viên hỗ trợ</div>
                    <div className="flex items-center gap-x-2 mb-2 bg-[#eaf2ff] py-1 px-2 rounded-lg">
                        <img
                            src={admin_logo}
                            alt="Khuất Văn Nguyên"
                            className="w-[32px] h-[32px] rounded-full"
                        />
                        <div>
                            <div className="font-medium text-sm">Khuất Văn Nguyên</div>
                            <div className="text-xs text-[#2e2a2a]">0818.876.833</div>
                        </div>
                    </div>
                    <div className="text-xs text-gray-600 mt-4">
                        Hotline: <span className="font-semibold text-blue-600 ">033.266.1579</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-6 pt-2 border-t border-t-gray-100">
                        Copyright © 2015 - 2025 OHI Co.Ltd
                    </div>
                </div>
            )}
        </>
    );

    return (
        <div className="h-screen overflow-hidden bg-[#f5f7fa] flex flex-col">
            {/* Header */}
            <header className="flex items-center justify-between px-[10px] md:px-8 py-4 bg-white border-b border-b-gray-200">
                <div className="flex items-center gap-x-2">
                    <div
                        className="w-[40px] h-[40px] flex text-[#65676b] lg:hidden items-center justify-center cursor-pointer"
                        onClick={() => setIsSidebarOpen(true)}
                        aria-label="Open sidebar"
                        aria-controls="mobile-sidebar"
                        aria-expanded={isSidebarOpen}
                    >
                        <FontAwesomeIcon icon={faBars} className="text-[24px]" />
                    </div>
                    <Link to="/" className="flex items-center gap-x-2 cursor-pointer">
                        <div className="w-10 h-10 lg:w-12 lg:h-12 flex items-center">
                            <img src={logo} alt="" />
                        </div>
                        <h3 className="text-[#0043a1] self-end mb-2 font-bold text-md uppercase text-shadow-sm xl:block hidden ">
                            Phongtro247
                        </h3>
                    </Link>
                </div>
                <div className="flex items-center gap-x-4">
                    <Link
                        to="deposit"
                        className="bg-[#ff5c00] text-white h-[38px] px-4 py-2 rounded-lg font-semibold hidden lg:flex items-center gap-x-2 cursor-pointer hover:opacity-80 transition-opacity duration-300"
                    >
                        <div className="w-4 h-4">
                            <img src={coin} alt="" />
                        </div>
                        <span className="text-sm font-[500]">Nạp tiền</span>
                    </Link>
                    <div className="relative notification-dropdown">
                        <div
                            className="p-2 cursor-pointer rounded-md relative bg-white shadow-sm flex items-center justify-center text-[#65676b]"
                            onClick={() => setShowNotifications(!showNotifications)}
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
                                />
                            </svg>
                            {unreadCount > 0 && (
                                <div className="bg-[#ff5c00] min-w-[14px] h-[14px] px-1 top-0 right-0 absolute text-[10px] flex justify-center items-center text-white rounded-sm">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </div>
                            )}
                        </div>

                        {/* Notification Dropdown */}
                        {showNotifications && (
                            <div className="fixed sm:absolute left-2 right-2 sm:left-auto sm:right-0 top-16 sm:top-12 sm:w-[380px] bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-[500px] overflow-y-auto">
                                <div className="p-3 border-b border-gray-200 flex justify-between items-center">
                                    <h3 className="font-semibold text-sm text-[#2e2a2a]">
                                        Thông báo
                                    </h3>
                                    {unreadCount > 0 && (
                                        <span className="text-xs text-blue-600 cursor-pointer hover:underline">
                                            Đánh dấu tất cả đã đọc
                                        </span>
                                    )}
                                </div>

                                {notifications.length === 0 ? (
                                    <div className="p-4 text-center text-gray-500 text-sm">
                                        Không có thông báo nào
                                    </div>
                                ) : (
                                    <div>
                                        {notifications.map(notif => (
                                            <div
                                                key={notif.id}
                                                className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                                                    !notif.is_read ? 'bg-blue-50' : ''
                                                }`}
                                                onClick={() => markAsRead(notif.id)}
                                            >
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className="font-semibold text-sm text-[#2e2a2a] flex-1">
                                                        {notif.title}
                                                    </h4>
                                                    {!notif.is_read && (
                                                        <div className="w-2 h-2 bg-blue-600 rounded-full ml-2 mt-1"></div>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-600 mb-1 line-clamp-2">
                                                    {notif.message}
                                                </p>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(notif.created_at).toLocaleString(
                                                        'vi-VN'
                                                    )}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="relative user-avatar-dropdown">
                        <div
                            className="w-[40px] h-[40px] relative cursor-pointer rounded-full bg-[#ef6c00] text-white flex items-center justify-center text-sm font-semibold"
                            onClick={() => setShowDropdown(!showDropdown)}
                        >
                            {currentUser?.avatar ? (
                                <img
                                    src={currentUser.avatar}
                                    alt={currentUser.full_name}
                                    className="w-full h-full object-cover rounded-full"
                                />
                            ) : (
                                userInitials
                            )}
                            <div className="w-[15px] h-[15px] absolute bottom-0 -right-1 bg-white rounded-full flex items-center justify-center z-10">
                                <svg
                                    data-prefix="fas"
                                    data-icon="angle-down"
                                    className="svg-inline--fa fa-angle-down text-[#2e2a2a] text-[10px]"
                                    role="img"
                                    viewBox="0 0 384 512"
                                    aria-hidden="true"
                                >
                                    <path
                                        fill="currentColor"
                                        d="M169.4 374.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 306.7 54.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"
                                    ></path>
                                </svg>
                            </div>
                            {showDropdown && (
                                <div className="absolute w-[280px] right-0 top-13 mt-2 py-3 px-2 shadow-md bg-white border border-gray-200 rounded-md z-50">
                                    <div
                                        className="flex items-center gap-x-2 pb-3 px-2 border-b border-b-gray-100 cursor-pointer"
                                        onClick={() => handleDropdownNavigate('user-info')}
                                    >
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
                                                {currentUser?.full_name}
                                            </p>
                                            {currentUser?.id && (
                                                <p className="text-[#898a8b] text-[10px] font-[300]">
                                                    ID: #{currentUser.id}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Account Balance */}
                                    <div className="py-3 border-b border-b-gray-100">
                                        <div className="flex justify-between items-center px-2 text-sm text-[#3a3c3e]">
                                            <span>Số dư:</span>
                                            <span className="font-bold text-lg text-orange-500">
                                                {new Intl.NumberFormat('vi-VN', {
                                                    style: 'currency',
                                                    currency: 'VND',
                                                }).format(currentUser?.balance || 0)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Dropdown Menu Items */}
                                    <div className="py-3 border-b border-b-gray-100">
                                        {/* Thông tin cá nhân */}
                                        <div
                                            className="flex items-center gap-x-3 p-[10px] text-[#2e2a2a] hover:bg-[#f9f9f9] transition-colors duration-300 cursor-pointer rounded-md"
                                            onClick={() => handleDropdownNavigate('user-info')}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth="1.5"
                                                stroke="currentColor"
                                                className="size-6 w-6 h-6"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                                                />
                                            </svg>
                                            <span className="text-sm font-[400]">
                                                Thông tin cá nhân
                                            </span>
                                        </div>
                                        {/* Thông tin tài khoản */}
                                        <div
                                            className="flex items-center gap-x-3 p-[10px] text-[#2e2a2a] hover:bg-[#f9f9f9] transition-colors duration-300 cursor-pointer rounded-md"
                                            onClick={() => handleDropdownNavigate('account-info')}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth="1.5"
                                                stroke="currentColor"
                                                className="size-6 w-6 h-6"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                                />
                                            </svg>
                                            <span className="text-sm font-[400]">
                                                Thông tin tài khoản
                                            </span>
                                        </div>
                                    </div>

                                    {/* Đăng xuất */}
                                    <div className="pt-3">
                                        <div
                                            className="flex items-center gap-x-3 p-[10px] text-[#2e2a2a] hover:bg-[#f9f9f9] transition-colors duration-300 cursor-pointer rounded-md"
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
                                                />
                                            </svg>
                                            <span className="text-sm font-[400]">Đăng xuất</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content & Sidebar */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}
            <aside
                id="mobile-sidebar"
                className={`lg:hidden fixed inset-y-0 left-0 w-[300px] bg-white flex flex-col z-50 transform transition-transform duration-300 ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
                role="dialog"
                aria-modal="true"
            >
                <div className="flex items-center justify-between px-4 py-2 bg-[#006ffd]">
                    <div
                        className="text-sm w-[38px] h-[38px] text-white flex items-center justify-center bg-white/15 rounded-md cursor-pointer"
                        onClick={() => setIsSidebarOpen(false)}
                        aria-label="Close sidebar"
                    >
                        <FontAwesomeIcon icon={faTimes} className="text-[20px]" />
                    </div>
                </div>
                <div className="p-4 flex-1 overflow-y-auto">
                    <SidebarNav />
                </div>
            </aside>
            <main className="flex flex-1 overflow-hidden">
                <aside className="w-64 hidden bg-white lg:flex flex-col py-6 pb-2 px-4 self-stretch overflow-y-auto">
                    <SidebarNav />
                </aside>

                <section className="flex-1 px-[10px] py-[20px] md:p-8 overflow-y-auto min-h-0">
                    <Outlet context={{ currentUser }} />
                </section>
            </main>
        </div>
    );
};

export default LandlordDashboard;
