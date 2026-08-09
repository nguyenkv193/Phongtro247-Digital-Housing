export interface ActionResponse {
    success: boolean;
    code: string;
    message: string;
}

export interface AdminUser {
    id: number;
    full_name: string;
    email: string | null;
    role: string;
    has_completed_host_info: boolean;
    verified: boolean;
    is_blocked: boolean;
}

export interface AdminListing {
    id: number;
    name: string;
    status: string;
    is_hot: boolean;
    room_count: number | null;
    address: string | null;
    listing_type_name: string | null;
    owner_name: string | null;
}

export interface RevenueItem {
    id: number;
    amount: number | string;
    is_hot: boolean;
    created_at: string;
    listing_name: string | null;
    owner_name: string | null;
}

export interface ListingTypeSummary {
    id: number;
    name: string;
    count: number;
}

export interface AdminDashboard {
    totalRevenue: number | string;
    totalListings: number;
    totalComplaints: number;
    newUsers30d: number;
    listingTypes: ListingTypeSummary[];
}

export interface ListingReport {
    id: number;
    listing_id: number;
    listing_name: string | null;
    reason: string;
    status: string;
    created_at: string;
    reporter_name: string | null;
}

export interface PromotionRequest {
    id: number;
    request_type: 'video' | 'hot';
    listing_id: number;
    user_id: number;
    listing_name: string | null;
    user_name: string | null;
    status: string;
    note: string | null;
    admin_note: string | null;
    created_at: string;
    processed_at: string | null;
    duration_days: number | null;
    fee: number | string | null;
    hot_until: string | null;
    has_video: boolean | null;
    video_url: string | null;
}

export interface LoginResponse {
    token: string;
    user: {
        id: number;
        fullName?: string;
        full_name?: string;
        email?: string | null;
        phone?: string | null;
        role: string;
    };
}

export interface MasterDataGroup {
    code: string;
    name: string;
    description: string | null;
    status: boolean;
}

export interface MasterDataItem {
    id: number;
    categoryCode: string;
    code: string;
    name: string;
    description: string | null;
    status: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface MasterDataItemInput {
    code: string;
    name: string;
    description?: string;
    status: boolean;
}


