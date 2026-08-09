'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Lock, Search, ShieldCheck, Unlock, UserRoundCheck, Users as UsersIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { backofficeApi } from '@/features/backoffice/api';
import { Button, EmptyState, LoadingState, PageHeading, StatCard } from '@/features/backoffice/components/BackofficeUi';
import type { AdminUser } from '@/features/backoffice/types';
import { getApiErrorMessage } from '@/features/backoffice/utils';

type UserFilter = 'all' | 'user' | 'landlord' | 'admin';

function roleLabel(role: string): string {
    return role === 'admin' ? 'Quản trị viên' : role === 'landlord' ? 'Chủ trọ' : 'Người thuê';
}

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
        const matchesSearch = !keyword || user.full_name?.toLowerCase().includes(keyword) || user.email?.toLowerCase().includes(keyword);
        return matchesFilter && matchesSearch;
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

            <Card>
                <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex flex-wrap gap-2">
                            {tabItems.map(item => (
                                <Button key={item.value} size="sm" variant={filter === item.value ? 'default' : 'secondary'} onClick={() => setFilter(item.value)}>
                                    {item.label}
                                    <span className="ml-1 opacity-75">{item.count}</span>
                                </Button>
                            ))}
                        </div>
                        <div className="relative block w-full lg:w-80">
                            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={17} />
                            <Input value={search} onChange={event => setSearch(event.target.value)} placeholder="Tìm theo tên hoặc email" className="h-9 pl-10 pr-4" />
                        </div>
                    </div>

                    <div className="mt-6">
                        {visibleUsers.length ? (
                            <Table className="min-w-[760px]">
                                <TableHeader>
                                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                                        <TableHead>Người dùng</TableHead>
                                        <TableHead>Vai trò</TableHead>
                                        <TableHead>Xác thực</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                        <TableHead className="text-right">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {visibleUsers.map(user => {
                                        const role = user.role.toLowerCase();
                                        return (
                                            <TableRow key={user.id}>
                                                <TableCell>
                                                    <p className="font-semibold">{user.full_name}</p>
                                                    <p className="mt-1 text-xs text-muted-foreground">{user.email || 'Chưa cập nhật email'} · #{user.id}</p>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={role === 'admin' ? 'border-violet-200 bg-violet-50 text-violet-700' : role === 'landlord' ? 'border-blue-200 bg-blue-50 text-blue-700' : 'bg-muted text-muted-foreground'}>
                                                        {roleLabel(role)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={user.verified ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'text-muted-foreground'}>
                                                        <ShieldCheck />
                                                        {user.verified ? 'Đã xác thực' : 'Chưa xác thực'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={user.is_blocked ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}>
                                                        {user.is_blocked ? 'Đã khóa' : 'Đang hoạt động'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {role !== 'admin' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            disabled={updatingId === user.id}
                                                            onClick={() => void toggleBlock(user)}
                                                            className={user.is_blocked ? 'text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50' : 'text-rose-700 hover:border-rose-300 hover:bg-rose-50'}
                                                        >
                                                            {user.is_blocked ? <Unlock /> : <Lock />}
                                                            {user.is_blocked ? 'Mở khóa' : 'Khóa'}
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        ) : (
                            <EmptyState title="Không có người dùng phù hợp" description="Hãy thay đổi bộ lọc hoặc từ khóa tìm kiếm." />
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}


