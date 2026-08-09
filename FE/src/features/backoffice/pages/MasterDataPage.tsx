'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Database, Edit3, Plus, RefreshCw, SlidersHorizontal, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { backofficeApi } from '@/features/backoffice/api';
import { EmptyState, LoadingState, PageHeading } from '@/features/backoffice/components/BackofficeUi';
import type { MasterDataGroup, MasterDataItem, MasterDataItemInput } from '@/features/backoffice/types';
import { formatDate, getApiErrorMessage } from '@/features/backoffice/utils';

interface MasterDataFormState {
    code: string;
    name: string;
    description: string;
    sortOrder: string;
    active: boolean;
    metadata: string;
}

const EMPTY_FORM: MasterDataFormState = {
    code: '',
    name: '',
    description: '',
    sortOrder: '0',
    active: true,
    metadata: '{}',
};

function toForm(item?: MasterDataItem): MasterDataFormState {
    if (!item) return EMPTY_FORM;
    return {
        code: item.code,
        name: item.name,
        description: item.description || '',
        sortOrder: String(item.sortOrder),
        active: item.active,
        metadata: item.metadata || '{}',
    };
}

export default function MasterDataPage() {
    const [groups, setGroups] = useState<MasterDataGroup[]>([]);
    const [selectedGroupCode, setSelectedGroupCode] = useState('');
    const [items, setItems] = useState<MasterDataItem[]>([]);
    const [loadingGroups, setLoadingGroups] = useState(true);
    const [loadingItems, setLoadingItems] = useState(false);
    const [saving, setSaving] = useState(false);
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MasterDataItem | null>(null);
    const [form, setForm] = useState<MasterDataFormState>(EMPTY_FORM);

    const selectedGroup = useMemo(
        () => groups.find(group => group.code === selectedGroupCode),
        [groups, selectedGroupCode],
    );

    const loadGroups = useCallback(async () => {
        setLoadingGroups(true);
        try {
            const data = await backofficeApi.listMasterDataGroups();
            setGroups(data);
            setSelectedGroupCode(current => current || data[0]?.code || '');
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'Không thể tải nhóm master data.'));
        } finally {
            setLoadingGroups(false);
        }
    }, []);

    const loadItems = useCallback(async () => {
        if (!selectedGroupCode) {
            setItems([]);
            return;
        }
        setLoadingItems(true);
        try {
            setItems(await backofficeApi.listMasterDataItems(selectedGroupCode));
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'Không thể tải dữ liệu danh mục.'));
        } finally {
            setLoadingItems(false);
        }
    }, [selectedGroupCode]);

    useEffect(() => {
        void loadGroups();
    }, [loadGroups]);

    useEffect(() => {
        void loadItems();
    }, [loadItems]);

    const openCreate = () => {
        setEditingItem(null);
        setForm(EMPTY_FORM);
        setModalOpen(true);
    };

    const openEdit = (item: MasterDataItem) => {
        setEditingItem(item);
        setForm(toForm(item));
        setModalOpen(true);
    };

    const closeModal = () => {
        if (!saving) setModalOpen(false);
    };

    const save = async () => {
        if (!selectedGroupCode || !form.code.trim() || !form.name.trim()) {
            toast.error('Vui lòng nhập mã và tên dữ liệu.');
            return;
        }
        try {
            JSON.parse(form.metadata || '{}');
        } catch {
            toast.error('Metadata phải là JSON hợp lệ.');
            return;
        }

        const input: MasterDataItemInput = {
            code: form.code.trim().toLowerCase(),
            name: form.name.trim(),
            description: form.description.trim(),
            sortOrder: Math.max(0, Number.parseInt(form.sortOrder, 10) || 0),
            active: form.active,
            metadata: form.metadata.trim() || '{}',
        };

        setSaving(true);
        try {
            const item = editingItem
                ? await backofficeApi.updateMasterDataItem(editingItem.id, input)
                : await backofficeApi.createMasterDataItem(selectedGroupCode, input);
            setItems(current => editingItem
                ? current.map(value => value.id === item.id ? item : value)
                : [...current, item].sort((left, right) => left.sortOrder - right.sortOrder || left.name.localeCompare(right.name)));
            setModalOpen(false);
            toast.success(editingItem ? 'Đã cập nhật dữ liệu danh mục.' : 'Đã tạo dữ liệu danh mục.');
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'Không thể lưu dữ liệu danh mục.'));
        } finally {
            setSaving(false);
        }
    };

    const toggleStatus = async (item: MasterDataItem) => {
        setUpdatingId(item.id);
        try {
            const response = await backofficeApi.updateMasterDataItemStatus(item.id, !item.active);
            setItems(current => current.map(value => value.id === item.id ? { ...value, active: !value.active } : value));
            toast.success(response.message);
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'Không thể cập nhật trạng thái dữ liệu.'));
        } finally {
            setUpdatingId(null);
        }
    };

    if (loadingGroups) return <LoadingState label="Đang tải master data..." />;

    return (
        <div className="space-y-7">
            <PageHeading
                eyebrow="Cấu hình hệ thống"
                title="Master data"
                description="Quản lý các danh mục dùng chung, giúp dữ liệu hiển thị nhất quán trên toàn hệ thống."
                action={(
                    <div className="flex gap-2">
                        <button type="button" onClick={() => void loadItems()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:border-blue-200 hover:text-blue-700">
                            <RefreshCw size={17} /> Làm mới
                        </button>
                        <button type="button" onClick={openCreate} disabled={!selectedGroupCode} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-100 hover:bg-blue-700 disabled:opacity-50">
                            <Plus size={17} /> Thêm dữ liệu
                        </button>
                    </div>
                )}
            />

            <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
                <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-center gap-2 px-2 text-sm font-bold text-slate-800">
                        <Database size={18} className="text-blue-600" /> Nhóm dữ liệu
                    </div>
                    <div className="space-y-1">
                        {groups.map(group => (
                            <button
                                key={group.code}
                                type="button"
                                onClick={() => setSelectedGroupCode(group.code)}
                                className={`w-full rounded-xl px-3 py-3 text-left transition ${selectedGroupCode === group.code ? 'bg-blue-600 text-white shadow-md shadow-blue-100' : 'text-slate-600 hover:bg-slate-50'}`}
                            >
                                <span className="block text-sm font-semibold">{group.name}</span>
                                <span className={`mt-1 block text-[11px] font-medium ${selectedGroupCode === group.code ? 'text-blue-100' : 'text-slate-400'}`}>{group.code}</span>
                            </button>
                        ))}
                    </div>
                </aside>

                <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
                    <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <SlidersHorizontal size={19} className="text-blue-600" />
                                <h2 className="text-lg font-bold text-slate-900">{selectedGroup?.name || 'Chọn nhóm dữ liệu'}</h2>
                            </div>
                            <p className="mt-1 text-sm text-slate-500">{selectedGroup?.description || 'Danh sách dữ liệu đang được cấu hình.'}</p>
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">{items.length} mục</span>
                    </div>

                    <div className="mt-5 overflow-x-auto">
                        {loadingItems ? <LoadingState label="Đang tải danh mục..." /> : items.length === 0 ? <EmptyState title="Chưa có dữ liệu" description="Hãy thêm mục đầu tiên cho nhóm này." /> : (
                            <table className="min-w-[760px] w-full text-left text-sm">
                                <thead className="border-y border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Mã</th>
                                        <th className="px-4 py-3 font-semibold">Tên hiển thị</th>
                                        <th className="px-4 py-3 font-semibold">Thứ tự</th>
                                        <th className="px-4 py-3 font-semibold">Trạng thái</th>
                                        <th className="px-4 py-3 font-semibold">Cập nhật</th>
                                        <th className="px-4 py-3 text-right font-semibold">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {items.map(item => (
                                        <tr key={item.id} className="hover:bg-slate-50/80">
                                            <td className="px-4 py-4 font-mono text-xs font-semibold text-blue-700">{item.code}</td>
                                            <td className="px-4 py-4"><p className="font-semibold text-slate-800">{item.name}</p>{item.description && <p className="mt-1 max-w-sm text-xs text-slate-500">{item.description}</p>}</td>
                                            <td className="px-4 py-4 text-slate-600">{item.sortOrder}</td>
                                            <td className="px-4 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${item.active ? 'bg-emerald-50 text-emerald-700 ring-emerald-100' : 'bg-slate-100 text-slate-500 ring-slate-200'}`}>{item.active ? 'Đang hoạt động' : 'Tạm ngưng'}</span></td>
                                            <td className="px-4 py-4 text-slate-500">{formatDate(item.updatedAt, true)}</td>
                                            <td className="px-4 py-4"><div className="flex justify-end gap-2"><button type="button" onClick={() => openEdit(item)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-semibold text-slate-600 hover:border-blue-200 hover:text-blue-700"><Edit3 size={14} /> Sửa</button><button type="button" disabled={updatingId === item.id} onClick={() => void toggleStatus(item)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-semibold text-slate-600 hover:border-amber-200 hover:text-amber-700 disabled:opacity-50">{item.active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}{item.active ? 'Tạm ngưng' : 'Kích hoạt'}</button></div></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </section>
            </div>

            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="dialog" aria-modal="true" aria-label={editingItem ? 'Sửa dữ liệu danh mục' : 'Thêm dữ liệu danh mục'}>
                    <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="flex items-start justify-between gap-4">
                            <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">{selectedGroup?.name}</p><h2 className="mt-1 text-xl font-bold text-slate-900">{editingItem ? 'Sửa dữ liệu' : 'Thêm dữ liệu'}</h2></div>
                            <button type="button" onClick={closeModal} className="rounded-lg px-2 py-1 text-2xl leading-none text-slate-400 hover:bg-slate-100" aria-label="Đóng">×</button>
                        </div>
                        <div className="mt-6 grid gap-4 sm:grid-cols-2">
                            <label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Mã dữ liệu</span><input value={form.code} onChange={event => setForm(current => ({ ...current, code: event.target.value }))} disabled={Boolean(editingItem)} placeholder="vi-du-du-lieu" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:bg-slate-100" /></label>
                            <label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Tên hiển thị</span><input value={form.name} onChange={event => setForm(current => ({ ...current, name: event.target.value }))} placeholder="Tên hiển thị" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50" /></label>
                            <label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Thứ tự hiển thị</span><input type="number" min="0" value={form.sortOrder} onChange={event => setForm(current => ({ ...current, sortOrder: event.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50" /></label>
                            <label className="flex items-center gap-3 pt-7 text-sm font-semibold text-slate-700"><input type="checkbox" checked={form.active} onChange={event => setForm(current => ({ ...current, active: event.target.checked }))} className="h-4 w-4 rounded border-slate-300 text-blue-600" /> Kích hoạt ngay</label>
                            <label className="block sm:col-span-2"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Mô tả</span><input value={form.description} onChange={event => setForm(current => ({ ...current, description: event.target.value }))} placeholder="Mô tả ngắn cho dữ liệu" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50" /></label>
                            <label className="block sm:col-span-2"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Metadata JSON</span><textarea rows={3} value={form.metadata} onChange={event => setForm(current => ({ ...current, metadata: event.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-mono text-xs outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50" /></label>
                        </div>
                        <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={closeModal} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Hủy</button><button type="button" disabled={saving} onClick={() => void save()} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">{saving ? 'Đang lưu...' : 'Lưu dữ liệu'}</button></div>
                    </div>
                </div>
            )}
        </div>
    );
}
