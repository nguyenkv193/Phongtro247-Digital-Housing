import { faBars, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import type { SyntheticEvent } from 'react';
import { logo } from '@/assets/assets';
import AuthModel from '@/features/auth/components/AuthModel';
import { Link, NavLink, useNavigate, useLocation } from '@/lib/navigation/router-compat';
import axios from 'axios';
import { useFavorites } from '@/providers/FavoritesContext';
import type { EntityId, ListingSummary, Notification, User } from '@/types';
import type { AuthMode } from '@/features/auth/components/AuthModel';

const Header = () => {
    const [toggleSideBar, setToggleSideBar] = useState(false);
    const [authModel, setAuthModel] = useState<AuthMode | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const navigate = useNavigate();
    const location = useLocation();
    const [showDropdown, setShowDropdown] = useState(false);
    const [showUserSidebar, setShowUserSidebar] = useState(false);
    const [showFavoritesDropdown, setShowFavoritesDropdown] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const { favoritesList, favoritesCount } = useFavorites();

    const toggleAuthForm = (type: AuthMode | null): void => {
        setAuthModel(type);
    };

    const clearAuthData = () => {
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_token');
        setCurrentUser(null);
        console.log('Đã xóa auth data do lỗi');
    };

    useEffect(() => {
        const loadUser = () => {
            const raw = localStorage.getItem('auth_user');
            try {
                if (raw && raw.includes('<!DOCTYPE html>')) {
                    console.error('auth_user chứa HTML thay vì JSON, xóa localStorage');
                    clearAuthData();
                    return;
                }

                setCurrentUser(raw ? (JSON.parse(raw) as User) : null);
            } catch (error) {
                console.error('Lỗi parse auth_user:', error);
                clearAuthData();
            }
        };

        loadUser();
        const onAuthChanged = () => loadUser();
        window.addEventListener('authChanged', onAuthChanged);
        return () => window.removeEventListener('authChanged', onAuthChanged);
    }, []);

    useEffect(() => {
        if (authModel) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [authModel]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent): void => {
            if (!(e.target instanceof Element)) return;
            if (!e.target.closest('.user-avatar-dropdown')) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    useEffect(() => {
        if (showUserSidebar) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [showUserSidebar]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent): void => {
            if (!(e.target instanceof Element)) return;
            if (!e.target.closest('.favorites-dropdown')) {
                setShowFavoritesDropdown(false);
            }
            if (!e.target.closest('.notification-dropdown')) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    useEffect(() => {
        if (currentUser) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [currentUser]);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) return;

            const res = await axios.get(`${API_URL}/api/notifications`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { limit: 10 },
            });
            const data = res.data as { data?: Notification[]; unreadCount?: number };
            setNotifications(data.data || []);
            setUnreadCount(data.unreadCount || 0);
        } catch (err) {
            console.error('Lỗi khi lấy thông báo:', err);
        }
    };

    const markAsRead = async (notificationId: EntityId): Promise<void> => {
        try {
            const token = localStorage.getItem('auth_token');
            await axios.put(
                `${API_URL}/api/notifications/${notificationId}/read`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchNotifications();
        } catch (err) {
            console.error('Lỗi khi đánh dấu đã đọc:', err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        delete axios.defaults.headers.common['Authorization'];
        window.dispatchEvent(new Event('authChanged'));
        setShowUserSidebar(false);
    };

    const navigateToSection = (path: string): void => {
        setShowDropdown(false);
        setShowUserSidebar(false);
        navigate(path);
    };

    const API_URL = 'http://localhost:5000';

    const handleHostNavigation = async () => {
        setShowDropdown(false);
        setShowUserSidebar(false);

        const token = localStorage.getItem('auth_token');
        if (!token) {
            navigate('/host-info');
            return;
        }

        try {
            const response = await axios.get(`${API_URL}/api/user/host-info-status`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const hasCompleted = !!response?.data?.has_completed_host_info;

            if (typeof hasCompleted === 'boolean') {
                const raw = localStorage.getItem('auth_user');
                try {
                    const parsed = raw ? JSON.parse(raw) : null;
                    if (parsed) {
                        const updated = { ...parsed, has_completed_host_info: hasCompleted };
                        localStorage.setItem('auth_user', JSON.stringify(updated));
                        setCurrentUser(updated);
                    }
                } catch {
                    // empty
                }
            }

            navigate(hasCompleted ? '/landlord-dashboard' : '/host-info');
        } catch (error) {
            console.error('Lỗi kiểm tra host-info-status:', error);
            navigate('/host-info');
        }
    };

    const userInitials = currentUser?.full_name
        ? currentUser.full_name
              .trim()
              .split(/\s+/)
              .slice(0, 2)
              .map((s: string) => s[0]?.toUpperCase())
              .join('')
        : 'U';

    return (
        <div className="2xl:px-48 xl:px-32 md:px-10 px-[10px] fixed top-0 left-0 right-0 z-50 bg-white">
            <div className="flex items-center justify-between max-h-[72px] py-[10px]">
                {/* Header Left */}
                <div className="flex items-center gap-x-2">
                    <div
                        className="lg:hidden w-10 h-10 flex items-center cursor-pointer"
                        onClick={() => setToggleSideBar(true)}
                    >
                        <FontAwesomeIcon icon={faBars} className="text-[#65676b] text-[24px]" />
                    </div>
                    <div
                        className={`fixed inset-0 bg-black/60 z-50 transition-all duration-300 ease-in-out ${
                            toggleSideBar ? 'opacity-100 visible' : 'opacity-0 invisible'
                        }`}
                        onClick={() => setToggleSideBar(false)}
                    >
                        {/* Sidebar */}
                        <div
                            className={`absolute top-0 bottom-0 left-0 w-[300px] bg-white z-51 transform transition-transform duration-300 ease-in-out ${
                                toggleSideBar ? 'translate-x-0' : '-translate-x-full'
                            }`}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="h-[55px] w-full bg-[#0045a8] px-4 py-2 flex items-center">
                                <div
                                    className="w-[38px] h-[38px] cursor-pointer flex items-center justify-center bg-white/15 rounded-md"
                                    onClick={() => setToggleSideBar(false)}
                                >
                                    <FontAwesomeIcon icon={faXmark} className="text-white" />
                                </div>
                            </div>
                            <ul>
                                <Link
                                    to="rental-rooms"
                                    onClick={() => setToggleSideBar(false)}
                                    className="p-4 block text-[#3a3c3e] text-sm border-b border-b-gray-200 cursor-pointer"
                                >
                                    Nhà trọ, phòng trọ
                                </Link>
                                <Link
                                    to="whole-houses"
                                    onClick={() => setToggleSideBar(false)}
                                    className="p-4 block text-[#3a3c3e] text-sm border-b border-b-gray-200 cursor-pointer"
                                >
                                    Nhà nguyên căn
                                </Link>
                                <Link
                                    to="apartments"
                                    onClick={() => setToggleSideBar(false)}
                                    className="p-4 block text-[#3a3c3e] text-sm border-b border-b-gray-200 cursor-pointer"
                                >
                                    Căn hộ
                                </Link>
                                <Link
                                    to="videos"
                                    onClick={() => setToggleSideBar(false)}
                                    className="p-4 block text-[#3a3c3e] text-sm border-b border-b-gray-200 cursor-pointer"
                                >
                                    Video Review
                                </Link>
                                <Link
                                    to="contact"
                                    onClick={() => setToggleSideBar(false)}
                                    className="p-4 block text-[#3a3c3e] text-sm border-b border-b-gray-200 cursor-pointer"
                                >
                                    Liên hệ
                                </Link>
                            </ul>
                        </div>
                    </div>
                    <Link to="/" className="flex flex-col items-center cursor-pointer">
                        {/* Header Logo */}
                        <div className="w-12 h-12 flex items-center">
                            <img src={logo} alt="" />
                        </div>
                        <h3 className="text-[#0043a1] font-bold text-md uppercase text-shadow-sm xl:block hidden ">
                            Phongtro247
                        </h3>
                    </Link>
                </div>

                {/* Header Center */}
                <div>
                    {/* Navigation */}
                    <div>
                        <ul className="lg:flex text-[#2e2a2a] items-center font-medium text-[15px] lg:text-sm text-sm 2xl:gap-x-2 gap-x-1 hidden ">
                            <NavLink
                                to="/rental-rooms"
                                className={({ isActive }) =>
                                    `${
                                        isActive ? 'bg-[#0045a8] text-white' : 'hover:bg-[#f4f4f4]'
                                    } px-3 py-[9px] text-center cursor-pointer rounded-md transition-all duration-150`
                                }
                            >
                                Nhà trọ, phòng trọ
                            </NavLink>
                            <NavLink
                                to="/whole-houses"
                                className={({ isActive }) =>
                                    `${
                                        isActive ? 'bg-[#0045a8] text-white' : 'hover:bg-[#f4f4f4]'
                                    } px-3 py-[9px] text-center cursor-pointer rounded-md transition-all duration-150`
                                }
                            >
                                Nhà nguyên căn
                            </NavLink>
                            <NavLink
                                to="/apartments"
                                className={({ isActive }) =>
                                    `${
                                        isActive ? 'bg-[#0045a8] text-white' : 'hover:bg-[#f4f4f4]'
                                    } px-3 py-[9px] text-center cursor-pointer rounded-md transition-all duration-150`
                                }
                            >
                                Căn hộ
                            </NavLink>
                            <NavLink
                                to="/videos"
                                className={({ isActive }) =>
                                    `${
                                        isActive ? 'bg-[#0045a8] text-white' : 'hover:bg-[#f4f4f4]'
                                    } px-3 py-[9px] text-center cursor-pointer rounded-md transition-all duration-150`
                                }
                            >
                                Video Review
                            </NavLink>
                            <NavLink
                                to="/contact"
                                className={({ isActive }) =>
                                    `${
                                        isActive ? 'bg-[#0045a8] text-white' : 'hover:bg-[#f4f4f4]'
                                    } px-3 py-[9px] text-center cursor-pointer rounded-md transition-all duration-150`
                                }
                            >
                                Liên hệ
                            </NavLink>
                        </ul>
                    </div>
                </div>

                {/* Header Right */}
                <div className="flex items-center gap-x-1">
                    <div className="flex 2xl:flex-row flex-col items-center gap-x-2 cursor-pointer px-3 py-[9px] rounded-md shadow-sm group hover:bg-[#00c95c] transition-all duration-150">
                        <svg
                            fill="currentColor"
                            viewBox="0 0 512 512"
                            version="1.1"
                            xmlSpace="preserve"
                            xmlns="http://www.w3.org/2000/svg"
                            xmlnsXlink="http://www.w3.org/1999/xlink"
                            className="2xl:w-[20px] 2xl:h-[20px] w-[14px] h-[14px] text-[#00c95c] group-hover:text-white block"
                        >
                            <g id="mobile_phone-smartphone-phone-heart-love">
                                <path d="M305.376,217.024c10.275,13.376,8.235,32.626-3.614,44.605l-32.5,32.855c-7.318,7.398-19.204,7.398-26.522,0l-32.5-32.855   c-11.85-11.979-13.889-31.229-3.614-44.605c12.415-16.161,35.529-17.243,49.375-3.245   C269.847,199.782,292.961,200.863,305.376,217.024z M407.405,111.248l-19.953,20.461c-1.02,1.048-2.188,1.874-3.414,2.594v305.734   c0,22.055-17.945,40-40,40h-176c-22.055,0-40-17.945-40-40v-21.692c-1.257-0.729-2.456-1.57-3.5-2.644l-19.945-20.453   c-10.133-10.398-11.266-26.375-2.625-37.18c4.813-6.008,11.914-9.672,19.484-10.039c2.223-0.123,4.43,0.105,6.586,0.553V72.037   c0-22.055,17.945-40,40-40h176c19.542,0,35.793,14.108,39.258,32.662c2.343-0.548,4.771-0.796,7.25-0.669   c7.57,0.367,14.672,4.031,19.484,10.039c0,0,0,0,0.008,0C418.67,84.866,417.545,100.85,407.405,111.248z M224.037,440h64   c8.837,0,16-7.164,16-16s-7.163-16-16-16h-64c-8.836,0-16,7.164-16,16S215.201,440,224.037,440z M368.037,376V134.345   c-1.257-0.729-2.456-1.57-3.5-2.644l-19.945-20.453c-6.283-6.447-9.088-15.038-8.267-23.211H144.037v260.528   c2.114-0.432,4.284-0.656,6.508-0.536c7.57,0.367,14.672,4.031,19.484,10.039c0,0,0,0,0.008,0   c4.141,5.179,5.977,11.554,5.709,17.931H368.037z M135.998,404.537l19.953-20.461c4.438-4.547,5.133-11.578,1.586-16.008   c-1.977-2.469-4.734-3.906-7.773-4.055c-2.991-0.147-5.826,0.98-7.983,3.156c-1.455,1.512-3.478,2.469-5.744,2.469   c-0.014,0-0.025-0.008-0.039-0.008l0,0c-0.027,0-0.052-0.016-0.079-0.016c-1.062-0.017-2.08-0.217-3.002-0.608   c-0.624-0.26-1.134-0.719-1.676-1.129c-0.279-0.215-0.622-0.344-0.87-0.593c-0.029-0.029-0.071-0.038-0.099-0.067   c-2.039-2.086-4.688-3.219-7.516-3.219c-0.172,0-0.344,0.008-0.523,0.016c-3.031,0.148-5.797,1.586-7.773,4.055   c-3.539,4.43-2.844,11.461,1.586,16.008L135.998,404.537z M397.537,84.069c-1.977-2.469-4.734-3.906-7.773-4.055   c-2.976-0.116-5.826,0.981-7.983,3.157c-1.455,1.511-3.478,2.468-5.744,2.468c-0.014,0-0.025-0.008-0.039-0.008l0,0   c-0.027,0-0.052-0.016-0.079-0.016c-1.062-0.017-2.08-0.217-3.002-0.608   c-0.624-0.26-1.134-0.719-1.676-1.129   c-0.279-0.215-0.622-0.344-0.87-0.593c-0.029-0.029-0.071-0.038-0.099-0.067   c-2.039-2.086-4.688-3.219-7.516-3.219   c-0.172,0-0.344,0.008-0.523,0.016c-3.031,0.148-5.797,1.586-7.773,4.055   c-3.539,4.43-2.844,11.461,1.586,16.008l19.953,20.461   l19.953-20.461C400.389,95.53,401.084,88.498,397.537,84.069z" />
                            </g>
                            <g id="Layer_1" />
                        </svg>
                        <span className="text-[#00c95c] whitespace-nowrap 2xl:text-sm text-xs font-[500] group-hover:text-white">
                            Ứng dụng
                        </span>
                    </div>

                    {!currentUser ? (
                        <>
                            <div
                                className="flex 2xl:flex-row flex-col items-center gap-x-2 px-3 py-[9px] cursor-pointer hover:bg-[#f0f7ff] rounded-md transition-all duration-150"
                                onClick={() => toggleAuthForm('Login')}
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="2xl:w-[20px] 2xl:h-[20px] w-[14px] h-[14px] block"
                                >
                                    <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M8 6C8 3.79086 9.79086 2 12 2H17.5C19.9853 2 22 4.01472 22 6.5V17.5C22 19.9853 19.9853 22 17.5 22H12C9.79086 22 8 20.2091 8 18V17C8 16.4477 8.44772 16 9 16C9.55228 16 10 16.4477 10 17V18C10 19.1046 10.8954 20 12 20H17.5C18.8807 20 20 18.8807 20 17.5V6.5C20 5.11929 18.8807 4 17.5 4H12C10.8954 4 10 4.89543 10 6V7C10 7.55228 9.55228 8 9 8C8.44772 8 8 7.55228 8 7V6ZM12.2929 8.29289C12.6834 7.90237 13.3166 7.90237 13.7071 8.29289L16.7071 11.2929C17.0976 11.6834 17.0976 12.3166 16.7071 12.7071L13.7071 15.7071C13.3166 16.0976 12.6834 16.0976 12.2929 15.7071C11.9024 15.3166 11.9024 14.6834 12.2929 14.2929L13.5858 13L5 13C4.44772 13 4 12.5523 4 12C4 11.4477 4.44772 11 5 11L13.5858 11L12.2929 9.70711C11.9024 9.31658 11.9024 8.68342 12.2929 8.29289Z"
                                        fill="#0045a8"
                                    />
                                </svg>
                                <span className="text-[#0045a8] 2xl:text-sm text-xs whitespace-nowrap">
                                    Đăng nhập
                                </span>
                            </div>
                            <div
                                className="flex 2xl:flex-row flex-col items-center gap-x-2 px-3 py-[9px] cursor-pointer hover:bg-[#f0f7ff] rounded-md transition-all duration-150"
                                onClick={() => toggleAuthForm('Register')}
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="2xl:w-[20px] 2xl:h-[20px] w-[14px] h-[14px] text-[#0045a8] block"
                                >
                                    <title>i</title>
                                    <g id="Complete">
                                        <g id="user-add">
                                            <g>
                                                <path
                                                    d="M17,21V19a4,4,0,0,0-4-4H5a4,4,0,0,0-4,4v2"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                />
                                                <circle
                                                    cx="9"
                                                    cy="7"
                                                    r="4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                />
                                                <line
                                                    x1="17"
                                                    y1="11"
                                                    x2="23"
                                                    y2="11"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                />
                                                <line
                                                    x1="20"
                                                    y1="8"
                                                    x2="20"
                                                    y2="14"
                                                    fill="currentColor"
                                                    stroke="currentColor"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                />
                                            </g>
                                        </g>
                                    </g>
                                </svg>
                                <span className="text-[#0045a8] 2xl:text-sm text-xs whitespace-nowrap">
                                    Đăng ký
                                </span>
                            </div>
                        </>
                    ) : (
                        <div className="relative user-avatar-dropdown">
                            <div className="flex items-center gap-x-4 px-3 py-[9px] rounded-md transition-all duration-150 group">
                                <div className="relative notification-dropdown">
                                    <div
                                        className="p-2 cursor-pointer rounded-md relative bg-white shadow-sm flex items-center justify-center text-[#65676b] hover:bg-gray-50 transition-colors"
                                        onClick={() => {
                                            setShowNotifications(!showNotifications);
                                            setShowFavoritesDropdown(false);
                                            setShowDropdown(false);
                                        }}
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
                                        {unreadCount > 0 && (
                                            <div className="bg-[#ff5c00] min-w-[14px] h-[14px] px-1 top-0 right-0 absolute text-[10px] flex justify-center items-center text-white rounded-sm">
                                                {unreadCount > 99 ? '99+' : unreadCount}
                                            </div>
                                        )}
                                    </div>

                                    {/* Notification Dropdown */}
                                    {showNotifications && (
                                        <div className="fixed sm:absolute left-2 right-2 sm:left-auto sm:right-0 mt-2 sm:w-[380px] bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-[500px] overflow-y-auto">
                                            <div className="p-3 border-b border-gray-200 flex justify-between items-center">
                                                <h3 className="font-semibold text-sm text-[#2e2a2a]">
                                                    Thông báo
                                                </h3>
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
                                                                {new Date(
                                                                    notif.created_at
                                                                ).toLocaleString('vi-VN')}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="relative favorites-dropdown">
                                    <div
                                        className="p-2 cursor-pointer relative rounded-md bg-white shadow-sm flex items-center justify-center text-[#65676b] hover:bg-gray-50 transition-colors"
                                        onClick={() => {
                                            setShowFavoritesDropdown(!showFavoritesDropdown);
                                            setShowNotifications(false);
                                            setShowDropdown(false);
                                        }}
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
                                        {favoritesCount > 0 && (
                                            <div className="bg-[#ff5c00] w-[14px] h-[14px] top-0 right-0 absolute text-[10px] flex justify-center items-center text-white rounded-sm">
                                                {favoritesCount}
                                            </div>
                                        )}
                                    </div>

                                    {/* Favorites Dropdown */}
                                    {showFavoritesDropdown && (
                                        <div className="fixed sm:absolute left-2 right-2 sm:left-auto sm:right-0 mt-2 sm:w-[380px] max-h-[500px] bg-white border border-gray-200 rounded-md shadow-lg z-50 overflow-hidden">
                                            <div className="p-3 border-b border-gray-200 bg-gray-50">
                                                <h3 className="font-semibold text-sm text-[#2e2a2a]">
                                                    Tin đã lưu ({favoritesCount})
                                                </h3>
                                            </div>

                                            <div className="overflow-y-auto max-h-[400px]">
                                                {favoritesList.length === 0 ? (
                                                    <div className="p-6 text-center text-gray-500 text-sm">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth="1.5"
                                                            stroke="currentColor"
                                                            className="size-12 mx-auto mb-2 text-gray-300"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                                                            ></path>
                                                        </svg>
                                                        <p>Chưa có tin đăng yêu thích</p>
                                                        <p className="text-xs mt-1">
                                                            Nhấn vào icon ❤️ trên tin đăng để lưu
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="divide-y divide-gray-100">
                                                        {favoritesList.map((item: ListingSummary) => (
                                                            <Link
                                                                key={item.id}
                                                                to={`/listing/${item.id}`}
                                                                className="flex gap-3 p-3 hover:bg-gray-50 transition-colors"
                                                                onClick={() =>
                                                                    setShowFavoritesDropdown(false)
                                                                }
                                                            >
                                                                {/* Thumbnail */}
                                                                <div className="flex-shrink-0 w-20 h-20 rounded-md overflow-hidden bg-gray-200">
                                                                    <img
                                                                        src={
                                                                            item.image
                                                                                ? `${API_URL}${item.image}`
                                                                                : 'https://placehold.co/80x80'
                                                                        }
                                                                        alt={item.name}
                                                                        className="w-full h-full object-cover"
                                                                        onError={(e: SyntheticEvent<HTMLImageElement>) => {
                                                                            e.currentTarget.src =
                                                                                'https://placehold.co/80x80';
                                                                        }}
                                                                    />
                                                                </div>

                                                                {/* Info */}
                                                                <div className="flex-1 min-w-0">
                                                                    <h4 className="text-sm font-semibold text-[#2e2a2a] line-clamp-2 mb-1">
                                                                        {item.name}
                                                                    </h4>
                                                                    <p className="text-[#ff5c00] text-sm font-semibold mb-1">
                                                                        {`${
                                                                            Number(item.price || 0) / 1000000
                                                                        } triệu / tháng`}{' '}
                                                                    </p>
                                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                                        <span className="bg-gray-100 px-2 py-1 rounded">
                                                                            {item.listing_type}
                                                                        </span>
                                                                        <span>
                                                                            {item.area} m&sup2;
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </Link>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {favoritesList.length > 0 && (
                                                <div className="p-3 border-t border-gray-200 bg-gray-50">
                                                    <Link
                                                        to="/account-info/saved"
                                                        className="block text-center text-sm text-[#0045a8] hover:underline font-medium"
                                                        onClick={() =>
                                                            setShowFavoritesDropdown(false)
                                                        }
                                                    >
                                                        Xem tất cả →
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div
                                    className="w-[40px] h-[40px] relative cursor-pointer rounded-full bg-[#ef6c00] text-white flex items-center justify-center text-sm font-semibold"
                                    onClick={() => {
                                        if (
                                            window.innerWidth < 1024 &&
                                            location.pathname.startsWith('/account-info')
                                        ) {
                                            setShowUserSidebar(true);
                                        } else {
                                            setShowDropdown(!showDropdown);
                                            setShowNotifications(false);
                                            setShowFavoritesDropdown(false);
                                        }
                                    }}
                                >
                                    {currentUser?.avatar ? (
                                        <img
                                            src={currentUser.avatar}
                                            alt={currentUser.full_name}
                                            className="w-full h-full object-cover rounded-full"
                                            onError={(e: SyntheticEvent<HTMLImageElement>) => {
                                                e.currentTarget.style.display = 'none';
                                                if (e.currentTarget.parentElement) {
                                                    e.currentTarget.parentElement.innerHTML = userInitials;
                                                }
                                            }}
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
                                </div>
                            </div>
                            {showDropdown && (
                                <div className="absolute w-[280px] h-[360px] right-0 mt-2 p-3 shadow-md bg-white border border-gray-200 rounded-md">
                                    <div
                                        className="flex items-center gap-x-2 pb-3 border-b border-b-gray-100 cursor-pointer"
                                        onClick={() => {
                                            setShowDropdown(false);
                                            navigate('/account-info/user-info');
                                        }}
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
                                                {currentUser.full_name}
                                            </p>
                                            <p className="text-[#898a8b] text-[10px] font-[300]">
                                                ID: #{currentUser.id}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="py-3 border-b border-b-gray-100">
                                        <div
                                            className="flex items-center gap-x-2 p-[10px] text-[#2e2a2a] hover:bg-[#f9f9f9] transition-colors duration-300 cursor-pointer"
                                            onClick={() =>
                                                navigateToSection('/account-info/accommodation')
                                            }
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
                                            <span className="text-sm font-[400] ">
                                                Thông tin lưu trú
                                            </span>
                                        </div>
                                        <div
                                            className="flex items-center gap-x-2 p-[10px] text-[#2e2a2a] hover:bg-[#f9f9f9] transition-colors duration-300 cursor-pointer"
                                            onClick={() =>
                                                navigateToSection('/account-info/user-info')
                                            }
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
                                            <span className="text-sm font-[400] ">
                                                Thông tin cá nhân
                                            </span>
                                        </div>
                                        <div
                                            className="flex items-center gap-x-2 p-[10px] text-[#2e2a2a] hover:bg-[#f9f9f9] transition-colors duration-300 cursor-pointer"
                                            onClick={() =>
                                                navigateToSection('/account-info/account-info')
                                            }
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
                                            <span className="text-sm font-[400] ">
                                                Thông tin tài khoản
                                            </span>
                                        </div>
                                    </div>
                                    <div className="py-3 border-b border-b-gray-100">
                                        <div
                                            className="flex items-center gap-x-2 p-[10px] text-[#2e2a2a] hover:bg-[#f9f9f9] transition-colors duration-300 cursor-pointer"
                                            onClick={handleHostNavigation}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="20"
                                                height="20"
                                                viewBox="0 0 20 20"
                                                fill="none"
                                            >
                                                <path
                                                    d="M17.7085 4.08289V8.29092C17.7085 8.8686 17.2385 9.33677 16.6602 9.33677H14.9912V7.3409C14.9912 6.91243 14.8172 6.52503 14.5362 6.2444C14.2567 5.96377 13.8675 5.78992 13.44 5.78992C12.5822 5.78992 11.8874 6.48396 11.8874 7.3409V9.33677H10.2184C9.64008 9.33677 9.17143 8.8686 9.17143 8.29092V4.08289C9.17143 3.72834 9.35094 3.39844 9.6483 3.20542L12.8699 1.11509C13.2166 0.890591 13.6633 0.890591 14.01 1.11509L17.2317 3.20542C17.529 3.39844 17.7085 3.72834 17.7085 4.08289Z"
                                                    fill="currentColor"
                                                ></path>
                                                <path
                                                    d="M19.9889 12.295C19.9793 12.2225 19.9628 12.1499 19.9382 12.0801C19.8573 11.8556 19.7724 11.6352 19.6545 11.4271C19.6435 11.408 19.6326 11.3874 19.6203 11.3683C19.5147 11.1931 19.3955 11.0343 19.2571 10.8987C19.0516 10.6934 18.8035 10.5415 18.5377 10.4497C18.2719 10.3567 17.9923 10.3211 17.7045 10.3211C17.2715 10.3211 16.8152 10.4005 16.3054 10.5182C13.5443 11.1643 11.9259 11.5038 11.0023 11.6804C10.916 11.6968 10.3117 11.805 10.1897 11.8241C10.1829 11.5449 10.1404 11.2177 10.0129 10.8782C9.87316 10.5045 9.6224 10.1157 9.23459 9.78034L9.22774 9.7735C9.0633 9.62976 8.8742 9.51341 8.65769 9.39979C8.274 9.19993 7.80124 9.01649 7.26955 8.8399C6.47203 8.57433 5.54432 8.32656 4.6358 8.10754C3.72728 7.88851 2.84068 7.6996 2.13359 7.55723C2.01575 7.53396 1.89653 7.52301 1.77868 7.52301C1.2977 7.52301 0.852343 7.71876 0.530318 8.03635C0.206922 8.35531 3.8147e-06 8.80568 3.8147e-06 9.30396V14.473C3.8147e-06 14.7947 0.0767418 15.0849 0.187738 15.3285C0.352176 15.6954 0.586501 15.9623 0.776976 16.1444C0.96745 16.3251 1.11956 16.4237 1.14148 16.4374L1.17574 16.4593L6.12808 18.6618C6.71457 18.9219 7.34355 19.0533 7.97253 19.0533C8.52477 19.0533 9.07701 18.952 9.60184 18.7508C10.7419 18.3114 12.3726 17.6598 14.0513 16.9083C15.7313 16.1554 17.4579 15.3039 18.809 14.4524L18.8172 14.447L18.8255 14.4415C18.9817 14.3333 19.1311 14.2225 19.2708 14.0979C19.4805 13.9117 19.6696 13.69 19.7998 13.4175C19.8957 13.2163 19.9546 13 19.9806 12.7783C19.9985 12.6208 20.0094 12.4538 19.9889 12.2937V12.295ZM18.8584 12.8234C18.8186 12.9521 18.7611 13.052 18.6583 13.167C18.5596 13.2765 18.413 13.3956 18.2225 13.5284L18.2061 13.5394C16.9358 14.3388 15.2489 15.1725 13.6032 15.9103C11.9492 16.6509 10.335 17.2957 9.20719 17.7296C8.8098 17.8829 8.39048 17.9596 7.97253 17.9596C7.49566 17.9596 7.01879 17.8597 6.57343 17.6625C6.57343 17.6625 1.70605 15.4969 1.70468 15.4969C1.64302 15.4531 1.49091 15.3326 1.3621 15.1656C1.28673 15.0698 1.21959 14.9617 1.17163 14.8467C1.12504 14.7303 1.09626 14.6085 1.09626 14.4743V9.30533C1.09763 9.10821 1.17437 8.94257 1.30044 8.818C1.42651 8.69343 1.5978 8.61814 1.77868 8.61951C1.8239 8.61951 1.86912 8.62361 1.91708 8.6332C2.97908 8.84675 4.45492 9.16707 5.76494 9.52983C6.41859 9.71053 7.03112 9.90355 7.52169 10.0938C7.76698 10.1883 7.98075 10.2827 8.15067 10.3717C8.31922 10.4593 8.44392 10.5442 8.50421 10.5976L8.51107 10.6044C8.76731 10.8276 8.90298 11.0466 8.98657 11.2656C9.06879 11.4833 9.09482 11.7064 9.09482 11.9172C9.09482 11.9514 9.09482 11.9843 9.09345 12.0171C8.71113 12.0651 8.30552 12.0993 7.93553 12.0979H7.8862C7.78617 12.102 7.6875 12.1034 7.58884 12.1034C6.67758 12.1048 5.81976 11.9597 5.19489 11.8145C4.88246 11.742 4.62895 11.6694 4.45492 11.6147C4.36859 11.5887 4.30144 11.5668 4.25759 11.5517C4.23429 11.5435 4.21922 11.538 4.20826 11.5339C4.20826 11.5339 4.1973 11.5298 4.19593 11.5298C3.91227 11.4244 3.59573 11.5695 3.49158 11.8529C3.38607 12.1376 3.53132 12.4525 3.81498 12.5565C3.83142 12.5633 4.26307 12.7221 4.94686 12.8809C5.62928 13.0397 6.56247 13.1985 7.58884 13.1985C7.69298 13.1985 7.79713 13.1971 7.90264 13.193H7.93553C8.61521 13.193 9.3223 13.1027 9.88824 13.0082C10.1719 12.9617 10.4186 12.9138 10.6063 12.8768C10.6995 12.8577 10.7789 12.8412 10.8379 12.8289C10.8529 12.8262 10.8666 12.8221 10.8804 12.8193C10.8927 12.8166 10.9036 12.8152 10.9132 12.8125C10.9269 12.8097 10.9379 12.8084 10.9434 12.807C10.9461 12.807 10.9475 12.807 10.9475 12.807C11.0283 12.7933 11.1147 12.7769 11.2092 12.7591C12.1534 12.5784 13.7841 12.2362 16.5562 11.5873C17.0235 11.4778 17.4099 11.4176 17.7045 11.4189C17.8786 11.4189 18.0197 11.4381 18.1335 11.4723C18.2198 11.4983 18.291 11.5312 18.3568 11.575C18.4569 11.6407 18.55 11.731 18.646 11.8789C18.7008 11.9638 18.7474 12.0541 18.7885 12.1458C18.8282 12.2348 18.8762 12.3265 18.8926 12.4237C18.9145 12.5565 18.8981 12.6961 18.8584 12.8248V12.8234Z"
                                                    fill="currentColor"
                                                ></path>
                                            </svg>
                                            <span className="text-sm font-[400]">
                                                Dành cho chủ trọ
                                            </span>
                                        </div>
                                    </div>
                                    <div
                                        className="py-3 border-b border-b-gray-100"
                                        onClick={() => handleLogout()}
                                    >
                                        <div className="flex items-center gap-x-2 p-[10px] text-[#2e2a2a] hover:bg-[#f9f9f9] transition-colors duration-300 cursor-pointer">
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
                                            <span className="text-sm font-[400] ">Đăng xuất</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div
                        className="hidden sm:flex items-center gap-x-2 bg-[#0045a8] px-3 py-2 h-[34px] rounded-md cursor-pointer hover:opacity-80 transition-opacity duration-150"
                        onClick={handleHostNavigation}
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="2xl:w-[20px] 2xl:h-[20px] w-[14px] h-[14px] text-white block"
                        >
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M19.4423 2.60315C19.7838 2.77155 20 3.11926 20 3.50001V7.46482L20.8906 8.05856C22.2084 8.93711 23 10.4162 23 12C23 13.5838 22.2084 15.0629 20.8906 15.9415L20 16.5352V19.5C20 19.8774 19.7876 20.2226 19.4507 20.3927C19.1139 20.5627 18.7101 20.5287 18.4064 20.3048C18.4064 20.3048 18.4064 20.3048 18.4064 20.3048C18.4064 20.3048 18.4064 20.3047 18.4063 20.3047L18.4063 20.3047L18.4054 20.3041L18.4012 20.301L18.3831 20.2876L18.3098 20.2344C18.2453 20.1876 18.1506 20.1194 18.0313 20.0349C17.7926 19.8657 17.4571 19.6319 17.0712 19.3747C16.2873 18.8523 15.3391 18.2625 14.5765 17.9059C13.1878 17.2566 11.7408 16.7733 10.6322 16.4513C10.1547 16.3125 9.74373 16.2048 9.43209 16.1275C8.63487 17.4199 8.92926 19.1226 10.1451 20.0682C11.3765 21.026 10.6993 23 9.13919 23H6C5.59997 23 5.23843 22.7616 5.08085 22.3939L4.69925 21.5035C3.87957 19.5909 3.83735 17.4342 4.58156 15.491L4.62696 15.3725C2.51738 14.8594 1 12.9633 1 10.7539C1 8.12839 3.12838 6.00001 5.75387 6.00001H9C9.02628 6.00001 9.05256 6.00104 9.07876 6.00311C9.07943 6.00317 9.07959 6.00318 9.07974 6.00319L9.08164 6.00333L9.10038 6.00461C9.1185 6.00579 9.14773 6.00754 9.18726 6.00945C9.26636 6.01329 9.38647 6.01774 9.54125 6.01952C9.85127 6.02309 10.2977 6.01586 10.8305 5.97193C11.9038 5.8834 13.2878 5.64894 14.6043 5.08164C15.3591 4.75639 16.2945 4.1762 17.0738 3.64858C18.023 2.98068 18.2339 2.82527 18.2972 2.77773L18.369 2.72362L18.3866 2.71022L18.3913 2.70655C18.6934 2.47485 19.1009 2.43476 19.4423 2.60315ZM8 8.00001H5.75387C4.23295 8.00001 3 9.23295 3 10.7539C3 12.1213 4.00336 13.2816 5.35646 13.4789L6.14107 13.5933L8 13.8515V8.00001ZM10 14.2079C10.3214 14.2886 10.7267 14.396 11.1901 14.5306C12.3557 14.8692 13.9087 15.3859 15.4235 16.0941C16.2629 16.4866 17.2274 17.082 18 17.5909V16V8.00001V5.43572C17.2289 5.9496 16.2582 6.54673 15.3957 6.91837C13.8127 7.6005 12.1967 7.86604 10.9949 7.96516C10.6233 7.9958 10.2876 8.01083 10 8.0169V14.2079ZM7.36806 15.7829L6.64962 15.6832L6.44927 16.2063C5.89112 17.6637 5.92278 19.2812 6.53754 20.7157L6.6594 21H8.22938C6.9697 19.5684 6.63958 17.5343 7.36806 15.7829ZM20 14.1152C20.6294 13.5985 21 12.8238 21 12C21 11.1762 20.6294 10.4015 20 9.88478V14.1152Z"
                                fill="currentColor"
                            />
                        </svg>
                        <span className="text-white 2xl:text-sm text-xs font-semibold whitespace-nowrap">
                            Đăng tin Trọ
                        </span>
                    </div>
                </div>
            </div>

            {/* AuthModel Form */}
            {authModel && <AuthModel type={authModel} onClick={toggleAuthForm} />}

            {/* User Sidebar for Mobile/Tablet on Account pages */}
            {location.pathname.startsWith('/account-info') && (
                <div
                    className={`fixed inset-0 bg-black/60 z-[60] transition-all duration-300 ease-in-out ${
                        showUserSidebar
                            ? 'opacity-100 visible'
                            : 'opacity-0 invisible pointer-events-none'
                    }`}
                    onClick={() => setShowUserSidebar(false)}
                >
                    {/* User Sidebar */}
                    <div
                        className={`absolute top-0 bottom-0 right-0 w-[320px] bg-white z-[61] transform transition-transform duration-300 ease-in-out ${
                            showUserSidebar ? 'translate-x-0' : 'translate-x-full'
                        }`}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Sidebar Header */}
                        <div className="h-[55px] w-full bg-[#0045a8] px-4 py-2 flex items-center justify-between">
                            <h3 className="text-white font-semibold">Tài khoản</h3>
                            <div
                                className="w-[38px] h-[38px] cursor-pointer flex items-center justify-center bg-white/15 rounded-md"
                                onClick={() => setShowUserSidebar(false)}
                            >
                                <FontAwesomeIcon icon={faXmark} className="text-white" />
                            </div>
                        </div>

                        {/* User Info */}
                        <div className="p-4 border-b border-gray-200">
                            <div className="flex items-center gap-x-3">
                                <div className="w-[50px] h-[50px] relative cursor-pointer rounded-full bg-[#ef6c00] text-white flex items-center justify-center text-lg font-semibold">
                                    {userInitials}
                                </div>
                                <div>
                                    <p className="font-semibold text-lg capitalize text-[#2e2a2a]">
                                        {currentUser?.full_name}
                                    </p>
                                    <p className="text-[#898a8b] text-sm font-[300]">
                                        ID: #{currentUser?.id}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Menu */}
                        <div className="py-2">
                            {/* Thông tin cá nhân */}
                            <div
                                className="flex items-center gap-x-3 p-4 text-[#2e2a2a] hover:bg-[#f9f9f9] transition-colors duration-300 cursor-pointer"
                                onClick={() => navigateToSection('/account-info/user-info')}
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
                                <span className="text-base font-[400]">Thông tin cá nhân</span>
                            </div>

                            {/* Thông tin tài khoản */}
                            <div
                                className="flex items-center gap-x-3 p-4 text-[#2e2a2a] hover:bg-[#f9f9f9] transition-colors duration-300 cursor-pointer"
                                onClick={() => navigateToSection('/account-info/account-info')}
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
                                <span className="text-base font-[400]">Thông tin tài khoản</span>
                            </div>

                            {/* Thông tin lưu trú */}
                            <div
                                className="flex items-center gap-x-3 p-4 text-[#2e2a2a] hover:bg-[#f9f9f9] transition-colors duration-300 cursor-pointer"
                                onClick={() => navigateToSection('/account-info/accommodation')}
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
                                <span className="text-base font-[400]">Thông tin lưu trú</span>
                            </div>

                            {/* Quản lý đánh giá */}
                            <div
                                className="flex items-center gap-x-3 p-4 text-[#2e2a2a] hover:bg-[#f9f9f9] transition-colors duration-300 cursor-pointer"
                                onClick={() => navigateToSection('/account-info/reviews')}
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
                                <span className="text-base font-[400]">Quản lý đánh giá</span>
                            </div>

                            {/* Lưu trữ */}
                            <div
                                className="flex items-center gap-x-3 p-4 text-[#2e2a2a] hover:bg-[#f9f9f9] transition-colors duration-300 cursor-pointer"
                                onClick={() => navigateToSection('/account-info/saved')}
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
                                <span className="text-base font-[400]">Lưu trữ</span>
                            </div>

                            {/* Thông báo */}
                            <div
                                className="flex items-center gap-x-3 p-4 text-[#2e2a2a] hover:bg-[#f9f9f9] transition-colors duration-300 cursor-pointer"
                                onClick={() => navigateToSection('/account-info/notifications')}
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
                                <span className="text-base font-[400]">Thông báo</span>
                            </div>

                            {/* Dành cho chủ trọ */}
                            <div
                                className="flex items-center gap-x-3 p-4 text-[#2e2a2a] hover:bg-[#f9f9f9] transition-colors duration-300 cursor-pointer"
                                onClick={handleHostNavigation}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                >
                                    <path
                                        d="M17.7085 4.08289V8.29092C17.7085 8.8686 17.2385 9.33677 16.6602 9.33677H14.9912V7.3409C14.9912 6.91243 14.8172 6.52503 14.5362 6.2444C14.2567 5.96377 13.8675 5.78992 13.44 5.78992C12.5822 5.78992 11.8874 6.48396 11.8874 7.3409V9.33677H10.2184C9.64008 9.33677 9.17143 8.8686 9.17143 8.29092V4.08289C9.17143 3.72834 9.35094 3.39844 9.6483 3.20542L12.8699 1.11509C13.2166 0.890591 13.6633 0.890591 14.01 1.11509L17.2317 3.20542C17.529 3.39844 17.7085 3.72834 17.7085 4.08289Z"
                                        fill="currentColor"
                                    ></path>
                                    <path
                                        d="M19.9889 12.295C19.9793 12.2225 19.9628 12.1499 19.9382 12.0801C19.8573 11.8556 19.7724 11.6352 19.6545 11.4271C19.6435 11.408 19.6326 11.3874 19.6203 11.3683C19.5147 11.1931 19.3955 11.0343 19.2571 10.8987C19.0516 10.6934 18.8035 10.5415 18.5377 10.4497C18.2719 10.3567 17.9923 10.3211 17.7045 10.3211C17.2715 10.3211 16.8152 10.4005 16.3054 10.5182C13.5443 11.1643 11.9259 11.5038 11.0023 11.6804C10.916 11.6968 10.3117 11.805 10.1897 11.8241C10.1829 11.5449 10.1404 11.2177 10.0129 10.8782C9.87316 10.5045 9.6224 10.1157 9.23459 9.78034L9.22774 9.7735C9.0633 9.62976 8.8742 9.51341 8.65769 9.39979C8.274 9.19993 7.80124 9.01649 7.26955 8.8399C6.47203 8.57433 5.54432 8.32656 4.6358 8.10754C3.72728 7.88851 2.84068 7.6996 2.13359 7.55723C2.01575 7.53396 1.89653 7.52301 1.77868 7.52301C1.2977 7.52301 0.852343 7.71876 0.530318 8.03635C0.206922 8.35531 3.8147e-06 8.80568 3.8147e-06 9.30396V14.473C3.8147e-06 14.7947 0.0767418 15.0849 0.187738 15.3285C0.352176 15.6954 0.586501 15.9623 0.776976 16.1444C0.96745 16.3251 1.11956 16.4237 1.14148 16.4374L1.17574 16.4593L6.12808 18.6618C6.71457 18.9219 7.34355 19.0533 7.97253 19.0533C8.52477 19.0533 9.07701 18.952 9.60184 18.7508C10.7419 18.3114 12.3726 17.6598 14.0513 16.9083C15.7313 16.1554 17.4579 15.3039 18.809 14.4524L18.8172 14.447L18.8255 14.4415C18.9817 14.3333 19.1311 14.2225 19.2708 14.0979C19.4805 13.9117 19.6696 13.69 19.7998 13.4175C19.8957 13.2163 19.9546 13 19.9806 12.7783C19.9985 12.6208 20.0094 12.4538 19.9889 12.2937V12.295ZM18.8584 12.8234C18.8186 12.9521 18.7611 13.052 18.6583 13.167C18.5596 13.2765 18.413 13.3956 18.2225 13.5284L18.2061 13.5394C16.9358 14.3388 15.2489 15.1725 13.6032 15.9103C11.9492 16.6509 10.335 17.2957 9.20719 17.7296C8.8098 17.8829 8.39048 17.9596 7.97253 17.9596C7.49566 17.9596 7.01879 17.8597 6.57343 17.6625C6.57343 17.6625 1.70605 15.4969 1.70468 15.4969C1.64302 15.4531 1.49091 15.3326 1.3621 15.1656C1.28673 15.0698 1.21959 14.9617 1.17163 14.8467C1.12504 14.7303 1.09626 14.6085 1.09626 14.4743V9.30533C1.09763 9.10821 1.17437 8.94257 1.30044 8.818C1.42651 8.69343 1.5978 8.61814 1.77868 8.61951C1.8239 8.61951 1.86912 8.62361 1.91708 8.6332C2.97908 8.84675 4.45492 9.16707 5.76494 9.52983C6.41859 9.71053 7.03112 9.90355 7.52169 10.0938C7.76698 10.1883 7.98075 10.2827 8.15067 10.3717C8.31922 10.4593 8.44392 10.5442 8.50421 10.5976L8.51107 10.6044C8.76731 10.8276 8.90298 11.0466 8.98657 11.2656C9.06879 11.4833 9.09482 11.7064 9.09482 11.9172C9.09482 11.9514 9.09482 11.9843 9.09345 12.0171C8.71113 12.0651 8.30552 12.0993 7.93553 12.0979H7.8862C7.78617 12.102 7.6875 12.1034 7.58884 12.1034C6.67758 12.1048 5.81976 11.9597 5.19489 11.8145C4.88246 11.742 4.62895 11.6694 4.45492 11.6147C4.36859 11.5887 4.30144 11.5668 4.25759 11.5517C4.23429 11.5435 4.21922 11.538 4.20826 11.5339C4.20826 11.5339 4.1973 11.5298 4.19593 11.5298C3.91227 11.4244 3.59573 11.5695 3.49158 11.8529C3.38607 12.1376 3.53132 12.4525 3.81498 12.5565C3.83142 12.5633 4.26307 12.7221 4.94686 12.8809C5.62928 13.0397 6.56247 13.1985 7.58884 13.1985C7.69298 13.1985 7.79713 13.1971 7.90264 13.193H7.93553C8.61521 13.193 9.3223 13.1027 9.88824 13.0082C10.1719 12.9617 10.4186 12.9138 10.6063 12.8768C10.6995 12.8577 10.7789 12.8412 10.8379 12.8289C10.8529 12.8262 10.8666 12.8221 10.8804 12.8193C10.8927 12.8166 10.9036 12.8152 10.9132 12.8125C10.9269 12.8097 10.9379 12.8084 10.9434 12.807C10.9461 12.807 10.9475 12.807 10.9475 12.807C11.0283 12.7933 11.1147 12.7769 11.2092 12.7591C12.1534 12.5784 13.7841 12.2362 16.5562 11.5873C17.0235 11.4778 17.4099 11.4176 17.7045 11.4189C17.8786 11.4189 18.0197 11.4381 18.1335 11.4723C18.2198 11.4983 18.291 11.5312 18.3568 11.575C18.4569 11.6407 18.55 11.731 18.646 11.8789C18.7008 11.9638 18.7474 12.0541 18.7885 12.1458C18.8282 12.2348 18.8762 12.3265 18.8926 12.4237C18.9145 12.5565 18.8981 12.6961 18.8584 12.8248V12.8234Z"
                                        fill="currentColor"
                                    ></path>
                                </svg>
                                <span className="text-base font-[400]">Dành cho chủ trọ</span>
                            </div>

                            {/* Đăng xuất */}
                            <div
                                className="flex items-center gap-x-3 p-4 text-[#2e2a2a] hover:bg-[#f9f9f9] transition-colors duration-300 cursor-pointer"
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
                                <span className="text-base font-[400]">Đăng xuất</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Header;
