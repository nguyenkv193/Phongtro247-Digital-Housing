'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import axios from 'axios';
import {
    BarChart3,
    BellRing,
    Building2,
    ChevronLeft,
    ClipboardCheck,
    LayoutDashboard,
    LogOut,
    Menu,
    ReceiptText,
    ShieldCheck,
    SlidersHorizontal,
    Users,
    X,
} from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { useUser } from '@/providers/UserContext';
import BackofficeGuard from '@/features/backoffice/components/BackofficeGuard';

const navigation = [
    { href: '/backoffice', label: 'Tổng quan', icon: LayoutDashboard, exact: true },
    { href: '/backoffice/requests', label: 'Duyệt yêu cầu', icon: ClipboardCheck },
    { href: '/backoffice/users', label: 'Người dùng', icon: Users },
    { href: '/backoffice/listings', label: 'Tin đăng', icon: Building2 },
    { href: '/backoffice/complaints', label: 'Báo cáo tin đăng', icon: BellRing },
    { href: '/backoffice/revenue', label: 'Doanh thu', icon: ReceiptText },
    { href: '/backoffice/reports', label: 'Phân tích', icon: BarChart3 },
    { href: '/backoffice/master-data', label: 'Master data', icon: SlidersHorizontal },
];

export default function BackofficeShell({ children }: PropsWithChildren) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname() || '/backoffice';
    const router = useRouter();
    const { currentUser } = useUser();
    const displayName = currentUser?.full_name || currentUser?.name || 'Quản trị viên';

    const logout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        delete axios.defaults.headers.common.Authorization;
        window.dispatchEvent(new Event('authChanged'));
        router.replace('/backoffice/login');
    };

    const sidebar = (
        <aside className="flex h-full w-72 flex-col border-r border-slate-200 bg-white">
            <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-lg font-black text-white shadow-lg">P</span>
                <div>
                    <p className="font-bold text-slate-900">Phongtro247</p>
                    <p className="text-xs font-semibold text-blue-600">BACKOFFICE</p>
                </div>
            </div>
            <nav className="flex-1 space-y-1 p-4">
                <p className="px-3 pb-2 pt-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Vận hành hệ thống</p>
                {navigation.map(item => {
                    const active = item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                                active ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                        >
                            <Icon size={19} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
            <div className="m-4 rounded-xl bg-slate-50 p-4 text-xs text-slate-500">
                <p className="font-semibold text-slate-700">Khu vực nội bộ</p>
                <p className="mt-1 leading-5">Chỉ tài khoản có vai trò quản trị mới được truy cập.</p>
            </div>
        </aside>
    );

    return (
        <BackofficeGuard>
            <div className="min-h-screen bg-slate-50 text-slate-800">
                <div className="fixed inset-y-0 left-0 z-30 hidden lg:block">{sidebar}</div>
                {mobileOpen && (
                    <div className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden" onClick={() => setMobileOpen(false)} aria-hidden="true" />
                )}
                <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 lg:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <button
                        type="button"
                        aria-label="Đóng menu"
                        onClick={() => setMobileOpen(false)}
                        className="absolute -right-11 top-4 rounded-r-xl bg-white p-2 text-slate-600 shadow-md"
                    >
                        <X size={19} />
                    </button>
                    {sidebar}
                </div>
                <div className="lg:pl-72">
                    <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur md:px-8">
                        <div className="flex items-center gap-3">
                            <button type="button" onClick={() => setMobileOpen(true)} className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="Mở menu">
                                <Menu size={22} />
                            </button>
                            <div className="hidden sm:block">
                                <p className="text-sm font-semibold text-slate-900">Trung tâm vận hành</p>
                                <p className="text-xs text-slate-500">Quản lý nội dung, người dùng và doanh thu</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="hidden text-right sm:block">
                                <p className="text-sm font-semibold text-slate-800">{displayName}</p>
                                <p className="text-xs text-slate-500">Quản trị viên</p>
                            </div>
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">{displayName.slice(0, 1).toUpperCase()}</span>
                            <button type="button" onClick={logout} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700">
                                <LogOut size={17} />
                                <span className="hidden sm:inline">Đăng xuất</span>
                            </button>
                        </div>
                    </header>
                    <main className="mx-auto max-w-[1600px] p-4 md:p-8">{children}</main>
                </div>
            </div>
        </BackofficeGuard>
    );
}
