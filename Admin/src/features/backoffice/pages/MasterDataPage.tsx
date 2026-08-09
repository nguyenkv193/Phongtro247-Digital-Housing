'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Database, Edit3, Plus, RefreshCw, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { backofficeApi } from '@/features/backoffice/api';
import { EmptyState, LoadingState, PageHeading } from '@/features/backoffice/components/BackofficeUi';
import type { MasterDataGroup, MasterDataItem, MasterDataItemInput } from '@/features/backoffice/types';
import { formatDate, getApiErrorMessage } from '@/features/backoffice/utils';

interface MasterDataFormState {
    code: string;
    name: string;
    description: string;
    status: boolean;
}

const EMPTY_FORM: MasterDataFormState = {
    code: '',
    name: '',
    description: '',
    status: true,
};

function toForm(item?: MasterDataItem): MasterDataFormState {
    if (!item) return EMPTY_FORM;
    return {
        code: item.code,
        name: item.name,
        description: item.description || '',
        status: item.status,
    };
}

export default function MasterDataPage() {
    const [categories, setCategories] = useState<MasterDataGroup[]>([]);
    const [selectedCategoryCode, setSelectedCategoryCode] = useState('');
    const [codes, setCodes] = useState<MasterDataItem[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [loadingCodes, setLoadingCodes] = useState(false);
    const [saving, setSaving] = useState(false);
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingCode, setEditingCode] = useState<MasterDataItem | null>(null);
    const [form, setForm] = useState<MasterDataFormState>(EMPTY_FORM);

    const selectedCategory = useMemo(
        () => categories.find(category => category.code === selectedCategoryCode),
        [categories, selectedCategoryCode],
    );

    const loadCategories = useCallback(async () => {
        setLoadingCategories(true);
        try {
            const data = await backofficeApi.listMasterDataGroups();
            setCategories(data);
            setSelectedCategoryCode(current => current || data[0]?.code || '');
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'Không thể tải danh mục dữ liệu.'));
        } finally {
            setLoadingCategories(false);
        }
    }, []);

    const loadCodes = useCallback(async () => {
        if (!selectedCategoryCode) {
            setCodes([]);
            return;
        }
        setLoadingCodes(true);
        try {
            setCodes(await backofficeApi.listMasterDataItems(selectedCategoryCode));
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'Không thể tải mã dữ liệu.'));
        } finally {
            setLoadingCodes(false);
        }
    }, [selectedCategoryCode]);

    useEffect(() => {
        void loadCategories();
    }, [loadCategories]);

    useEffect(() => {
        void loadCodes();
    }, [loadCodes]);

    const openCreate = () => {
        setEditingCode(null);
        setForm(EMPTY_FORM);
        setDialogOpen(true);
    };

    const openEdit = (item: MasterDataItem) => {
        setEditingCode(item);
        setForm(toForm(item));
        setDialogOpen(true);
    };

    const save = async () => {
        if (!selectedCategoryCode || !form.code.trim() || !form.name.trim()) {
            toast.error('Vui lòng nhập mã và tên dữ liệu.');
            return;
        }

        const input: MasterDataItemInput = {
            code: form.code.trim().toLowerCase(),
            name: form.name.trim(),
            description: form.description.trim(),
            status: form.status,
        };

        setSaving(true);
        try {
            const item = editingCode
                ? await backofficeApi.updateMasterDataItem(editingCode.id, input)
                : await backofficeApi.createMasterDataItem(selectedCategoryCode, input);
            setCodes(current => editingCode
                ? current.map(value => value.id === item.id ? item : value).sort((left, right) => left.name.localeCompare(right.name))
                : [...current, item].sort((left, right) => left.name.localeCompare(right.name)));
            setDialogOpen(false);
            toast.success(editingCode ? 'Đã cập nhật mã dữ liệu.' : 'Đã tạo mã dữ liệu.');
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'Không thể lưu mã dữ liệu.'));
        } finally {
            setSaving(false);
        }
    };

    const toggleStatus = async (item: MasterDataItem) => {
        setUpdatingId(item.id);
        try {
            const response = await backofficeApi.updateMasterDataItemStatus(item.id, !item.status);
            setCodes(current => current.map(value => value.id === item.id ? { ...value, status: !value.status } : value));
            toast.success(response.message);
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'Không thể cập nhật trạng thái mã dữ liệu.'));
        } finally {
            setUpdatingId(null);
        }
    };

    if (loadingCategories) return <LoadingState label="Đang tải danh mục dữ liệu..." />;

    return (
        <div className="space-y-6">
            <PageHeading
                title="Dữ liệu danh mục"
                description="Quản lý các mã dùng chung của hệ thống theo từng nhóm danh mục."
                action={(
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" onClick={() => void loadCodes()} disabled={loadingCodes}>
                            <RefreshCw className={loadingCodes ? 'animate-spin' : ''} /> Làm mới
                        </Button>
                        <Button onClick={openCreate} disabled={!selectedCategoryCode}>
                            <Plus /> Thêm mã dữ liệu
                        </Button>
                    </div>
                )}
            />

            <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
                <Card className="h-fit">
                    <CardHeader className="border-b">
                        <CardTitle className="flex items-center gap-2 text-sm">
                            <Database className="size-4 text-muted-foreground" />
                            Nhóm danh mục
                        </CardTitle>
                        <CardDescription>Chọn nhóm để xem các mã cấu hình.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-1 p-3">
                        {categories.map(category => (
                            <Button
                                key={category.code}
                                variant={selectedCategoryCode === category.code ? 'secondary' : 'ghost'}
                                onClick={() => setSelectedCategoryCode(category.code)}
                                className="h-auto w-full justify-start px-3 py-2.5 text-left"
                            >
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate text-sm font-medium">{category.name}</span>
                                    <span className="mt-1 block text-xs text-muted-foreground">{category.code}</span>
                                </span>
                                {category.status && <span className="size-1.5 rounded-full bg-emerald-500" aria-label="Đang hoạt động" />}
                            </Button>
                        ))}
                    </CardContent>
                </Card>

                <Card className="min-w-0">
                    <CardHeader className="border-b">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="space-y-1">
                                <CardTitle>{selectedCategory?.name || 'Chọn nhóm danh mục'}</CardTitle>
                                <CardDescription>{selectedCategory?.description || 'Danh sách mã dữ liệu đang được cấu hình.'}</CardDescription>
                            </div>
                            <Badge variant="secondary">{codes.length} mã</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loadingCodes ? <LoadingState label="Đang tải mã dữ liệu..." /> : codes.length === 0 ? <div className="p-6"><EmptyState title="Chưa có mã dữ liệu" description="Hãy thêm mã đầu tiên cho nhóm danh mục này." /></div> : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="pl-6">Mã</TableHead>
                                        <TableHead>Tên hiển thị</TableHead>
                                        <TableHead>Mô tả</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                        <TableHead>Cập nhật</TableHead>
                                        <TableHead className="pr-6 text-right">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {codes.map(item => (
                                        <TableRow key={item.id}>
                                            <TableCell className="pl-6 font-mono text-xs font-medium text-muted-foreground">{item.code}</TableCell>
                                            <TableCell className="font-medium">{item.name}</TableCell>
                                            <TableCell className="max-w-64 truncate text-muted-foreground">{item.description || '—'}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={item.status ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-500'}>
                                                    {item.status ? 'Đang hoạt động' : 'Tạm ngưng'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(item.updatedAt, true)}</TableCell>
                                            <TableCell className="pr-6 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button size="sm" variant="ghost" onClick={() => openEdit(item)} aria-label={`Sửa ${item.name}`}>
                                                        <Edit3 /> Sửa
                                                    </Button>
                                                    <Button size="sm" variant="ghost" disabled={updatingId === item.id} onClick={() => void toggleStatus(item)}>
                                                        {item.status ? <ToggleRight /> : <ToggleLeft />}
                                                        {item.status ? 'Tạm ngưng' : 'Kích hoạt'}
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={dialogOpen} onOpenChange={open => !open && !saving && setDialogOpen(false)}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>{editingCode ? 'Sửa mã dữ liệu' : 'Thêm mã dữ liệu'}</DialogTitle>
                        <DialogDescription>
                            Mã dữ liệu thuộc nhóm <strong>{selectedCategory?.name || selectedCategoryCode}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-2">
                        <div className="grid gap-2">
                            <Label htmlFor="master-code">Mã dữ liệu</Label>
                            <Input id="master-code" value={form.code} onChange={event => setForm(current => ({ ...current, code: event.target.value }))} disabled={Boolean(editingCode)} placeholder="vi-du-du-lieu" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="master-name">Tên hiển thị</Label>
                            <Input id="master-name" value={form.name} onChange={event => setForm(current => ({ ...current, name: event.target.value }))} placeholder="Tên hiển thị" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="master-description">Mô tả</Label>
                            <Textarea id="master-description" value={form.description} onChange={event => setForm(current => ({ ...current, description: event.target.value }))} placeholder="Mô tả ngắn cho mã dữ liệu" rows={3} />
                        </div>
                        <div className="flex items-center gap-3 text-sm font-medium">
                            <Checkbox id="master-status" checked={form.status} onCheckedChange={checked => setForm(current => ({ ...current, status: checked === true }))} />
                            <Label htmlFor="master-status" className="cursor-pointer">Kích hoạt mã dữ liệu</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>Hủy</Button>
                        <Button onClick={() => void save()} disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu mã dữ liệu'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}


