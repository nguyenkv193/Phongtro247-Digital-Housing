'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Building2, CircleDollarSign, RefreshCw, UserRoundCheck, Users } from 'lucide-react';
import { toast } from 'react-toastify';
import { backofficeApi } from '@/features/backoffice/api';
import { EmptyState, LoadingState, PageHeading, StatCard, StatusBadge } from '@/features/backoffice/components/BackofficeUi';
import type { AdminDashboard, AdminListing, AdminUser, ListingReport, RevenueItem } from '@/features/backoffice/types';
import { formatCurrency, getApiErrorMessage } from '@/features/backoffice/utils';

interface DashboardState {
    dashboard: AdminDashboard;
    users: AdminUser[];
    listings: AdminListing[];
    reports: ListingReport[];
    revenue: RevenueItem[];
}

const COLORS = ['bg-blue-600', 'bg-indigo-500', 'bg-violet-500', 'bg-cyan-500', 'bg-teal-500'];

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
    const pendingReports = data.reports.filter(item => item.status.toLowerCase() === 'pending').length;
    const landlords = data.users.filter(item => item.role.toLowerCase() === 'landlord' || item.has_completed_host_info).length;
    const maxRevenue = Math.max(...revenueByDay.map(item => item.total), 1);
    const listingTypes = data.dashboard.listingTypes || [];

    return (
        <div className="space-y-7">
            <PageHeading
                title="Tổng quan vận hành"
                description="Theo dõi nhanh các chỉ số quan trọng của hệ thống Trọ Mới."
                action={
                    <button type="button" onClick={() => void load(true)} disabled={refreshing} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700 disabled:opacity-60">
                        <RefreshCw size={17} className={refreshing ? 'animate-spin' : ''} />
                        Làm mới
                    </button>
                }
            />

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Tổng người dùng" value={data.users.length} icon={Users} tone="blue" />
                <StatCard label="Doanh thu tích lũy" value={formatCurrency(data.dashboard.totalRevenue)} icon={CircleDollarSign} tone="emerald" />
                <StatCard label="Tin đang hoạt động" value={activeListings} icon={Building2} tone="purple" />
                <StatCard label="Báo cáo cần xử lý" value={pendingReports} icon={AlertTriangle} tone="orange" />
            </section>

            <section className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
                <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="font-bold text-slate-900">Doanh thu 7 ngày gần nhất</h2>
                            <p className="mt-1 text-sm text-slate-500">Dữ liệu lấy từ các giao dịch đã ghi nhận.</p>
                        </div>
                        <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">{formatCurrency(revenueByDay.reduce((sum, item) => sum + item.total, 0))}</span>
                    </div>
                    <div className="mt-8 flex h-64 items-end gap-2 sm:gap-4">
                        {revenueByDay.map(item => (
                            <div key={item.label} className="group flex h-full flex-1 flex-col justify-end">
                                <div className="relative flex flex-1 items-end rounded-t-xl bg-slate-50 px-1">
                                    <div className="w-full rounded-t-lg bg-gradient-to-t from-blue-600 to-indigo-400 transition group-hover:from-blue-700 group-hover:to-indigo-500" style={{ height: `${Math.max((item.total / maxRevenue) * 100, item.total ? 6 : 2)}%` }}>
                                        <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-xs font-semibold text-white shadow-lg group-hover:block">{formatCurrency(item.total)}</span>
                                    </div>
                                </div>
                                <p className="pt-3 text-center text-xs font-medium text-slate-500">{item.label}</p>
                            </div>
                        ))}
                    </div>
                </article>

                <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                    <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><UserRoundCheck size={20} /></span>
                        <div>
                            <h2 className="font-bold text-slate-900">Người dùng</h2>
                            <p className="text-sm text-slate-500">Phân loại tài khoản hiện có</p>
                        </div>
                    </div>
                    <dl className="mt-6 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4"><dt className="text-sm text-slate-600">Chủ trọ</dt><dd className="text-xl font-bold text-slate-900">{landlords}</dd></div>
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4"><dt className="text-sm text-slate-600">Người thuê</dt><dd className="text-xl font-bold text-slate-900">{data.users.filter(item => item.role.toLowerCase() === 'user').length}</dd></div>
                        <div className="flex items-center justify-between"><dt className="text-sm text-slate-600">Quản trị viên</dt><dd className="text-xl font-bold text-slate-900">{data.users.filter(item => item.role.toLowerCase() === 'admin').length}</dd></div>
                    </dl>
                </article>
            </section>

            <section className="grid gap-5 xl:grid-cols-2">
                <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                    <h2 className="font-bold text-slate-900">Tình trạng tin đăng</h2>
                    <p className="mt-1 text-sm text-slate-500">Tổng hợp theo trạng thái hiện tại.</p>
                    <div className="mt-6 space-y-3">
                        {['published', 'pending', 'hidden', 'rejected'].map(status => {
                            const count = data.listings.filter(item => item.status.toLowerCase() === status).length;
                            const percentage = data.listings.length ? (count / data.listings.length) * 100 : 0;
                            return (
                                <div key={status}>
                                    <div className="flex items-center justify-between text-sm"><StatusBadge status={status} /><span className="font-semibold text-slate-700">{count}</span></div>
                                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600" style={{ width: `${percentage}%` }} /></div>
                                </div>
                            );
                        })}
                    </div>
                </article>

                <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                    <h2 className="font-bold text-slate-900">Danh mục tin đăng</h2>
                    <p className="mt-1 text-sm text-slate-500">Số lượng tin theo từng loại hình.</p>
                    <div className="mt-6 space-y-4">
                        {listingTypes.length ? listingTypes.map((item, index) => {
                            const max = Math.max(...listingTypes.map(type => type.count), 1);
                            return (
                                <div key={item.id}>
                                    <div className="flex justify-between gap-3 text-sm"><span className="font-medium text-slate-700">{item.name}</span><span className="font-semibold text-slate-900">{item.count}</span></div>
                                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${COLORS[index % COLORS.length]}`} style={{ width: `${(item.count / max) * 100}%` }} /></div>
                                </div>
                            );
                        }) : <p className="py-8 text-center text-sm text-slate-500">Chưa có dữ liệu loại hình tin đăng.</p>}
                    </div>
                </article>
            </section>
        </div>
    );
}
