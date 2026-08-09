'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Building2, Flame, Search, SlidersHorizontal } from 'lucide-react';
import { toast } from 'react-toastify';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { backofficeApi } from '@/features/backoffice/api';
import { Button, EmptyState, LoadingState, PageHeading, StatCard, StatusBadge } from '@/features/backoffice/components/BackofficeUi';
import type { AdminListing } from '@/features/backoffice/types';
import { getApiErrorMessage, publicListingUrl } from '@/features/backoffice/utils';

const statuses = ['all', 'published', 'pending', 'hidden', 'rejected'] as const;

function statusLabel(status: (typeof statuses)[number]): string {
    return status === 'all' ? 'Tất cả' : status === 'published' ? 'Đã đăng' : status === 'pending' ? 'Chờ duyệt' : status === 'hidden' ? 'Đã ẩn' : 'Từ chối';
}

export default function ListingsPage() {
    const [listings, setListings] = useState<AdminListing[]>([]);
    const [status, setStatus] = useState<(typeof statuses)[number]>('all');
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
        const matchesSearch = !keyword
            || listing.name.toLowerCase().includes(keyword)
            || listing.owner_name?.toLowerCase().includes(keyword)
            || listing.address?.toLowerCase().includes(keyword);
        return (status === 'all' || listing.status.toLowerCase() === status) && matchesSearch;
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

            <section className="grid gap-4 sm:grid-cols-3">
                <StatCard label="Tổng tin đăng" value={listings.length} icon={Building2} tone="blue" />
                <StatCard label="Đã đăng" value={listings.filter(item => item.status.toLowerCase() === 'published').length} icon={SlidersHorizontal} tone="emerald" />
                <StatCard label="Tin HOT" value={listings.filter(item => item.is_hot).length} icon={Flame} tone="orange" />
            </section>

            <Card>
                <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex flex-wrap gap-2">
                            {statuses.map(item => (
                                <Button key={item} type="button" size="sm" variant={status === item ? 'default' : 'secondary'} onClick={() => setStatus(item)}>
                                    {statusLabel(item)}
                                </Button>
                            ))}
                        </div>
                        <div className="relative block w-full lg:w-80">
                            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={17} />
                            <Input value={search} onChange={event => setSearch(event.target.value)} placeholder="Tìm theo tin, chủ trọ, địa chỉ" className="h-9 pl-10 pr-4" />
                        </div>
                    </div>

                    <div className="mt-6">
                        {visibleListings.length ? (
                            <Table className="min-w-[900px]">
                                <TableHeader>
                                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                                        <TableHead>Tin đăng</TableHead>
                                        <TableHead>Chủ trọ</TableHead>
                                        <TableHead>Loại hình</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                        <TableHead>HOT</TableHead>
                                        <TableHead className="text-right">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {visibleListings.map(listing => (
                                        <TableRow key={listing.id}>
                                            <TableCell>
                                                <a href={publicListingUrl(listing.id)} target="_blank" rel="noreferrer" className="font-semibold hover:text-primary">
                                                    {listing.name}
                                                </a>
                                                <p className="mt-1 max-w-64 truncate text-xs text-muted-foreground">{listing.address || 'Chưa cập nhật địa chỉ'} · {listing.room_count || 0} phòng</p>
                                            </TableCell>
                                            <TableCell>{listing.owner_name || '—'}</TableCell>
                                            <TableCell className="text-muted-foreground">{listing.listing_type_name || '—'}</TableCell>
                                            <TableCell><StatusBadge status={listing.status} /></TableCell>
                                            <TableCell>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    disabled={updatingId === listing.id}
                                                    onClick={() => void updateHot(listing)}
                                                    className={listing.is_hot ? 'border-orange-200 text-orange-700 hover:bg-orange-50' : 'text-muted-foreground'}
                                                >
                                                    <Flame fill={listing.is_hot ? 'currentColor' : 'none'} />
                                                    {listing.is_hot ? 'Đang HOT' : 'Đặt HOT'}
                                                </Button>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Select value={listing.status} onValueChange={value => void updateStatus(listing, value)} disabled={updatingId === listing.id}>
                                                    <SelectTrigger size="sm" className="ml-auto w-28">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="published">Đã đăng</SelectItem>
                                                        <SelectItem value="pending">Chờ duyệt</SelectItem>
                                                        <SelectItem value="hidden">Ẩn</SelectItem>
                                                        <SelectItem value="rejected">Từ chối</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <EmptyState title="Không có tin đăng phù hợp" description="Hãy thay đổi bộ lọc hoặc từ khóa tìm kiếm." />
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
