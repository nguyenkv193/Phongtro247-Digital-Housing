'use client';

import axios from 'axios';
import type {
    ActionResponse,
    AdminDashboard,
    AdminListing,
    AdminUser,
    ListingReport,
    MasterDataGroup,
    MasterDataItem,
    MasterDataItemInput,
    PromotionRequest,
    RevenueItem,
} from '@/features/backoffice/types';
import { API_URL } from '@/features/backoffice/utils';

function authorizationHeader(): Record<string, string> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
        throw new Error('Phiên đăng nhập đã hết hạn.');
    }
    return { Authorization: `Bearer ${token}` };
}

async function get<T>(url: string, params?: Record<string, string | undefined>): Promise<T> {
    const response = await axios.get<T>(`${API_URL}${url}`, {
        headers: authorizationHeader(),
        params,
    });
    return response.data;
}

async function put<T>(url: string, data: unknown): Promise<T> {
    const response = await axios.put<T>(`${API_URL}${url}`, data, { headers: authorizationHeader() });
    return response.data;
}

async function patch<T>(url: string, data?: unknown): Promise<T> {
    const response = await axios.patch<T>(`${API_URL}${url}`, data, { headers: authorizationHeader() });
    return response.data;
}

async function post<T>(url: string, data: unknown): Promise<T> {
    const response = await axios.post<T>(`${API_URL}${url}`, data, { headers: authorizationHeader() });
    return response.data;
}

function unwrapData<T>(payload: T | { data: T }): T {
    if (payload && typeof payload === 'object' && 'data' in payload) {
        return payload.data;
    }
    return payload as T;
}

export const backofficeApi = {
    listUsers: () => get<AdminUser[]>('/api/admin/users'),
    toggleUserBlock: (id: number) => patch<ActionResponse>(`/api/admin/users/${id}/block`),
    listListings: () => get<AdminListing[]>('/api/admin/adminlistings'),
    updateListingHot: (id: number, isHot: boolean) =>
        put<ActionResponse>(`/api/admin/adminlistings/${id}`, { is_hot: isHot }),
    updateListingStatus: (id: number, status: string) =>
        put<ActionResponse>(`/api/admin/adminlistings/${id}/status`, { status }),
    listRevenue: () => get<RevenueItem[]>('/api/admin/revenues'),
    dashboard: () => get<AdminDashboard>('/api/admin/reports'),
    listReports: () => get<ListingReport[]>('/api/admin/complaints'),
    updateReportStatus: (id: number, status: string) =>
        patch<ActionResponse>(`/api/listing-reports/${id}`, { status }),
    async listPromotionRequests(status?: string): Promise<PromotionRequest[]> {
        const payload = await get<PromotionRequest[] | { data: PromotionRequest[] }>('/api/videos/admin-requests', {
            status,
        });
        return unwrapData(payload);
    },
    approveVideo: (id: number, videoUrl: string, adminNote: string) =>
        post<ActionResponse>(`/api/videos/approve-video/${id}`, { video_url: videoUrl, admin_note: adminNote }),
    rejectVideo: (id: number, adminNote: string) =>
        post<ActionResponse>(`/api/videos/reject-video/${id}`, { admin_note: adminNote }),
    approveHot: (id: number, adminNote: string) =>
        post<ActionResponse>(`/api/hot-listings/admin/approve/${id}`, { admin_note: adminNote }),
    rejectHot: (id: number, adminNote: string) =>
        post<ActionResponse>(`/api/hot-listings/admin/reject/${id}`, { admin_note: adminNote }),
    async listMasterDataGroups(): Promise<MasterDataGroup[]> {
        const payload = await get<MasterDataGroup[] | { data: MasterDataGroup[] }>('/api/admin/master-data/groups');
        return unwrapData(payload);
    },
    async listMasterDataItems(groupCode: string): Promise<MasterDataItem[]> {
        const payload = await get<MasterDataItem[] | { data: MasterDataItem[] }>(`/api/admin/master-data/groups/${groupCode}/items`);
        return unwrapData(payload);
    },
    async createMasterDataItem(groupCode: string, input: MasterDataItemInput): Promise<MasterDataItem> {
        const payload = await post<MasterDataItem | { data: MasterDataItem }>(`/api/admin/master-data/groups/${groupCode}/items`, input);
        return unwrapData(payload);
    },
    async updateMasterDataItem(id: number, input: MasterDataItemInput): Promise<MasterDataItem> {
        const payload = await patch<MasterDataItem | { data: MasterDataItem }>(`/api/admin/master-data/items/${id}`, input);
        return unwrapData(payload);
    },
    updateMasterDataItemStatus: (id: number, status: boolean) =>
        patch<ActionResponse>(`/api/admin/master-data/items/${id}/status`, { status }),
};


