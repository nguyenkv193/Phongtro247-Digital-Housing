'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Check, ClipboardCheck, Flame, Search, Video, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { backofficeApi } from '@/features/backoffice/api';
import { EmptyState, LoadingState, PageHeading, StatusBadge } from '@/features/backoffice/components/BackofficeUi';
import type { PromotionRequest } from '@/features/backoffice/types';
import { formatCurrency, formatDate, getApiErrorMessage } from '@/features/backoffice/utils';

type Decision = 'approve' | 'reject';

export default function RequestsPage() {
    const [requests, setRequests] = useState<PromotionRequest[]>([]);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<PromotionRequest | null>(null);
    const [decision, setDecision] = useState<Decision>('approve');
    const [videoUrl, setVideoUrl] = useState('');
    const [adminNote, setAdminNote] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            setRequests(await backofficeApi.listPromotionRequests(filter === 'all' ? undefined : filter));
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'Không thể tải các yêu cầu cần duyệt.'));
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        void load();
    }, [load]);

    const visibleRequests = useMemo(() => {
        const keyword = search.trim().toLowerCase();
        return requests.filter(item => !keyword || item.listing_name?.toLowerCase().includes(keyword) || item.user_name?.toLowerCase().includes(keyword)).sort((first, second) => new Date(second.created_at).getTime() - new Date(first.created_at).getTime());
    }, [requests, search]);

    const openDecision = (request: PromotionRequest, nextDecision: Decision) => {
        setSelected(request);
        setDecision(nextDecision);
        setVideoUrl(request.video_url || '');
        setAdminNote('');
    };

    const closeDecision = () => {
        if (submitting) return;
        setSelected(null);
        setVideoUrl('');
        setAdminNote('');
    };

    const submitDecision = async () => {
        if (!selected) return;
        if (decision === 'approve' && selected.request_type === 'video' && !videoUrl.trim()) {
            toast.error('Vui lòng cung cấp URL video trước khi duyệt.');
            return;
        }
        if (decision === 'reject' && !adminNote.trim()) {
            toast.error('Vui lòng nhập lý do từ chối.');
            return;
        }
        setSubmitting(true);
        try {
            const response = selected.request_type === 'video'
                ? decision === 'approve'
                    ? await backofficeApi.approveVideo(selected.id, videoUrl.trim(), adminNote.trim())
                    : await backofficeApi.rejectVideo(selected.id, adminNote.trim())
                : decision === 'approve'
                    ? await backofficeApi.approveHot(selected.id, adminNote.trim())
                    : await backofficeApi.rejectHot(selected.id, adminNote.trim());
            toast.success(response.message);
            closeDecision();
            await load();
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'Không thể xử lý yêu cầu.'));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <LoadingState label="Đang tải yêu cầu cần duyệt..." />;

    return (
        <div className="space-y-7">
            <PageHeading title="Duyệt yêu cầu dịch vụ" description="Xử lý yêu cầu đăng video và đẩy tin HOT của chủ trọ." />
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap gap-2">
                        {['all', 'pending', 'approved', 'rejected'].map(item => <button key={item} type="button" onClick={() => setFilter(item)} className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${filter === item ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{item === 'all' ? 'Tất cả' : item === 'pending' ? 'Chờ duyệt' : item === 'approved' ? 'Đã duyệt' : 'Đã từ chối'}</button>)}
                    </div>
                    <label className="relative block w-full lg:w-80"><Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Tìm theo tin đăng hoặc chủ trọ" className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50" /></label>
                </div>
                <div className="mt-6 overflow-x-auto">
                    {visibleRequests.length ? <table className="min-w-[960px] w-full text-left text-sm"><thead className="border-y border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3 font-semibold">Loại yêu cầu</th><th className="px-4 py-3 font-semibold">Tin đăng</th><th className="px-4 py-3 font-semibold">Chủ trọ</th><th className="px-4 py-3 font-semibold">Nội dung</th><th className="px-4 py-3 font-semibold">Trạng thái</th><th className="px-4 py-3 font-semibold">Ngày gửi</th><th className="px-4 py-3 text-right font-semibold">Thao tác</th></tr></thead><tbody className="divide-y divide-slate-100">{visibleRequests.map(request => <tr key={`${request.request_type}-${request.id}`} className="hover:bg-slate-50/80"><td className="px-4 py-4"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${request.request_type === 'hot' ? 'bg-orange-50 text-orange-700' : 'bg-blue-50 text-blue-700'}`}>{request.request_type === 'hot' ? <Flame size={14} /> : <Video size={14} />}{request.request_type === 'hot' ? 'Tin HOT' : 'Video'}</span></td><td className="px-4 py-4"><Link href={`/listing/${request.listing_id}`} target="_blank" className="font-semibold text-slate-800 hover:text-blue-700">{request.listing_name || `Tin #${request.listing_id}`}</Link><p className="mt-1 text-xs text-slate-500">Mã tin: #{request.listing_id}</p></td><td className="px-4 py-4 font-medium text-slate-700">{request.user_name || '—'}</td><td className="px-4 py-4"><p className="max-w-60 truncate text-slate-600">{request.request_type === 'hot' ? `${request.duration_days || 0} ngày · ${formatCurrency(request.fee)}` : request.note || 'Không có ghi chú'}</p></td><td className="px-4 py-4"><StatusBadge status={request.status} /></td><td className="px-4 py-4 text-slate-500">{formatDate(request.created_at)}</td><td className="px-4 py-4 text-right">{request.status.toLowerCase() === 'pending' ? <div className="inline-flex gap-2"><button type="button" onClick={() => openDecision(request, 'approve')} className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100"><Check size={14} />Duyệt</button><button type="button" onClick={() => openDecision(request, 'reject')} className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100"><X size={14} />Từ chối</button></div> : <span className="text-xs text-slate-400">Đã xử lý</span>}</td></tr>)}</tbody></table> : <EmptyState title="Không có yêu cầu phù hợp" description="Các yêu cầu video hoặc tin HOT mới sẽ xuất hiện tại đây." />}
                </div>
            </section>

            {selected && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4" role="dialog" aria-modal="true"><div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wider text-blue-600">{selected.request_type === 'hot' ? 'Tin HOT' : 'Video'}</p><h2 className="mt-1 text-xl font-bold text-slate-900">{decision === 'approve' ? 'Duyệt yêu cầu' : 'Từ chối yêu cầu'}</h2></div><button type="button" onClick={closeDecision} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={19} /></button></div><div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm"><p className="font-semibold text-slate-800">{selected.listing_name || `Tin #${selected.listing_id}`}</p><p className="mt-1 text-slate-500">Chủ trọ: {selected.user_name || '—'}</p>{selected.request_type === 'hot' && <p className="mt-1 text-slate-500">Thời hạn: {selected.duration_days || 0} ngày · Phí: {formatCurrency(selected.fee)}</p>}</div>{decision === 'approve' && selected.request_type === 'video' && <label className="mt-5 block text-sm font-semibold text-slate-700">URL video<input value={videoUrl} onChange={event => setVideoUrl(event.target.value)} placeholder="https://..." type="url" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50" /></label>}<label className="mt-5 block text-sm font-semibold text-slate-700">{decision === 'reject' ? 'Lý do từ chối' : 'Ghi chú cho chủ trọ (không bắt buộc)'}<textarea value={adminNote} onChange={event => setAdminNote(event.target.value)} rows={3} placeholder={decision === 'reject' ? 'Nhập lý do từ chối' : 'Nhập ghi chú'} className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50" /></label><div className="mt-6 flex justify-end gap-3"><button type="button" disabled={submitting} onClick={closeDecision} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Hủy</button><button type="button" disabled={submitting} onClick={() => void submitDecision()} className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60 ${decision === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}>{submitting ? 'Đang xử lý...' : decision === 'approve' ? 'Xác nhận duyệt' : 'Xác nhận từ chối'}</button></div></div></div>}
        </div>
    );
}
