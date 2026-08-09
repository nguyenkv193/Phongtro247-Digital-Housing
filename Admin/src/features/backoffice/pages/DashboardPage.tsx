'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from '@/router';
import {
    AlertTriangle,
    ArrowUpRight,
    BarChart3,
    Building2,
    CircleDollarSign,
    ClipboardCheck,
    RefreshCw,
    Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { toast } from 'react-toastify';
import { Card } from '@/components/ui/card';
import { backofficeApi } from '@/features/backoffice/api';
import { Button, EmptyState, LoadingState, StatusBadge } from '@/features/backoffice/components/BackofficeUi';
import type { AdminDashboard, AdminListing, AdminUser, ListingReport, RevenueItem } from '@/features/backoffice/types';
import { formatCurrency, getApiErrorMessage, publicListingUrl } from '@/features/backoffice/utils';

interface DashboardState {
    dashboard: AdminDashboard;
    users: AdminUser[];
    listings: AdminListing[];
    reports: ListingReport[];
    revenue: RevenueItem[];
}

const STATUS_ROWS = [
    { key: 'published', label: 'Đã đăng', color: 'bg-emerald-500' },
    { key: 'pending', label: 'Chờ duyệt', color: 'bg-amber-500' },
    { key: 'hidden', label: 'Đã ẩn', color: 'bg-slate-400' },
    { key: 'rejected', label: 'Từ chối', color: 'bg-rose-500' },
] as const;

const CATEGORY_COLORS = ['bg-blue-600', 'bg-indigo-500', 'bg-violet-500', 'bg-cyan-500', 'bg-teal-500'];
const numberFormatter = new Intl.NumberFormat('vi-VN');

function formatCompactCurrency(value: number): string {
    const amount = Number(value) || 0;
    if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} tỷ`;
    if (amount >= 1_000_000) return `${(amount / 1_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} tr`;
    if (amount >= 1_000) return `${(amount / 1_000).toLocaleString('vi-VN', { maximumFractionDigits: 0 })}k`;
    return `${Math.round(amount).toLocaleString('vi-VN')} đ`;
}

function SummaryCard({
    label,
    value,
    caption,
    icon: Icon,
    iconClass,
}: {
    label: string;
    value: ReactNode;
    caption: string;
    icon: LucideIcon;
    iconClass: string;
}) {
    return (
        <Card className="p-5">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-slate-500">{label}</p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{value}</p>
                </div>
                <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconClass}`}>
                    <Icon size={18} />
                </span>
            </div>
            <p className="mt-4 text-xs text-slate-500">{caption}</p>
        </Card>
    );
}

function ActionRow({
    href,
    label,
    caption,
    value,
    icon: Icon,
    iconClass,
}: {
    href: string;
    label: string;
    caption: string;
    value: number;
    icon: LucideIcon;
    iconClass: string;
}) {
    return (
        <Link href={href} className="group flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3 transition hover:border-slate-300 hover:bg-slate-50">
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconClass}`}><Icon size={17} /></span>
            <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-slate-800">{label}</span>
                <span className="mt-0.5 block truncate text-xs text-slate-500">{caption}</span>
            </span>
            <span className="flex items-center gap-1 text-sm font-semibold text-slate-900">
                {numberFormatter.format(value)}
                <ArrowUpRight size={14} className="text-slate-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-blue-600" />
            </span>
        </Link>
    );
}

function RevenueAreaChart({ data, maxValue }: { data: Array<{ label: string; total: number }>; maxValue: number }) {
    if (!data.length) return <p className="py-14 text-center text-sm text-slate-500">Chưa có dữ liệu doanh thu.</p>;

    const hasRevenue = data.some(item => item.total > 0);
    if (!hasRevenue) {
        return (
            <div className="mt-5">
                <div className="relative flex h-56 items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-200 bg-slate-50/70">
                    <div className="absolute inset-x-8 bottom-12 border-t border-dashed border-slate-200" />
                    <div className="relative z-10 text-center">
                        <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-white text-slate-300 shadow-sm"><CircleDollarSign size={19} /></span>
                        <p className="mt-3 text-sm font-medium text-slate-600">Chưa có giao dịch</p>
                        <p className="mt-1 text-xs text-slate-400">Doanh thu sẽ hiển thị khi phát sinh giao dịch.</p>
                    </div>
                </div>
                <div className="grid gap-1 px-2 pt-3" style={{ gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))` }}>
                    {data.map(item => <span key={item.label} className="text-center text-xs text-slate-400">{item.label}</span>)}
                </div>
            </div>
        );
    }

    const width = 720;
    const height = 260;
    const plotLeft = 54;
    const plotRight = 704;
    const plotTop = 16;
    const plotBottom = 208;
    const safeMax = Math.max(maxValue, 1);
    const points = data.map((item, index) => {
        const x = plotLeft + (data.length === 1 ? 0 : (index / (data.length - 1)) * (plotRight - plotLeft));
        const y = plotBottom - (item.total / safeMax) * (plotBottom - plotTop);
        return { ...item, x, y };
    });
    const linePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${plotBottom} L ${points[0].x} ${plotBottom} Z`;

    return (
        <div className="mt-5">
            <svg viewBox={`0 0 ${width} ${height}`} className="h-56 w-full overflow-visible" role="img" aria-label="Biểu đồ doanh thu theo ngày">
                <defs>
                    <linearGradient id="dashboard-revenue-gradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity="0.02" />
                    </linearGradient>
                </defs>
                {[0, 1, 2, 3, 4].map(index => {
                    const y = plotTop + (index / 4) * (plotBottom - plotTop);
                    return (
                        <g key={y}>
                            <line x1={plotLeft} x2={plotRight} y1={y} y2={y} stroke="#e2e8f0" strokeDasharray={index === 4 ? undefined : '4 6'} />
                            <text x="0" y={y + 4} fill="#94a3b8" fontSize="11">{formatCompactCurrency(safeMax * (1 - index / 4))}</text>
                        </g>
                    );
                })}
                <path d={areaPath} fill="url(#dashboard-revenue-gradient)" />
                <path d={linePath} fill="none" stroke="#2563eb" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                {points.map(point => (
                    <g key={point.label}>
                        <circle cx={point.x} cy={point.y} r="6" fill="#dbeafe" />
                        <circle cx={point.x} cy={point.y} r="3.5" fill="#2563eb" stroke="white" strokeWidth="2" />
                        <title>{`${point.label}: ${formatCurrency(point.total)}`}</title>
                    </g>
                ))}
            </svg>
            <div className="grid gap-1 px-2" style={{ gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))` }}>
                {data.map(item => <span key={item.label} className="text-center text-xs text-slate-500">{item.label}</span>)}
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const [data, setData] = useState<DashboardState | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async (isRefresh = false) => {
        isRefresh ? setRefreshing(true) : setLoading(true);
        try {
            const [dashboard, users, listings, reports, revenue] = await Promise.all([
                backofficeApi.dashboard(),
                backofficeApi.listUsers(),
                backofficeApi.listListings(),
                backofficeApi.listReports(),
                backofficeApi.listRevenue(),
            ]);
            setData({ dashboard, users, listings, reports, revenue });
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'Không thể tải dữ liệu tổng quan.'));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    const revenueByDay = useMemo(() => {
        if (!data) return [];
        return Array.from({ length: 7 }, (_, index) => {
            const date = new Date();
            date.setHours(0, 0, 0, 0);
            date.setDate(date.getDate() - (6 - index));
            const total = data.revenue
                .filter(item => {
                    const createdAt = new Date(item.created_at);
                    return createdAt.getFullYear() === date.getFullYear() && createdAt.getMonth() === date.getMonth() && createdAt.getDate() === date.getDate();
                })
                .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
            return { label: new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' }).format(date), total };
        });
    }, [data]);

    if (loading) return <LoadingState label="Đang tải dữ liệu tổng quan..." />;
    if (!data) return <EmptyState title="Không thể tải tổng quan" description="Vui lòng thử tải lại dữ liệu." />;

    const activeListings = data.listings.filter(item => item.status.toLowerCase() === 'published').length;
    const pendingListings = data.listings.filter(item => item.status.toLowerCase() === 'pending').length;
    const pendingReports = data.reports.filter(item => item.status.toLowerCase() === 'pending').length;
    const landlords = data.users.filter(item => item.role.toLowerCase() === 'landlord' || item.has_completed_host_info).length;
    const tenants = data.users.filter(item => item.role.toLowerCase() === 'user').length;
    const admins = data.users.filter(item => item.role.toLowerCase() === 'admin').length;
    const maxRevenue = Math.max(...revenueByDay.map(item => item.total), 1);
    const revenue7d = revenueByDay.reduce((sum, item) => sum + item.total, 0);
    const listingTypes = [...(data.dashboard.listingTypes || [])].sort((first, second) => second.count - first.count).slice(0, 5);
    const maxListingType = Math.max(...listingTypes.map(item => item.count), 1);
    const recentListings = data.listings.slice(0, 5);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Tổng quan</h1>
                    <p className="mt-1 text-sm text-slate-500">Theo dõi nhanh hoạt động của Phongtro247.</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => void load(true)} disabled={refreshing} className="self-start sm:self-auto">
                    <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
                    Làm mới
                </Button>
            </div>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryCard label="Tổng người dùng" value={numberFormatter.format(data.users.length)} caption={`${numberFormatter.format(data.dashboard.newUsers30d)} tài khoản mới trong 30 ngày`} icon={Users} iconClass="bg-blue-50 text-blue-700" />
                <SummaryCard label="Doanh thu tích lũy" value={formatCurrency(data.dashboard.totalRevenue)} caption={`${formatCurrency(revenue7d)} trong 7 ngày gần nhất`} icon={CircleDollarSign} iconClass="bg-emerald-50 text-emerald-700" />
                <SummaryCard label="Tin đang hoạt động" value={numberFormatter.format(activeListings)} caption={`${numberFormatter.format(data.listings.length)} tin trong hệ thống`} icon={Building2} iconClass="bg-violet-50 text-violet-700" />
                <SummaryCard label="Báo cáo cần xử lý" value={numberFormatter.format(pendingReports)} caption={`${numberFormatter.format(data.dashboard.totalComplaints)} báo cáo tất cả trạng thái`} icon={AlertTriangle} iconClass="bg-orange-50 text-orange-700" />
            </section>

            <section className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.7fr)]">
                <Card className="p-5 md:p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-base font-semibold text-slate-950">Doanh thu</h2>
                            <p className="mt-1 text-sm text-slate-500">Doanh thu phát sinh trong 7 ngày gần nhất.</p>
                        </div>
                        <Link href="/backoffice/revenue" className="inline-flex cursor-pointer items-center gap-1 text-sm font-medium text-blue-700 hover:text-blue-800">Chi tiết <ArrowUpRight size={15} /></Link>
                    </div>
                    <div className="mt-5 flex items-end justify-between gap-4">
                        <p className="text-2xl font-semibold tracking-tight text-slate-950">{formatCurrency(revenue7d)}</p>
                        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">7 ngày</span>
                    </div>
                    <RevenueAreaChart data={revenueByDay} maxValue={maxRevenue} />
                </Card>

                <Card className="p-5 md:p-6">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h2 className="text-base font-semibold text-slate-950">Cần xử lý</h2>
                            <p className="mt-1 text-sm text-slate-500">Các mục cần admin kiểm tra.</p>
                        </div>
                        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{numberFormatter.format(pendingListings + pendingReports)}</span>
                    </div>
                    <div className="mt-5 space-y-3">
                        <ActionRow href="/backoffice/listings" label="Tin đăng chờ duyệt" caption="Kiểm tra trạng thái tin" value={pendingListings} icon={ClipboardCheck} iconClass="bg-amber-50 text-amber-700" />
                        <ActionRow href="/backoffice/complaints" label="Báo cáo chưa xử lý" caption="Xem phản hồi người dùng" value={pendingReports} icon={AlertTriangle} iconClass="bg-rose-50 text-rose-700" />
                        <ActionRow href="/backoffice/users" label="Người dùng mới" caption="Đăng ký trong 30 ngày" value={data.dashboard.newUsers30d} icon={Users} iconClass="bg-blue-50 text-blue-700" />
                    </div>
                </Card>
            </section>

            <section className="grid gap-4 xl:grid-cols-2">
                <Card className="p-5 md:p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-base font-semibold text-slate-950">Tình trạng tin đăng</h2>
                            <p className="mt-1 text-sm text-slate-500">Phân bổ theo trạng thái hiện tại.</p>
                        </div>
                        <Link href="/backoffice/listings" className="cursor-pointer text-sm font-medium text-blue-700 hover:text-blue-800">Quản lý</Link>
                    </div>
                    <div className="mt-6 space-y-4">
                        {STATUS_ROWS.map(row => {
                            const count = data.listings.filter(item => item.status.toLowerCase() === row.key).length;
                            const percentage = data.listings.length ? (count / data.listings.length) * 100 : 0;
                            return (
                                <div key={row.key}>
                                    <div className="flex items-center justify-between gap-4 text-sm">
                                        <div className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${row.color}`} /><span className="font-medium text-slate-700">{row.label}</span></div>
                                        <span className="font-medium text-slate-700">{numberFormatter.format(count)} <span className="text-slate-400">({Math.round(percentage)}%)</span></span>
                                    </div>
                                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${row.color}`} style={{ width: `${percentage}%` }} /></div>
                                </div>
                            );
                        })}
                    </div>
                </Card>

                <Card className="p-5 md:p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-base font-semibold text-slate-950">Người dùng</h2>
                            <p className="mt-1 text-sm text-slate-500">Phân bổ theo vai trò.</p>
                        </div>
                        <Link href="/backoffice/users" className="cursor-pointer text-sm font-medium text-blue-700 hover:text-blue-800">Quản lý</Link>
                    </div>
                    <div className="mt-6 flex h-2.5 overflow-hidden rounded-full bg-slate-100">
                        <span className="bg-blue-600" style={{ width: `${data.users.length ? (landlords / data.users.length) * 100 : 0}%` }} />
                        <span className="bg-cyan-400" style={{ width: `${data.users.length ? (tenants / data.users.length) * 100 : 0}%` }} />
                        <span className="bg-violet-500" style={{ width: `${data.users.length ? (admins / data.users.length) * 100 : 0}%` }} />
                    </div>
                    <div className="mt-6 grid grid-cols-3 gap-4">
                        {[
                            { label: 'Chủ trọ', count: landlords, color: 'bg-blue-600' },
                            { label: 'Người thuê', count: tenants, color: 'bg-cyan-400' },
                            { label: 'Admin', count: admins, color: 'bg-violet-500' },
                        ].map(item => (
                            <div key={item.label}>
                                <div className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${item.color}`} /><span className="text-xs text-slate-500">{item.label}</span></div>
                                <p className="mt-2 text-xl font-semibold text-slate-950">{numberFormatter.format(item.count)}</p>
                            </div>
                        ))}
                    </div>
                </Card>
            </section>

            <section className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]">
                <Card className="p-5 md:p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-base font-semibold text-slate-950">Tin đăng mới nhất</h2>
                            <p className="mt-1 text-sm text-slate-500">Các tin đăng được cập nhật gần đây.</p>
                        </div>
                        <Link href="/backoffice/listings" className="inline-flex cursor-pointer items-center gap-1 text-sm font-medium text-blue-700 hover:text-blue-800">Xem tất cả <ArrowUpRight size={15} /></Link>
                    </div>
                    <div className="mt-5 divide-y divide-slate-100">
                        {recentListings.length ? recentListings.map(listing => (
                            <div key={listing.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500"><Building2 size={17} /></span>
                                <div className="min-w-0 flex-1">
                                    <a href={publicListingUrl(listing.id)} target="_blank" rel="noreferrer" className="block cursor-pointer truncate text-sm font-medium text-slate-800 hover:text-blue-700">{listing.name}</a>
                                    <p className="mt-1 truncate text-xs text-slate-500">{listing.owner_name || 'Chưa cập nhật chủ trọ'} · {listing.listing_type_name || 'Chưa phân loại'}</p>
                                </div>
                                <StatusBadge status={listing.status} />
                            </div>
                        )) : <p className="py-8 text-center text-sm text-slate-500">Chưa có tin đăng.</p>}
                    </div>
                </Card>

                <Card className="p-5 md:p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-base font-semibold text-slate-950">Loại hình tin đăng</h2>
                            <p className="mt-1 text-sm text-slate-500">Nhóm tin có số lượng cao nhất.</p>
                        </div>
                        <BarChart3 size={18} className="text-slate-400" />
                    </div>
                    <div className="mt-6 space-y-4">
                        {listingTypes.length ? listingTypes.map((item, index) => (
                            <div key={item.id}>
                                <div className="flex items-center justify-between gap-3 text-sm"><span className="truncate font-medium text-slate-700">{item.name}</span><span className="font-medium text-slate-700">{numberFormatter.format(item.count)}</span></div>
                                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${CATEGORY_COLORS[index % CATEGORY_COLORS.length]}`} style={{ width: `${(item.count / maxListingType) * 100}%` }} /></div>
                            </div>
                        )) : <p className="py-8 text-center text-sm text-slate-500">Chưa có dữ liệu loại hình tin đăng.</p>}
                    </div>
                </Card>
            </section>
        </div>
    );
}

