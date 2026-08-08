import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from '@/lib/navigation/router-compat';
import Banner from '@/features/home/components/Banner';
import SearchForm from '@/features/listings/components/SearchForm';
import Slider from '@/features/home/components/Slider';
import RentalListing from '@/features/listings/components/RentalListing';
import DiscoverRentalRoom from '@/features/home/components/DiscoverRentalRoom';
import {
    banner_ohdidi,
    badinh_img,
    dongda_img,
    tayho_img,
    thanhxuan_img,
    tuliem_img,
    longbien_img,
    banner_user,
} from '@/assets/assets';
import type { EntityId, ListingLocation, VideoListing } from '@/types';

interface HomeListings {
    hot: VideoListing[];
    'nha-tro-phong-tro': VideoListing[];
    'nha-nguyen-can': VideoListing[];
    'can-ho': VideoListing[];
}

const Home = () => {
    const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5175');
    const navigate = useNavigate();

    const [listings, setListings] = useState<HomeListings>({
        hot: [],
        'nha-tro-phong-tro': [],
        'nha-nguyen-can': [],
        'can-ho': [],
    });
    const [loading, setLoading] = useState(true);
    const [locationStats, setLocationStats] = useState<ListingLocation[]>([]);

    const wards = [
        { name: 'Long Biên', image: longbien_img },
        { name: 'Thanh Xuân', image: thanhxuan_img },
        { name: 'Đống Đa', image: dongda_img },
        { name: 'Tây Hồ', image: tayho_img },
        { name: 'Từ Liêm', image: tuliem_img },
        { name: 'Ba Đình', image: badinh_img },
    ];


    useEffect(() => {
        fetchHomeData();
    }, []);

    const fetchHomeData = async () => {
        try {
            setLoading(true);

            const [homeResponse, hotResponse, locationStatsResponse] = await Promise.all([
                axios.get(`${API_URL}/api/listings/home`),
                axios.get(`${API_URL}/api/listings/hot?limit=10`),
                axios.get(`${API_URL}/api/listings/location-stats?limit=12`),
            ]);

            if (homeResponse.data.success) {
                setListings(prev => ({
                    ...prev,
                    ...homeResponse.data.data,
                }));
            }

            if (hotResponse.data.success) {
                setListings(prev => ({
                    ...prev,
                    hot: hotResponse.data.data,
                }));
            }

            if (locationStatsResponse.data.success) {
                setLocationStats(locationStatsResponse.data.data);
            }
        } catch (error) {
            console.error('Error fetching home data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLocationClick = (locationId: EntityId): void => {
        navigate(`/all?location=${locationId}`);
    };

    return (
        <div>
            <div className="relative mt-[72px]">
                <Banner />
            </div>

            <div className="relative -top-24 sm:-top-20 md:-top-24 lg:-top-16 2xl:px-48 2xl:pr-96 xl:px-32 md:px-10 px-[10px]">
                <SearchForm />
            </div>

            <div className="2xl:px-48 xl:px-32 md:px-10 px-[10px] -mt-6 sm:mt-0">
                <Slider />
            </div>

            <div className="2xl:px-48 xl:px-32 md:px-10 px-[10px]">
                <RentalListing
                    title="Lựa chọn chỗ ở HOT"
                    listings={listings.hot}
                    viewAllLink="/all"
                    loading={loading}
                />
            </div>

            <div className="my-10">
                <DiscoverRentalRoom />
            </div>

            <div className="2xl:px-48 xl:px-32 md:px-10 px-[10px]">
                <RentalListing
                    title="Nhà nguyên căn cho thuê"
                    listings={listings['nha-nguyen-can']}
                    viewAllLink="/whole-houses"
                    loading={loading}
                />
            </div>

            <div className="2xl:px-48 xl:px-32 md:px-10 px-[10px] mt-5">
                <div className="relative w-full xl:aspect-[5/1] sm:aspect-[3/1] aspect-[2/1] group overflow-hidden rounded-lg">
                    <img
                        src={banner_ohdidi}
                        alt="banner-ohdidi"
                        className="w-full h-full rounded-lg"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </div>
            </div>

            <div className="2xl:px-48 xl:px-32 md:px-10 px-[10px] mt-10">
                <RentalListing
                    title="Căn hộ cho thuê"
                    listings={listings['can-ho']}
                    viewAllLink="/apartments"
                    loading={loading}
                />
            </div>

            <div className="2xl:px-48 xl:px-32 md:px-10 px-[10px] mt-10">
                <RentalListing
                    title="Nhà trọ, phòng trọ cho thuê"
                    listings={listings['nha-tro-phong-tro']}
                    viewAllLink="/rental-rooms"
                    loading={loading}
                />
            </div>

            <div className="2xl:px-48 xl:px-32 md:px-10 px-[10px] mt-10">
                <h3 className="text-[#0045a8] md:text-2xl font-bold uppercase text-[18px] text-center mb-8">
                    Các địa điểm nổi bật
                </h3>
                <div className="grid lg:grid-cols-6 md:grid-cols-3 grid-cols-2 gap-4">
                    {wards.map((ward, index) => (
                        <div
                            key={index}
                            className="flex flex-col bg-white shadow-lg rounded-lg cursor-pointer hover:shadow-xl group"
                        >
                            <div className="flex-2 aspect-square">
                                <img
                                    src={ward.image}
                                    alt={ward.name}
                                    className="w-full h-full rounded-tl-lg rounded-tr-lg object-cover"
                                />
                            </div>
                            <p className="px-2 py-4 text-[#2e2a2a] md:text-lg text-sm font-bold group-hover:text-[#00b7ff] transition-all duration-300 whitespace-nowrap">
                                {ward.name}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="2xl:px-48 xl:px-32 md:px-10 px-[10px] mt-10">
                <div className="px-2 py-5 sm:p-5 shadow-md rounded-md">
                    <h3 className="text-[#0045a8] md:text-2xl font-bold uppercase text-[18px] mb-2">
                        Khám phá thêm Trọ Mới ở các địa điểm khác
                    </h3>
                    <p className="text-[#898a8b] text-sm mb-6">
                        Dưới đây là tổng hợp các tỉnh thành có nhiều trọ mới và được quan tâm nhất
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                        {locationStats.length > 0 ? (
                            locationStats.map((location: ListingLocation) => (
                                <div
                                    key={location.id}
                                    className="cursor-pointer hover:text-[#0045a8] transition-colors"
                                    onClick={() => handleLocationClick(location.id)}
                                >
                                    <p className="text-[#2e2a2a] text-[13px] lg:text-[15px] font-[500]">
                                        {location.name}
                                    </p>
                                    <p className="text-[#595959] text-[13px]">{location.room_count} phòng trọ</p>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center text-gray-500">
                                {loading ? 'Đang tải...' : 'Không có dữ liệu'}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="2xl:px-48 xl:px-32 md:px-10 px-[10px] mt-5 sm:mt-10">
                <div className="w-full lg:aspect-[7/2] aspect-[7/3]">
                    <img
                        src={banner_user}
                        alt="banner-user"
                        className="rounded-lg w-full h-full object-center object-cover"
                    />
                </div>
            </div>
        </div>
    );
};

export default Home;
