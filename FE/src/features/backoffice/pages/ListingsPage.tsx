'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Building2, Flame, Search, SlidersHorizontal } from 'lucide-react';
import { toast } from 'react-toastify';
import { backofficeApi } from '@/features/backoffice/api';
import { EmptyState, LoadingState, PageHeading, StatCard, StatusBadge } from '@/features/backoffice/components/BackofficeUi';
import type { AdminListing } from '@/features/backoffice/types';
import { getApiErrorMessage } from '@/features/backoffice/utils';

const statuses = ['all', 'published', 'pending', 'hidden', 'rejected'];

export default function ListingsPage() {
    const [listings, setListings] = useState<AdminListing[]>([]);
    const [status, setStatus] = useState('all');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            setListings(await backofficeApi.listListings());
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'Không thể tải danh sách tin đăng.'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    const visibleListings = useMemo(() => listings.filter(listing => {
        const keyword = search.trim().toLowerCase();
        return (status === 'all' || listing.status.toLowerCase() === status) && (!keyword || listing.name.toLowerCase().includes(keyword) || listing.owner_name?.toLowerCase().includes(keyword) || listing.address?.toLowerCase().includes(keyword));
    }), [listings, search, status]);

    const updateHot = async (listing: AdminListing) => {
        setUpdatingId(listing.id);
        try {
            const response = await backofficeApi.updateListingHot(listing.id, !listing.is_hot);
            setListings(items => items.map(item => item.id === listing.id ? { ...item, is_hot: !item.is_hot } : item));
            toast.success(response.message);
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'Không thể cập nhật nhãn HOT.'));
        } finally {
            setUpdatingId(null);
        }
    };

    const updateStatus = async (listing: AdminListing, nextStatus: string) => {
        setUpdatingId(listing.id);
        try {
            const response = await backofficeApi.updateListingStatus(listing.id, nextStatus);
            setListings(items => items.map(item => item.id === listing.id ? { ...item, status: nextStatus } : item));
            toast.success(response.message);
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'Không thể cập nhật trạng thái tin đăng.'));
        } finally {
            setUpdatingId(null);
        }
    };

    if (loading) return <LoadingState label="Đang tải tin đăng..." />;

    return (
        <div className="space-y-7">
            <PageHeading title="Quản lý tin đăng" description="Kiểm soát trạng thái hiển thị và nhãn HOT của tất cả tin đăng." />
            <section className="grid gap-4 sm:grid-cols-3"><StatCard label="Tổng tin đăng" value={listings.length} icon={Building2} tone="blue" /><StatCard label="Đã đăng" value={listings.filter(item => item.status.toLowerCase() === 'published').length} icon={SlidersHorizontal} tone="emerald" /><StatCard label="Tin HOT" value={listings.filter(item => item.is_hot).length} icon={Flame} tone="orange" /></section>
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap gap-2">{statuses.map(item => <button type="button" key={item} onClick={() => setStatus(item)} className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${status === item ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{item === 'all' ? 'Tất cả' : item === 'published' ? 'Đã đăng' : item === 'pending' ? 'Chờ duyệt' : item === 'hidden' ? 'Đã ẩn' : 'Từ chối'}</button>)}</div>
                    <label className="relative block w-full lg:w-80"><Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Tìm theo tin, chủ trọ, địa chỉ" className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50" /></label>
                </div>
                <div className="mt-6 overflow-x-auto">
                    {visibleListings.length ? <table className="min-w-[900px] w-full text-left text-sm"><thead className="border-y border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3 font-semibold">Tin đăng</th><th className="px-4 py-3 font-semibold">Chủ trọ</th><th className="px-4 py-3 font-semibold">Loại hình</th><th className="px-4 py-3 font-semibold">Trạng thái</th><th className="px-4 py-3 font-semibold">HOT</th><th className="px-4 py-3 text-right font-semibold">Thao tác</th></tr></thead><tbody className="divide-y divide-slate-100">{visibleListings.map(listing => <tr key={listing.id} className="hover:bg-slate-50/80"><td className="px-4 py-4"><Link href={`/listing/${listing.id}`} target="_blank" className="font-semibold text-slate-800 hover:text-blue-700">{listing.name}</Link><p className="mt-1 max-w-64 truncate text-xs text-slate-500">{listing.address || 'Chưa cập nhật địa chỉ'} · {listing.room_count || 0} phòng</p></td><td className="px-4 py-4 text-slate-700">{listing.owner_name || '—'}</td><td className="px-4 py-4 text-slate-600">{listing.listing_type_name || '—'}</td><td className="px-4 py-4"><StatusBadge status={listing.status} /></td><td className="px-4 py-4"><button type="button" disabled={updatingId === listing.id} onClick={() => void updateHot(listing)} className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition disabled:opacity-50 ${listing.is_hot ? 'bg-orange-50 text-orange-700 hover:bg-orange-100' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}><Flame size={14} fill={listing.is_hot ? 'currentColor' : 'none'} />{listing.is_hot ? 'Đang HOT' : 'Đặt HOT'}</button></td><td className="px-4 py-4 text-right"><select value={listing.status} disabled={updatingId === listing.id} onChange={event => void updateStatus(listing, event.target.value)} className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500 disabled:opacity-50"><option value="published">Đã đăng</option><option value="pending">Chờ duyệt</option><option value="hidden">Ẩn</option><option value="rejected">Từ chối</option></select></td></tr>)}</tbody></table> : <EmptyState title="Không có tin đăng phù hợp" description="Hãy thay đổi bộ lọc hoặc từ khóa tìm kiếm." />}
                </div>
            </section>
        </div>
    );
}
