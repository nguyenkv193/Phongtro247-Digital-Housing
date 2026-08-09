'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
    AlertTriangle,
    ArrowUpRight,
    BarChart3,
    Building2,
    CircleDollarSign,
    ClipboardCheck,
    Eye,
    RefreshCw,
    ShieldCheck,
    UserRoundCheck,
    Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { toast } from 'react-toastify';
import { backofficeApi } from '@/features/backoffice/api';
import { EmptyState, LoadingState, PageHeading, StatusBadge } from '@/features/backoffice/components/BackofficeUi';
import type { AdminDashboard, AdminListing, AdminUser, ListingReport, RevenueItem } from '@/features/backoffice/types';
import { formatCurrency, getApiErrorMessage } from '@/features/backoffice/utils';

interface DashboardState {
    dashboard: AdminDashboard;
    users: AdminUser[];
    listings: AdminListing[];
    reports: ListingReport[];
    revenue: RevenueItem[];
}

type MetricTone = 'blue' | 'emerald' | 'violet' | 'orange';

const STATUS_ROWS = [
    { key: 'published', label: 'Đã đăng', color: 'bg-emerald-500' },
    { key: 'pending', label: 'Chờ duyệt', color: 'bg-amber-500' },
    { key: 'hidden', label: 'Đã ẩn', color: 'bg-slate-400' },
    { key: 'rejected', label: 'Từ chối', color: 'bg-rose-500' },
] as const;

const CATEGORY_COLORS = ['bg-blue-600', 'bg-indigo-500', 'bg-violet-500', 'bg-cyan-500', 'bg-teal-500'];

const numberFormatter = new Intl.NumberFormat('vi-VN');

function MetricCard({
    label,
    value,
    caption,
    icon: Icon,
    tone,
}: {
    label: string;
    value: ReactNode;
    caption: string;
    icon: LucideIcon;
    tone: MetricTone;
}) {
    const tones: Record<MetricTone, { border: string; icon: string; iconBackground: string }> = {
        blue: { border: 'border-blue-100', icon: 'text-blue-700', iconBackground: 'bg-blue-50' },
        emerald: { border: 'border-emerald-100', icon: 'text-emerald-700', iconBackground: 'bg-emerald-50' },
        violet: { border: 'border-violet-100', icon: 'text-violet-700', iconBackground: 'bg-violet-50' },
        orange: { border: 'border-orange-100', icon: 'text-orange-700', iconBackground: 'bg-orange-50' },
    };
    const currentTone = tones[tone];

    return (
        <article className={`group rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${currentTone.border}`}>
            <div className="flex items-start justify-between gap-3">
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${currentTone.iconBackground} ${currentTone.icon}`}>
                    <Icon size={21} />
                </span>
                <ArrowUpRight size={17} className="text-slate-300 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-slate-500" />
            </div>
            <p className="mt-5 text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-1 truncate text-2xl font-bold tracking-tight text-slate-900">{value}</p>
            <p className="mt-2 text-xs font-medium text-slate-400">{caption}</p>
        </article>
    );
}

function AttentionRow({
    href,
    label,
    caption,
    value,
    icon: Icon,
    tone,
}: {
    href: string;
    label: string;
    caption: string;
    value: number;
    icon: LucideIcon;
    tone: 'blue' | 'orange' | 'rose';
}) {
    const tones = {
        blue: 'bg-blue-50 text-blue-700',
        orange: 'bg-orange-50 text-orange-700',
        rose: 'bg-rose-50 text-rose-700',
    };

    return (
        <Link href={href} className="group flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-slate-200 hover:bg-slate-50">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}>
                <Icon size={18} />
            </span>
            <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-slate-800">{label}</span>
                <span className="mt-0.5 block truncate text-xs text-slate-500">{caption}</span>
            </span>
            <span className="flex items-center gap-1 text-lg font-bold text-slate-900">
                {numberFormatter.format(value)}
                <ArrowUpRight size={15} className="text-slate-300 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-blue-600" />
            </span>
        </Link>
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
    const topRevenueDay = revenueByDay.reduce((top, item) => (item.total > top.total ? item : top), revenueByDay[0]);
    const listingTypes = [...(data.dashboard.listingTypes || [])].sort((first, second) => second.count - first.count).slice(0, 5);
    const maxListingType = Math.max(...listingTypes.map(item => item.count), 1);
    const pendingTasks = pendingListings + pendingReports;
    const recentListings = data.listings.slice(0, 5);
    const recentUsers = data.users.slice(0, 5);

    return (
        <div className="space-y-6">
            <PageHeading
                eyebrow="Tổng quan"
                title="Tổng quan hệ thống"
                description="Theo dõi sức khỏe vận hành và các hoạt động quan trọng của Phongtro247."
                action={
                    <div className="flex flex-wrap gap-2">
                        <Link href="/" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700">
                            <Eye size={17} />
                            Xem website
                        </Link>
                        <button type="button" onClick={() => void load(true)} disabled={refreshing} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
                            <RefreshCw size={17} className={refreshing ? 'animate-spin' : ''} />
                            Làm mới
                        </button>
                    </div>
                }
            />

            <section className="relative isolate overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#064fbe] via-[#0b62d6] to-[#4538ca] p-6 text-white shadow-lg shadow-blue-200 md:p-8">
                <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
                    <div className="max-w-2xl">
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-blue-50">
                            <ShieldCheck size={15} />
                            Khu vực quản trị
                        </span>
                        <h2 className="mt-5 text-2xl font-bold tracking-tight sm:text-3xl">Vận hành Phongtro247 hiệu quả hơn.</h2>
                        <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100">Tập trung kiểm duyệt tin đăng, hỗ trợ người dùng và theo dõi doanh thu trên cùng một màn hình.</p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:w-[360px]">
                        <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                            <p className="text-xs font-medium text-blue-100">Tổng tin đăng</p>
                            <p className="mt-2 text-2xl font-bold">{numberFormatter.format(data.dashboard.totalListings || data.listings.length)}</p>
                            <p className="mt-1 text-xs text-blue-100">{numberFormatter.format(activeListings)} tin đang hoạt động</p>
                        </div>
                        <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                            <p className="text-xs font-medium text-blue-100">Cần xử lý</p>
                            <p className="mt-2 text-2xl font-bold">{numberFormatter.format(pendingTasks)}</p>
                            <p className="mt-1 text-xs text-blue-100">Tin đăng và báo cáo đang chờ</p>
                        </div>
                    </div>
                </div>
                <div aria-hidden="true" className="absolute -right-20 -top-24 h-72 w-72 rounded-full border-[28px] border-white/10" />
                <div aria-hidden="true" className="absolute -bottom-36 right-48 h-72 w-72 rounded-full border-[20px] border-white/5" />
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard label="Tổng người dùng" value={numberFormatter.format(data.users.length)} caption={`${numberFormatter.format(data.dashboard.newUsers30d)} tài khoản mới trong 30 ngày`} icon={Users} tone="blue" />
                <MetricCard label="Doanh thu tích lũy" value={formatCurrency(data.dashboard.totalRevenue)} caption={`${formatCurrency(revenue7d)} ghi nhận trong 7 ngày`} icon={CircleDollarSign} tone="emerald" />
                <MetricCard label="Tin đang hoạt động" value={numberFormatter.format(activeListings)} caption={`${numberFormatter.format(data.listings.length)} tin trong hệ thống`} icon={Building2} tone="violet" />
                <MetricCard label="Báo cáo cần xử lý" value={numberFormatter.format(pendingReports)} caption={`${numberFormatter.format(data.dashboard.totalComplaints)} báo cáo tất cả trạng thái`} icon={AlertTriangle} tone="orange" />
            </section>

            <section className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
                <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><CircleDollarSign size={18} /></span>
                                <h2 className="font-bold text-slate-900">Doanh thu theo ngày</h2>
                            </div>
                            <p className="mt-2 text-sm text-slate-500">Tổng doanh thu phát sinh trong 7 ngày gần nhất.</p>
                        </div>
                        <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">7 NGÀY</span>
                    </div>
                    <div className="mt-6 flex items-end justify-between gap-4">
                        <div>
                            <p className="text-2xl font-bold tracking-tight text-slate-900">{formatCurrency(revenue7d)}</p>
                            <p className="mt-1 text-xs text-slate-500">{topRevenueDay.total ? `Cao nhất ngày ${topRevenueDay.label}` : 'Chưa có giao dịch trong kỳ'}</p>
                        </div>
                        <Link href="/backoffice/revenue" className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-800">
                            Xem chi tiết
                            <ArrowUpRight size={16} />
                        </Link>
                    </div>
                    <div className="mt-7 flex h-56 items-end gap-2 sm:gap-4">
                        {revenueByDay.map(item => (
                            <div key={item.label} className="group flex h-full flex-1 flex-col justify-end">
                                <div className="relative flex flex-1 items-end rounded-xl bg-slate-50 px-1">
                                    <div className="w-full rounded-t-lg bg-gradient-to-t from-blue-600 to-cyan-400 transition group-hover:from-blue-700 group-hover:to-cyan-500" style={{ height: `${Math.max((item.total / maxRevenue) * 100, item.total ? 6 : 2)}%` }}>
                                        <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-xs font-semibold text-white shadow-lg group-hover:block">{formatCurrency(item.total)}</span>
                                    </div>
                                </div>
                                <p className="pt-3 text-center text-xs font-medium text-slate-500">{item.label}</p>
                            </div>
                        ))}
                    </div>
                </article>

                <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h2 className="font-bold text-slate-900">Điểm cần chú ý</h2>
                            <p className="mt-1 text-sm text-slate-500">Các khu vực đang cần admin kiểm tra.</p>
                        </div>
                        <span className="flex h-8 min-w-8 items-center justify-center rounded-full bg-blue-50 px-2 text-xs font-bold text-blue-700">{numberFormatter.format(pendingTasks)}</span>
                    </div>
                    <div className="mt-5 space-y-3">
                        <AttentionRow href="/backoffice/listings" label="Tin đăng chờ duyệt" caption="Kiểm tra và cập nhật trạng thái" value={pendingListings} icon={ClipboardCheck} tone="orange" />
                        <AttentionRow href="/backoffice/complaints" label="Báo cáo chưa xử lý" caption="Xem phản hồi từ người dùng" value={pendingReports} icon={AlertTriangle} tone="rose" />
                        <AttentionRow href="/backoffice/users" label="Người dùng mới" caption="Tài khoản đăng ký trong 30 ngày" value={data.dashboard.newUsers30d} icon={Users} tone="blue" />
                    </div>
                </article>
            </section>

            <section className="grid gap-5 xl:grid-cols-2">
                <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="font-bold text-slate-900">Tình trạng tin đăng</h2>
                            <p className="mt-1 text-sm text-slate-500">Tỷ lệ phân bổ theo trạng thái hiện tại.</p>
                        </div>
                        <Link href="/backoffice/listings" className="text-sm font-semibold text-blue-700 hover:text-blue-800">Quản lý tin</Link>
                    </div>
                    <div className="mt-6 space-y-4">
                        {STATUS_ROWS.map(row => {
                            const count = data.listings.filter(item => item.status.toLowerCase() === row.key).length;
                            const percentage = data.listings.length ? (count / data.listings.length) * 100 : 0;
                            return (
                                <div key={row.key}>
                                    <div className="flex items-center justify-between gap-4 text-sm">
                                        <div className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${row.color}`} /><span className="font-medium text-slate-700">{row.label}</span></div>
                                        <span className="font-bold text-slate-900">{numberFormatter.format(count)} <span className="font-medium text-slate-400">({Math.round(percentage)}%)</span></span>
                                    </div>
                                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${row.color}`} style={{ width: `${percentage}%` }} /></div>
                                </div>
                            );
                        })}
                    </div>
                </article>

                <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="font-bold text-slate-900">Phân bổ người dùng</h2>
                            <p className="mt-1 text-sm text-slate-500">Tỷ lệ theo vai trò trong hệ thống.</p>
                        </div>
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-700"><UserRoundCheck size={19} /></span>
                    </div>
                    <div className="mt-7 flex h-4 overflow-hidden rounded-full bg-slate-100">
                        {[
                            { label: 'Chủ trọ', count: landlords, color: 'bg-blue-600' },
                            { label: 'Người thuê', count: tenants, color: 'bg-cyan-400' },
                            { label: 'Quản trị viên', count: admins, color: 'bg-violet-500' },
                        ].map(item => (
                            <span key={item.label} className={item.color} style={{ width: `${data.users.length ? (item.count / data.users.length) * 100 : 0}%` }} />
                        ))}
                    </div>
                    <div className="mt-6 grid grid-cols-3 gap-3">
                        {[
                            { label: 'Chủ trọ', count: landlords, color: 'bg-blue-600' },
                            { label: 'Người thuê', count: tenants, color: 'bg-cyan-400' },
                            { label: 'Admin', count: admins, color: 'bg-violet-500' },
                        ].map(item => (
                            <div key={item.label} className="rounded-xl bg-slate-50 p-3">
                                <div className="flex items-center gap-1.5"><span className={`h-2 w-2 rounded-full ${item.color}`} /><span className="text-xs font-medium text-slate-500">{item.label}</span></div>
                                <p className="mt-2 text-xl font-bold text-slate-900">{numberFormatter.format(item.count)}</p>
                            </div>
                        ))}
                    </div>
                </article>
            </section>

            <section className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
                <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><Building2 size={18} /></span><h2 className="font-bold text-slate-900">Tin đăng mới nhất</h2></div>
                            <p className="mt-2 text-sm text-slate-500">Các tin đăng được cập nhật gần đây.</p>
                        </div>
                        <Link href="/backoffice/listings" className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-800">Xem tất cả <ArrowUpRight size={16} /></Link>
                    </div>
                    <div className="mt-5 divide-y divide-slate-100">
                        {recentListings.length ? recentListings.map(listing => (
                            <div key={listing.id} className="flex items-center gap-3 py-4 first:pt-0 last:pb-0">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500"><Building2 size={18} /></span>
                                <div className="min-w-0 flex-1">
                                    <Link href={`/listing/${listing.id}`} target="_blank" rel="noreferrer" className="block truncate text-sm font-semibold text-slate-800 hover:text-blue-700">{listing.name}</Link>
                                    <p className="mt-1 truncate text-xs text-slate-500">{listing.owner_name || 'Chưa cập nhật chủ trọ'} · {listing.listing_type_name || 'Chưa phân loại'}</p>
                                </div>
                                <StatusBadge status={listing.status} />
                            </div>
                        )) : <p className="py-8 text-center text-sm text-slate-500">Chưa có tin đăng.</p>}
                    </div>
                </article>

                <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700"><BarChart3 size={18} /></span><h2 className="font-bold text-slate-900">Loại hình tin đăng</h2></div>
                            <p className="mt-2 text-sm text-slate-500">Nhóm tin có số lượng cao nhất.</p>
                        </div>
                        <Link href="/backoffice/master-data" className="text-sm font-semibold text-blue-700 hover:text-blue-800">Danh mục</Link>
                    </div>
                    <div className="mt-6 space-y-4">
                        {listingTypes.length ? listingTypes.map((item, index) => (
                            <div key={item.id}>
                                <div className="flex items-center justify-between gap-3 text-sm"><span className="truncate font-medium text-slate-700">{item.name}</span><span className="font-bold text-slate-900">{numberFormatter.format(item.count)}</span></div>
                                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${CATEGORY_COLORS[index % CATEGORY_COLORS.length]}`} style={{ width: `${(item.count / maxListingType) * 100}%` }} /></div>
                            </div>
                        )) : <p className="py-8 text-center text-sm text-slate-500">Chưa có dữ liệu loại hình tin đăng.</p>}
                    </div>
                </article>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700"><Users size={18} /></span><h2 className="font-bold text-slate-900">Người dùng mới nhất</h2></div>
                        <p className="mt-2 text-sm text-slate-500">Danh sách được sắp xếp theo tài khoản đăng ký gần nhất.</p>
                    </div>
                    <Link href="/backoffice/users" className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-800">Quản lý người dùng <ArrowUpRight size={16} /></Link>
                </div>
                <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                    {recentUsers.length ? recentUsers.map(user => (
                        <div key={user.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                            <div className="flex items-center gap-3">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">{(user.full_name || '?').slice(0, 1).toUpperCase()}</span>
                                <div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{user.full_name}</p><p className="mt-0.5 truncate text-xs text-slate-500">{user.email || 'Chưa cập nhật email'}</p></div>
                            </div>
                            <div className="mt-4 flex items-center justify-between gap-2"><span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-slate-600">{user.role.toLowerCase() === 'admin' ? 'Quản trị viên' : user.role.toLowerCase() === 'landlord' ? 'Chủ trọ' : 'Người thuê'}</span><span className={`text-[11px] font-semibold ${user.is_blocked ? 'text-rose-600' : 'text-emerald-600'}`}>{user.is_blocked ? 'Đã khóa' : 'Hoạt động'}</span></div>
                        </div>
                    )) : <p className="py-8 text-center text-sm text-slate-500 md:col-span-2 xl:col-span-5">Chưa có người dùng.</p>}
                </div>
            </section>
        </div>
    );
}
