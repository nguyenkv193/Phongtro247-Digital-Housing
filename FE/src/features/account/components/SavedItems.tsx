import type { SyntheticEvent } from 'react';
import { useFavorites } from '@/providers/FavoritesContext';
import { Link } from '@/lib/navigation/router-compat';
import type { EntityId } from '@/types';

const SavedItems = () => {
    const { favoritesList, favoritesCount, removeFavorite } = useFavorites();
    const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') || 'http://localhost:5000';

    const handleRemoveFavorite = async (e: React.MouseEvent<HTMLButtonElement>, listingId: EntityId) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            await removeFavorite(listingId);
        } catch (error) {
            console.error('Lỗi khi bỏ lưu tin:', error);
            alert('Đã xảy ra lỗi, không thể bỏ lưu tin này.');
        }
    };

    return (
        <div className="p-6 flex flex-col h-full">
            <h2 className="text-lg font-semibold text-[#2e2a2a] uppercase mb-4 flex-shrink-0">
                Lưu trữ ({favoritesCount})
            </h2>

            {favoritesCount > 0 ? (
                <div className="flex-grow overflow-y-auto pr-2 -mr-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {favoritesList.map(item => (
                            <div
                                key={item.id}
                                className="border border-gray-200 rounded-lg overflow-hidden group transition-shadow hover:shadow-md relative"
                            >
                                <Link to={`/listing/${item.id}`} className="block">
                                    <div className="aspect-[4/3] overflow-hidden">
                                        <img
                                            src={
                                                item.image
                                                    ? `${API_URL}${item.image}`
                                                    : 'https://placehold.co/400x300'
                                            }
                                            alt={item.name}
                                            className="w-full h-full object-cover transition-transform duration-300"
                                            onError={(e: SyntheticEvent<HTMLImageElement>) => {
                                                e.currentTarget.src = 'https://placehold.co/400x300';
                                            }}
                                        />
                                    </div>
                                    <div className="p-3">
                                        <h4
                                            className="font-semibold text-sm text-[#2e2a2a] line-clamp-2 mb-2 h-10"
                                            title={item.name}
                                        >
                                            {item.name}
                                        </h4>
                                        <p className="text-[#ff5c00] text-base font-semibold mb-2">
                                            {`${(Number(item.price || 0) / 1000000).toLocaleString(
                                                'vi-VN'
                                            )} triệu/tháng`}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-gray-600">
                                            <span className="bg-gray-100 px-2 py-1 rounded">
                                                {item.listing_type}
                                            </span>
                                            <span>{item.area} m²</span>
                                        </div>
                                    </div>
                                </Link>

                                <button
                                    onClick={e => handleRemoveFavorite(e, item.id)}
                                    className="absolute top-2 right-2 z-10 w-8 h-8 flex items-center justify-center bg-gray-50 bg-opacity-40 rounded-full text-black/60  cursor-pointer"
                                    title="Bỏ lưu"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                        className="w-5 h-5"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                        />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="w-12 h-12 text-gray-400"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Chưa có mục nào được lưu
                    </h3>
                    <p className="text-gray-500 mb-6">
                        Bạn chưa lưu bất kỳ mục nào trong hệ thống.
                    </p>
                    <Link
                        to="/all"
                        className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                        Khám phá ngay
                    </Link>
                </div>
            )}
        </div>
    );
};

export default SavedItems;
