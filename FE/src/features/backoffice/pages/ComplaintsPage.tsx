'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, Flag, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import { backofficeApi } from '@/features/backoffice/api';
import { EmptyState, LoadingState, PageHeading, StatCard, StatusBadge } from '@/features/backoffice/components/BackofficeUi';
import type { ListingReport } from '@/features/backoffice/types';
import { downloadCsv, formatDate, getApiErrorMessage } from '@/features/backoffice/utils';

export default function ComplaintsPage() {
    const [reports, setReports] = useState<ListingReport[]>([]);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            setReports(await backofficeApi.listReports());
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'Không thể tải báo cáo tin đăng.'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    const visibleReports = useMemo(() => reports.filter(report => {
        const keyword = search.trim().toLowerCase();
        return (filter === 'all' || report.status.toLowerCase() === filter) && (!keyword || report.reporter_name?.toLowerCase().includes(keyword) || report.listing_name?.toLowerCase().includes(keyword) || report.reason.toLowerCase().includes(keyword));
    }), [filter, reports, search]);

    const updateStatus = async (report: ListingReport, status: string) => {
        setUpdatingId(report.id);
        try {
            const response = await backofficeApi.updateReportStatus(report.id, status);
            setReports(items => items.map(item => item.id === report.id ? { ...item, status } : item));
            toast.success(response.message);
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'Không thể cập nhật trạng thái báo cáo.'));
        } finally {
            setUpdatingId(null);
        }
    };

    const exportCsv = () => downloadCsv(`bao_cao_tin_dang_${new Date().toISOString().slice(0, 10)}.csv`, [['Mã', 'Người báo cáo', 'Tin đăng', 'Lý do', 'Trạng thái', 'Ngày gửi'], ...visibleReports.map(item => [`BC-${String(item.id).padStart(4, '0')}`, item.reporter_name || '', item.listing_name || '', item.reason, item.status, formatDate(item.created_at)])]);

    if (loading) return <LoadingState label="Đang tải báo cáo tin đăng..." />;
    const totalPending = reports.filter(item => item.status.toLowerCase() === 'pending').length;
    const totalResolved = reports.filter(item => item.status.toLowerCase() === 'resolved').length;

    return <div className="space-y-7"><PageHeading title="Báo cáo tin đăng" description="Tiếp nhận và xử lý các báo cáo do người dùng gửi." action={<button type="button" onClick={exportCsv} disabled={!visibleReports.length} className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50"><Download size={17} />Xuất CSV</button>} /><section className="grid gap-4 sm:grid-cols-3"><StatCard label="Tổng báo cáo" value={reports.length} icon={Flag} tone="orange" /><StatCard label="Chờ xử lý" value={totalPending} icon={Flag} tone="blue" /><StatCard label="Đã giải quyết" value={totalResolved} icon={Flag} tone="emerald" /></section><section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div className="flex flex-wrap gap-2">{['all', 'pending', 'resolved', 'rejected'].map(value => <button key={value} type="button" onClick={() => setFilter(value)} className={`rounded-lg px-3 py-2 text-sm font-semibold ${filter === value ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{value === 'all' ? 'Tất cả' : value === 'pending' ? 'Chờ xử lý' : value === 'resolved' ? 'Đã giải quyết' : 'Từ chối'}</button>)}</div><label className="relative block w-full lg:w-80"><Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Tìm theo tin, người báo cáo" className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-50" /></label></div><div className="mt-6 overflow-x-auto">{visibleReports.length ? <table className="min-w-[900px] w-full text-left text-sm"><thead className="border-y border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3 font-semibold">Mã</th><th className="px-4 py-3 font-semibold">Người báo cáo</th><th className="px-4 py-3 font-semibold">Tin đăng</th><th className="px-4 py-3 font-semibold">Lý do</th><th className="px-4 py-3 font-semibold">Trạng thái</th><th className="px-4 py-3 font-semibold">Ngày gửi</th><th className="px-4 py-3 text-right font-semibold">Cập nhật</th></tr></thead><tbody className="divide-y divide-slate-100">{visibleReports.map(report => <tr key={report.id} className="hover:bg-slate-50/80"><td className="px-4 py-4 font-mono text-xs font-bold text-slate-600">BC-{String(report.id).padStart(4, '0')}</td><td className="px-4 py-4 font-medium text-slate-700">{report.reporter_name || '—'}</td><td className="px-4 py-4 font-medium text-slate-800">{report.listing_name || `Tin #${report.listing_id}`}</td><td className="px-4 py-4 text-slate-600">{report.reason}</td><td className="px-4 py-4"><StatusBadge status={report.status} /></td><td className="px-4 py-4 text-slate-500">{formatDate(report.created_at)}</td><td className="px-4 py-4 text-right"><select value={report.status} disabled={updatingId === report.id} onChange={event => void updateStatus(report, event.target.value)} className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-orange-500 disabled:opacity-50"><option value="pending">Chờ xử lý</option><option value="resolved">Đã giải quyết</option><option value="rejected">Từ chối</option></select></td></tr>)}</tbody></table> : <EmptyState title="Không có báo cáo phù hợp" description="Hãy thay đổi bộ lọc hoặc từ khóa tìm kiếm." />}</div></section></div>;
}
