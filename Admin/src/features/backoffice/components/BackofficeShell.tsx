'use client';

import { useState } from 'react';
import Link from '@/router';
import Image from '@/components/CompatImage';
import { usePathname, useRouter } from '@/router';
import axios from 'axios';
import {
    BarChart3,
    BellRing,
    Building2,
    ChevronDown,
    ChevronRight,
    ClipboardCheck,
    LayoutDashboard,
    LogOut,
    Menu,
    ReceiptText,
    SlidersHorizontal,
    Users,
    X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { APP_NAME } from '@/config/site';
import { logo } from '@/assets/assets';
import { useUser } from '@/providers/UserContext';
import BackofficeGuard from '@/features/backoffice/components/BackofficeGuard';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavigationItem {
    href: string;
    label: string;
    icon: LucideIcon;
    exact?: boolean;
}

interface NavigationGroup {
    label: string;
    items: NavigationItem[];
}

const navigationGroups: NavigationGroup[] = [
    {
        label: 'Điều hành',
        items: [{ href: '/backoffice', label: 'Tổng quan', icon: LayoutDashboard, exact: true }],
    },
    {
        label: 'Quản lý hệ thống',
        items: [
            { href: '/backoffice/requests', label: 'Duyệt yêu cầu', icon: ClipboardCheck },
            { href: '/backoffice/users', label: 'Người dùng', icon: Users },
            { href: '/backoffice/listings', label: 'Tin đăng', icon: Building2 },
            { href: '/backoffice/complaints', label: 'Báo cáo tin đăng', icon: BellRing },
        ],
    },
    {
        label: 'Phân tích & cấu hình',
        items: [
            { href: '/backoffice/revenue', label: 'Doanh thu', icon: ReceiptText },
            { href: '/backoffice/reports', label: 'Phân tích', icon: BarChart3 },
            { href: '/backoffice/master-data', label: 'Dữ liệu danh mục', icon: SlidersHorizontal },
        ],
    },
];

export default function BackofficeShell({ children }: PropsWithChildren) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const pathname = usePathname() || '/backoffice';
    const router = useRouter();
    const { currentUser } = useUser();
    const displayName = currentUser?.full_name || currentUser?.name || 'Quản trị viên';
    const currentPage = navigationGroups.flatMap(group => group.items).find(item => item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`));

    const logout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        delete axios.defaults.headers.common.Authorization;
        window.dispatchEvent(new Event('authChanged'));
        router.replace('/backoffice/login');
    };

    const sidebar = (
        <aside className="flex h-full w-64 flex-col border-r border-slate-200 bg-white text-slate-600">
            <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-slate-200 px-5">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 p-1.5">
                    <Image src={logo} alt={APP_NAME} width={32} height={32} className="h-full w-full object-contain" />
                </span>
                <div>
                    <p className="text-sm font-semibold tracking-tight text-slate-900">{APP_NAME}</p>
                </div>
            </div>

            <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-5">
                {navigationGroups.map(group => (
                    <div key={group.label} className="mb-6 last:mb-0">
                        <p className="px-3 pb-2.5 text-[11px] font-medium text-slate-400">{group.label}</p>
                        <div className="space-y-1">
                            {group.items.map(item => {
                                const active = item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMobileOpen(false)}
                                        className={`group flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-[13px] font-medium transition ${
                                            active ? 'bg-slate-100 text-slate-950' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                                        }`}
                                    >
                                        <Icon size={16} className={active ? 'text-slate-950' : 'text-slate-400 transition group-hover:text-slate-700'} />
                                        <span className="truncate">{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

        </aside>
    );

    return (
        <BackofficeGuard>
            <div className="backoffice-shell min-h-screen bg-slate-50 text-slate-800">
                <div className="fixed inset-y-0 left-0 z-30 hidden xl:block">{sidebar}</div>
                {mobileOpen && <div className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-[2px] xl:hidden" onClick={() => setMobileOpen(false)} aria-hidden="true" />}
                <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 xl:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <Button size="icon" variant="outline" aria-label="Đóng menu" onClick={() => setMobileOpen(false)} className="absolute -right-11 top-4 rounded-l-none text-slate-600 shadow-md">
                        <X size={19} />
                    </Button>
                    {sidebar}
                </div>

                <div className="xl:pl-64">
                    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6">
                        <div className="flex min-w-0 items-center gap-3">
                            <Button size="icon" variant="ghost" onClick={() => setMobileOpen(true)} className="xl:hidden" aria-label="Mở menu" aria-expanded={mobileOpen}>
                                <Menu size={22} />
                            </Button>
                            <div className="min-w-0">
                                <div className="flex items-center gap-1.5 text-sm">
                                    <span className="hidden font-medium text-slate-400 sm:inline">Quản trị</span>
                                    <ChevronRight size={13} className="hidden text-slate-300 sm:block" />
                                    <p className="truncate font-semibold text-slate-800">{currentPage?.label || 'Tổng quan'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2 md:gap-3">
                            <DropdownMenu open={profileOpen} onOpenChange={setProfileOpen}>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className={`h-auto gap-2 py-1 pl-1 pr-1.5 ${profileOpen ? 'bg-muted' : ''}`}>
                                        <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-sm font-semibold text-foreground">{displayName.slice(0, 1).toUpperCase()}</span>
                                        <div className="hidden text-left lg:block">
                                            <p className="max-w-32 truncate text-[13px] font-semibold text-foreground">{displayName}</p>
                                            <p className="mt-0.5 text-[11px] text-muted-foreground">Quản trị viên</p>
                                        </div>
                                        <ChevronDown size={15} className={`hidden text-muted-foreground transition-transform lg:block ${profileOpen ? 'rotate-180' : ''}`} />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40">
                                    <DropdownMenuItem variant="destructive" onSelect={logout}>
                                        <LogOut />
                                        Đăng xuất
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </header>
                    <main className="mx-auto max-w-[1600px] p-4 md:p-8">{children}</main>
                </div>
            </div>
        </BackofficeGuard>
    );
}

