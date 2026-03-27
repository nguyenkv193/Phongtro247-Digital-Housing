import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faUser, faBars } from '@fortawesome/free-solid-svg-icons';
import Sidebar from './Sidebar';

const AdminLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = () => {
        if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
            logout();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-md border-b border-gray-200 fixed top-0 left-0 right-0 z-30 h-16 md:h-20">
                <div className="px-3 md:px-8 h-full">
                    <div className="flex justify-between items-center h-full gap-2 md:gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="lg:hidden w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white hover:shadow-lg transition-all flex-shrink-0"
                        >
                            <FontAwesomeIcon icon={faBars} className="text-sm" />
                        </button>

                        <div className="flex items-center space-x-2 md:space-x-4">
                            <div className="w-9 h-9 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                                <span className="text-white font-bold text-lg md:text-2xl">P</span>
                            </div>
                            <div className="hidden sm:block">
                                <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    PhongTro247
                                </h1>
                                <p className="text-xs text-gray-500 font-medium hidden md:block">
                                    Admin Dashboard
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 md:gap-4">
                            <div className="hidden md:flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                    <FontAwesomeIcon icon={faUser} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-800">
                                        {user?.full_name || 'Admin'}
                                    </p>
                                    <p className="text-xs text-gray-500">{user?.email}</p>
                                </div>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg flex-shrink-0"
                            >
                                <FontAwesomeIcon icon={faSignOutAlt} className="text-sm" />
                                <span className="font-medium text-sm md:text-base hidden sm:inline">
                                    Đăng xuất
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden top-0"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <div className="flex pt-16 md:pt-20">
                <div
                    className={`
                    fixed lg:static top-0 bottom-0 left-0 z-50 lg:z-auto lg:top-auto
                    transform transition-transform duration-300 lg:transform-none
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
                >
                    <Sidebar onClose={() => setIsSidebarOpen(false)} />
                </div>

                <main className="flex-1 overflow-y-auto min-h-screen">{children}</main>
            </div>
        </div>
    );
};

export default AdminLayout;
