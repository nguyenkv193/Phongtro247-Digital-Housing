'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays, Download, Flame, ReceiptText, TrendingUp } from 'lucide-react';
import { toast } from 'react-toastify';
import { backofficeApi } from '@/features/backoffice/api';
import { EmptyState, LoadingState, PageHeading, StatCard } from '@/features/backoffice/components/BackofficeUi';
import type { RevenueItem } from '@/features/backoffice/types';
import { downloadCsv, formatCurrency, formatDate, getApiErrorMessage } from '@/features/backoffice/utils';

export default function RevenuePage() {
    const [items, setItems] = useState<RevenueItem[]>([]);
    const [filter, setFilter] = useState<'all' | 'hot' | 'standard'>('all');
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            setItems(await backofficeApi.listRevenue());
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'Không thể tải doanh thu.'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    const visibleItems = useMemo(
        () => items.filter(item => filter === 'all' || (filter === 'hot' ? item.is_hot : !item.is_hot)),
        [filter, items]
    );
    const summary = useMemo(() => {
        const now = new Date();
        const result = { today: 0, month: 0, year: 0 };
        items.forEach(item => {
            const createdAt = new Date(item.created_at);
            const amount = Number(item.amount) || 0;
            if (createdAt.getFullYear() === now.getFullYear()) {
                result.year += amount;
                if (createdAt.getMonth() === now.getMonth()) {
                    result.month += amount;
                    if (createdAt.getDate() === now.getDate()) result.today += amount;
                }
            }
        });
        return result;
    }, [items]);

    const exportCsv = () => {
        downloadCsv(`doanh_thu_${new Date().toISOString().slice(0, 10)}.csv`, [
            ['STT', 'Tin đăng', 'Chủ trọ', 'Loại dịch vụ', 'Số tiền (VND)', 'Thời điểm'],
            ...visibleItems.map((item, index) => [index + 1, item.listing_name || '', item.owner_name || '', item.is_hot ? 'Đẩy tin HOT' : 'Đăng video', Number(item.amount) || 0, formatDate(item.created_at, true)]),
        ]);
    };

    if (loading) return <LoadingState label="Đang tải doanh thu..." />;

    return (
        <div className="space-y-7">
            <PageHeading title="Doanh thu" description="Theo dõi các khoản phí dịch vụ được ghi nhận từ tin đăng." action={<button type="button" onClick={exportCsv} disabled={!visibleItems.length} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"><Download size={17} />Xuất CSV</button>} />
            <section className="grid gap-4 sm:grid-cols-3"><StatCard label="Hôm nay" value={formatCurrency(summary.today)} icon={ReceiptText} tone="emerald" /><StatCard label="Tháng này" value={formatCurrency(summary.month)} icon={TrendingUp} tone="blue" /><StatCard label="Năm nay" value={formatCurrency(summary.year)} icon={CalendarDays} tone="purple" /></section>
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-bold text-slate-900">Lịch sử doanh thu</h2><p className="mt-1 text-sm text-slate-500">{visibleItems.length} giao dịch hiển thị</p></div><div className="flex gap-2">{([['all', 'Tất cả'], ['hot', 'Tin HOT'], ['standard', 'Video']] as const).map(([value, label]) => <button key={value} type="button" onClick={() => setFilter(value)} className={`rounded-lg px-3 py-2 text-sm font-semibold ${filter === value ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{label}</button>)}</div></div><div className="mt-6 overflow-x-auto">{visibleItems.length ? <table className="min-w-[760px] w-full text-left text-sm"><thead className="border-y border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3 font-semibold">Tin đăng</th><th className="px-4 py-3 font-semibold">Chủ trọ</th><th className="px-4 py-3 font-semibold">Dịch vụ</th><th className="px-4 py-3 font-semibold">Thời điểm</th><th className="px-4 py-3 text-right font-semibold">Số tiền</th></tr></thead><tbody className="divide-y divide-slate-100">{visibleItems.map(item => <tr key={item.id} className="hover:bg-slate-50/80"><td className="px-4 py-4 font-semibold text-slate-800">{item.listing_name || 'Tin đăng đã xóa'}</td><td className="px-4 py-4 text-slate-600">{item.owner_name || '—'}</td><td className="px-4 py-4"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${item.is_hot ? 'bg-orange-50 text-orange-700' : 'bg-blue-50 text-blue-700'}`}>{item.is_hot ? <Flame size={14} /> : <ReceiptText size={14} />}{item.is_hot ? 'Đẩy tin HOT' : 'Đăng video'}</span></td><td className="px-4 py-4 text-slate-500">{formatDate(item.created_at, true)}</td><td className="px-4 py-4 text-right font-bold text-emerald-700">{formatCurrency(item.amount)}</td></tr>)}</tbody></table> : <EmptyState title="Chưa có giao dịch" description="Doanh thu sẽ xuất hiện sau khi dịch vụ được duyệt." />}</div></section>
        </div>
    );
}
