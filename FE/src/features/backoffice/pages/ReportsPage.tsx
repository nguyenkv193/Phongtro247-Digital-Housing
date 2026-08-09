'use client';

import { useCallback, useEffect, useState } from 'react';
import { BarChart3, Building2, CircleDollarSign, Flag, Users } from 'lucide-react';
import { toast } from 'react-toastify';
import { backofficeApi } from '@/features/backoffice/api';
import { EmptyState, LoadingState, PageHeading, StatCard } from '@/features/backoffice/components/BackofficeUi';
import type { AdminDashboard } from '@/features/backoffice/types';
import { formatCurrency, getApiErrorMessage } from '@/features/backoffice/utils';

export default function ReportsPage() {
    const [report, setReport] = useState<AdminDashboard | null>(null);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            setReport(await backofficeApi.dashboard());
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'Không thể tải báo cáo phân tích.'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    if (loading) return <LoadingState label="Đang tải báo cáo phân tích..." />;
    if (!report) return <EmptyState title="Không thể tải báo cáo" description="Vui lòng thử lại sau." />;
    const maxCount = Math.max(...(report.listingTypes || []).map(item => item.count), 1);

    return <div className="space-y-7"><PageHeading title="Phân tích hệ thống" description="Tổng hợp các chỉ số kinh doanh và phân bổ loại hình tin đăng." /><section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Tổng doanh thu" value={formatCurrency(report.totalRevenue)} icon={CircleDollarSign} tone="emerald" /><StatCard label="Tổng tin đăng" value={report.totalListings} icon={Building2} tone="blue" /><StatCard label="Báo cáo tin đăng" value={report.totalComplaints} icon={Flag} tone="orange" /><StatCard label="Người dùng mới (30 ngày)" value={report.newUsers30d} icon={Users} tone="purple" /></section><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700"><BarChart3 size={20} /></span><div><h2 className="font-bold text-slate-900">Phân bổ theo loại hình</h2><p className="text-sm text-slate-500">Số lượng tin đăng theo từng danh mục.</p></div></div><div className="mt-7 space-y-5">{report.listingTypes?.length ? report.listingTypes.map(item => <div key={item.id}><div className="flex justify-between gap-4 text-sm"><span className="font-semibold text-slate-700">{item.name}</span><span className="font-bold text-slate-900">{item.count} tin</span></div><div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-500" style={{ width: `${(item.count / maxCount) * 100}%` }} /></div></div>) : <EmptyState title="Chưa có dữ liệu" description="Loại hình tin đăng sẽ xuất hiện sau khi dữ liệu được khởi tạo." />}</div></section></div>;
}
