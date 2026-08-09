import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import type { PropsWithChildren } from 'react';
import type { EntityId, FavoritesContextValue, FavoriteResponse, ListingSummary } from '@/types';

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error('useFavorites must be used within FavoritesProvider');
    }
    return context;
};

export const FavoritesProvider = ({ children }: PropsWithChildren) => {
    const [favoritesList, setFavoritesList] = useState<ListingSummary[]>([]);
    const [favoritesCount, setFavoritesCount] = useState(0);
    const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') || 'http://localhost:5000';

    const loadFavorites = async (): Promise<void> => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            setFavoritesCount(0);
            setFavoritesList([]);
            return;
        }

        try {
            const response = await axios.get<FavoriteResponse>(`${API_URL}/api/favorites`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setFavoritesList(response.data.data || []);
            setFavoritesCount(response.data.total || 0);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách yêu thích:', error);
            setFavoritesCount(0);
            setFavoritesList([]);
        }
    };

    const checkIsFavorited = async (listingId: EntityId): Promise<boolean> => {
        const token = localStorage.getItem('auth_token');
        if (!token) return false;

        try {
            const response = await axios.get(`${API_URL}/api/favorites/check/${listingId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data.isFavorited;
        } catch (error) {
            console.error('Lỗi khi kiểm tra yêu thích:', error);
            return false;
        }
    };

    const toggleFavorite = async (listingId: EntityId): Promise<boolean> => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            throw new Error('Vui lòng đăng nhập để lưu tin đăng');
        }

        const isFavorited = await checkIsFavorited(listingId);

        try {
            if (isFavorited) {
                await axios.delete(`${API_URL}/api/favorites/${listingId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else {
                await axios.post(
                    `${API_URL}/api/favorites/${listingId}`,
                    {},
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }

            await loadFavorites();
            return !isFavorited;
        } catch (error) {
            console.error('Lỗi khi thao tác yêu thích:', error);
            throw error;
        }
    };

    const removeFavorite = async (listingId: EntityId): Promise<void> => {
        const token = localStorage.getItem('auth_token');
        if (!token) return;

        try {
            await axios.delete(`${API_URL}/api/favorites/${listingId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            await loadFavorites();
        } catch (error) {
            console.error('Lỗi khi xóa yêu thích:', error);
            throw error;
        }
    };

    useEffect(() => {
        loadFavorites();

        const handleAuthChanged = () => loadFavorites();
        window.addEventListener('authChanged', handleAuthChanged);

        return () => window.removeEventListener('authChanged', handleAuthChanged);
    }, []);

    return (
        <FavoritesContext.Provider
            value={{
                favoritesList,
                favoritesCount,
                loadFavorites,
                checkIsFavorited,
                toggleFavorite,
                removeFavorite,
            }}
        >
            {children}
        </FavoritesContext.Provider>
    );
};
