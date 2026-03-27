import React from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faHome,
    faVideo,
    faUsers,
    faBuilding,
    faTimes,
    faDollarSign,
} from '@fortawesome/free-solid-svg-icons';

const Sidebar = ({ onClose }) => {
    const handleNavClick = () => {
        if (window.innerWidth < 1024 && onClose) {
            onClose();
        }
    };

    const menuItems = [
        {
            path: '/admin/dashboard',
            icon: faHome,
            label: 'Dashboard',
            color: 'blue',
        },
        {
            path: '/admin/video-requests',
            icon: faVideo,
            label: 'Xử lý yêu cầu',
            color: 'purple',
        },
        {
            path: '/admin/users',
            icon: faUsers,
            label: 'Quản lý Users',
            color: 'green',
        },
        {
            path: '/admin/listings',
            icon: faBuilding,
            label: 'Quản lý Tin đăng',
            color: 'orange',
        },
        {
            path: '/admin/revenue',
            icon: faDollarSign,
            label: 'Doanh thu',
            color: 'emerald',
        },
    ];

    const getColorClasses = (color, isActive) => {
        return isActive ? 'bg-[#006ffd] text-white' : 'text-gray-700 hover:bg-gray-100';
    };

    return (
        <aside className="w-72 bg-white border-r border-gray-200 overflow-y-auto h-full flex flex-col pt-16 md:pt-20 lg:pt-0">
            <div className="lg:hidden flex items-center justify-between p-3 md:p-4 border-b border-gray-200 bg-white fixed top-0 left-0 right-0 z-10 w-72 h-16 md:h-20">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#006ffd] rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">P</span>
                    </div>
                    <span className="font-bold text-gray-800">Menu</span>
                </div>
                <button
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                >
                    <FontAwesomeIcon icon={faTimes} className="text-gray-600" />
                </button>
            </div>

            <nav className="p-4 pt-6 flex-1">
                <div className="mb-2 px-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Menu Chính
                    </p>
                </div>
                <ul className="space-y-1">
                    {menuItems.map(item => (
                        <li key={item.path}>
                            <NavLink
                                to={item.path}
                                onClick={handleNavClick}
                                className={({ isActive }) =>
                                    `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${getColorClasses(
                                        item.color,
                                        isActive
                                    )} ${isActive ? 'transform scale-105' : ''}`
                                }
                            >
                                <FontAwesomeIcon icon={item.icon} className="w-5 h-5" />
                                <span className="font-medium text-sm">{item.label}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="mt-auto p-4">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
                    <p className="text-xs text-gray-500 text-center font-medium">
                        © 2025 PhongTro247
                    </p>
                    <p className="text-xs text-gray-400 text-center mt-1">Version 1.0.0</p>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
