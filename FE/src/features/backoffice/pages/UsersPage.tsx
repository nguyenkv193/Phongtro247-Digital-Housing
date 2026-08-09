'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Lock, Search, ShieldCheck, Unlock, UserRoundCheck, Users as UsersIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import { backofficeApi } from '@/features/backoffice/api';
import { EmptyState, LoadingState, PageHeading, StatCard } from '@/features/backoffice/components/BackofficeUi';
import type { AdminUser } from '@/features/backoffice/types';
import { getApiErrorMessage } from '@/features/backoffice/utils';

type UserFilter = 'all' | 'user' | 'landlord' | 'admin';

export default function UsersPage() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [filter, setFilter] = useState<UserFilter>('all');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            setUsers(await backofficeApi.listUsers());
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'Không thể tải danh sách người dùng.'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    const visibleUsers = useMemo(() => users.filter(user => {
        const role = user.role.toLowerCase();
        const matchesFilter = filter === 'all' || role === filter;
        const keyword = search.trim().toLowerCase();
        return matchesFilter && (!keyword || user.full_name?.toLowerCase().includes(keyword) || user.email?.toLowerCase().includes(keyword));
    }), [filter, search, users]);

    const toggleBlock = async (user: AdminUser) => {
        const action = user.is_blocked ? 'mở khóa' : 'khóa';
        if (!window.confirm(`Bạn có chắc muốn ${action} tài khoản “${user.full_name}”?`)) return;
        setUpdatingId(user.id);
        try {
            const response = await backofficeApi.toggleUserBlock(user.id);
            setUsers(items => items.map(item => item.id === user.id ? { ...item, is_blocked: !item.is_blocked } : item));
            toast.success(response.message);
        } catch (error) {
            toast.error(getApiErrorMessage(error, `Không thể ${action} tài khoản.`));
        } finally {
            setUpdatingId(null);
        }
    };

    const tabItems: Array<{ value: UserFilter; label: string; count: number }> = [
        { value: 'all', label: 'Tất cả', count: users.length },
        { value: 'user', label: 'Người thuê', count: users.filter(item => item.role.toLowerCase() === 'user').length },
        { value: 'landlord', label: 'Chủ trọ', count: users.filter(item => item.role.toLowerCase() === 'landlord').length },
        { value: 'admin', label: 'Quản trị viên', count: users.filter(item => item.role.toLowerCase() === 'admin').length },
    ];

    if (loading) return <LoadingState label="Đang tải người dùng..." />;

    return (
        <div className="space-y-7">
            <PageHeading title="Quản lý người dùng" description="Theo dõi vai trò, trạng thái xác thực và quyền truy cập của các tài khoản." />
            <section className="grid gap-4 sm:grid-cols-3">
                <StatCard label="Tổng tài khoản" value={users.length} icon={UsersIcon} tone="blue" />
                <StatCard label="Chủ trọ" value={users.filter(item => item.role.toLowerCase() === 'landlord').length} icon={UserRoundCheck} tone="purple" />
                <StatCard label="Tài khoản đang khóa" value={users.filter(item => item.is_blocked).length} icon={Lock} tone="orange" />
            </section>
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap gap-2">
                        {tabItems.map(item => <button key={item.value} type="button" onClick={() => setFilter(item.value)} className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${filter === item.value ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{item.label} <span className="ml-1 opacity-75">{item.count}</span></button>)}
                    </div>
                    <label className="relative block w-full lg:w-80"><Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Tìm theo tên hoặc email" className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50" /></label>
                </div>
                <div className="mt-6 overflow-x-auto">
                    {visibleUsers.length ? (
                        <table className="min-w-[760px] w-full text-left text-sm">
                            <thead className="border-y border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3 font-semibold">Người dùng</th><th className="px-4 py-3 font-semibold">Vai trò</th><th className="px-4 py-3 font-semibold">Xác thực</th><th className="px-4 py-3 font-semibold">Trạng thái</th><th className="px-4 py-3 text-right font-semibold">Thao tác</th></tr></thead>
                            <tbody className="divide-y divide-slate-100">
                                {visibleUsers.map(user => {
                                    const role = user.role.toLowerCase();
                                    return <tr key={user.id} className="hover:bg-slate-50/80"><td className="px-4 py-4"><p className="font-semibold text-slate-800">{user.full_name}</p><p className="mt-1 text-xs text-slate-500">{user.email || 'Chưa cập nhật email'} · #{user.id}</p></td><td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${role === 'admin' ? 'bg-violet-50 text-violet-700' : role === 'landlord' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>{role === 'admin' ? 'Quản trị viên' : role === 'landlord' ? 'Chủ trọ' : 'Người thuê'}</span></td><td className="px-4 py-4"><span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${user.verified ? 'text-emerald-700' : 'text-slate-500'}`}><ShieldCheck size={15} />{user.verified ? 'Đã xác thực' : 'Chưa xác thực'}</span></td><td className="px-4 py-4"><span className={`text-xs font-semibold ${user.is_blocked ? 'text-rose-700' : 'text-emerald-700'}`}>{user.is_blocked ? 'Đã khóa' : 'Đang hoạt động'}</span></td><td className="px-4 py-4 text-right">{role !== 'admin' && <button type="button" disabled={updatingId === user.id} onClick={() => void toggleBlock(user)} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition disabled:opacity-50 ${user.is_blocked ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'}`}>{user.is_blocked ? <Unlock size={15} /> : <Lock size={15} />}{user.is_blocked ? 'Mở khóa' : 'Khóa'}</button>}</td></tr>;
                                })}
                            </tbody>
                        </table>
                    ) : <EmptyState title="Không có người dùng phù hợp" description="Hãy thay đổi bộ lọc hoặc từ khóa tìm kiếm." />}
                </div>
            </section>
        </div>
    );
}
