export type EntityId = string | number;

export interface User {
    id: EntityId;
    full_name?: string;
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    avatar?: string;
    balance?: number;
    role?: string;
    email_verified?: boolean;
    verified?: boolean;
    has_completed_host_info?: boolean;
    [key: string]: unknown;
}

export interface ListingSummary {
    id: EntityId;
    image?: string | null;
    title?: string;
    name?: string;
    price?: string | number;
    type?: string;
    listing_type?: string;
    area?: string | number;
    location?: string;
    isFavorite?: boolean;
    isHot?: boolean;
    [key: string]: unknown;
}

export interface Notification {
    id: EntityId;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
    [key: string]: unknown;
}

export interface Review {
    id: EntityId;
    listing_id?: EntityId;
    listing_name?: string;
    rating?: number;
    comment?: string;
    created_at?: string;
    user_id?: EntityId;
    user_name?: string;
    [key: string]: unknown;
}

export interface Location {
    id: EntityId;
    name: string;
    type?: string;
    [key: string]: unknown;
}

export interface AccommodationContract {
    listing_id?: EntityId;
    listing_name?: string;
    listing_address?: string;
    listing_type_name?: string;
    rent_price?: number | string;
    deposit_price?: number | string;
    listing_area?: number | string;
    contract_status?: string;
    start_date?: string;
    end_date?: string;
    landlord_name?: string;
    landlord_phone?: string;
    landlord_email?: string;
    note?: string;
    [key: string]: unknown;
}

export interface AccommodationData {
    contract?: AccommodationContract | null;
    [key: string]: unknown;
}

export interface VideoListing extends ListingSummary {
    videoUrl?: string | null;
    image?: string | null;
    rating?: number | string;
    reviewCount?: number;
    hasVideo?: boolean;
}

export interface ListingLocation extends Location {
    room_count?: number;
}

export interface ListingDetail extends ListingSummary {
    address?: string;
    description?: string;
    images?: string[];
    image_urls?: string[];
    amenities?: string[] | string;
    surroundings?: string[] | string;
    rules?: string | string[];
    owner?: User | null;
    owner_name?: string;
    owner_phone?: string;
    owner_email?: string;
    createdAt?: string;
    created_at?: string;
    typeSlug?: string;
    roomCount?: number;
    hasVideo?: boolean;
    videoUrl?: string | null;
    rating?: number | string;
    reviewCount?: number;
    [key: string]: unknown;
}

export interface ListingReview extends Review {
    listing_id?: EntityId;
    rating: number;
    created_at: string;
}

export interface Transaction {
    id: EntityId;
    date?: string;
    created_at?: string;
    type?: string;
    description?: string;
    amount?: number | string;
    status?: string;
    [key: string]: unknown;
}

export interface Tenant {
    id: EntityId;
    name?: string;
    full_name?: string;
    phone?: string;
    email?: string;
    status?: string;
    address?: string;
    [key: string]: unknown;
}

export interface Contract {
    id: EntityId;
    tenant_id?: EntityId;
    tenant_name?: string;
    tenant_phone?: string;
    listing_id?: EntityId;
    listing_type?: string;
    listing_type_name?: string;
    listing_name?: string;
    price?: number | string;
    rent_price?: number | string;
    deposit_price?: number | string;
    start_date?: string;
    end_date?: string;
    status?: string;
    note?: string;
    [key: string]: unknown;
}

export interface FavoriteResponse {
    data?: ListingSummary[];
    total?: number;
}

export interface UserContextValue {
    currentUser: User | null;
    loading: boolean;
    updateBalance: (newBalance: number) => void;
    refreshUser: () => void;
}

export interface FavoritesContextValue {
    favoritesList: ListingSummary[];
    favoritesCount: number;
    loadFavorites: () => Promise<void>;
    checkIsFavorited: (listingId: EntityId) => Promise<boolean>;
    toggleFavorite: (listingId: EntityId) => Promise<boolean>;
    removeFavorite: (listingId: EntityId) => Promise<void>;
}
