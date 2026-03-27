/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useLocation, Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Breadcrumb from '../components/Breadcrumb';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faAngleDown,
    faArrowsRotate,
    faFilter,
    faHouse,
    faMapLocation,
    faMapPin,
} from '@fortawesome/free-solid-svg-icons';
import { useSearchFormState } from '../hooks/useSearchFormState';
import Filter from '../components/Filter';
import { motion, AnimatePresence } from 'framer-motion';
import ListingCard from '../components/ListingCard';

const RentalListPage = () => {
    const location = useLocation();
    const [title, setTitle] = useState('');
    const [toggleFilter, setToggleFilter] = useState(false);
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [typeSlug, setTypeSlug] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchTimeout, setSearchTimeout] = useState(null);
    const [searchParams] = useSearchParams();

    const [selectedLocation, setSelectedLocation] = useState('');
    const [selectedPrice, setSelectedPrice] = useState('');
    const [selectedArea, setSelectedArea] = useState('');
    const [searchAddress, setSearchAddress] = useState('');
    const [locations, setLocations] = useState([]);
    const [selectedAmenities, setSelectedAmenities] = useState([]);
    const [selectedSurroundings, setSelectedSurroundings] = useState([]);
    const [hasVideo, setHasVideo] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5175';

    const {
        locationDropdown,
        toggleLocationDropdown,
        priceDropdown,
        togglePriceDropdown,
        setPriceDropdown,
        setAreaDropdown,
        areaDropdown,
        toggleAreaDropdown,
        typeLocation,
        setTypeLocation,
        setLocationDropdown,
        openRange,
        setOpenRange,
        locationDropdownRef,
        priceDropdownRef,
        areaDropdownRef,
        locationButtonRef,
        priceButtonRef,
        areaButtonRef,
        typeRentalButtonRef,
        typeRentalDropdown,
        typeRentalDropdownRef,
        setTypeRentalDropdown,
        toggleTypeRentalDropdown,
    } = useSearchFormState();

    const getImageUrl = imagePath => {
        if (!imagePath) return '/default-image.jpg';
        if (imagePath.startsWith('http')) return imagePath;
        return `${API_URL}${imagePath}`;
    };

    const getShortTypeName = () => {
        if (location.pathname.includes('rental-rooms')) {
            return 'Nhà trọ, phòng trọ';
        } else if (location.pathname.includes('whole-houses')) {
            return 'Nhà nguyên căn';
        } else if (location.pathname.includes('apartments')) {
            return 'Căn hộ';
        } else if (location.pathname.includes('/all')) {
            return 'Tất cả';
        }
        return 'Tất cả';
    };

    useEffect(() => {
        const locationParam = searchParams.get('location');
        const priceParam = searchParams.get('price');
        const areaParam = searchParams.get('area');

        if (locationParam) setSelectedLocation(locationParam);
        if (priceParam) setSelectedPrice(priceParam);
        if (areaParam) setSelectedArea(areaParam);
    }, [searchParams]);

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/locations`);
                if (response.data.success) {
                    setLocations(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching locations:', error);
            }
        };
        fetchLocations();
    }, [API_URL]);

    useEffect(() => {
        if (location.pathname.includes('rental-rooms')) {
            setTitle('CHO THUÊ NHÀ TRỌ, PHÒNG TRỌ GIÁ RẺ, MỚI NHẤT');
            setTypeSlug('nha-tro-phong-tro');
        } else if (location.pathname.includes('whole-houses')) {
            setTitle('CHO THUÊ NHÀ NGUYÊN CĂN GIÁ RẺ, MỚI NHẤT');
            setTypeSlug('nha-nguyen-can');
        } else if (location.pathname.includes('apartments')) {
            setTitle('CHO THUÊ CĂN HỘ GIÁ RẺ, MỚI NHẤT');
            setTypeSlug('can-ho');
        } else if (location.pathname.includes('/all')) {
            setTitle(
                'Cho thuê nhà trọ, phòng trọ, nhà nguyên căn, căn hộ ở Hà Nội giá rẻ, mới nhất'
            );
            setTypeSlug('');
        }
    }, [location.pathname]);

    const getPriceRange = priceStr => {
        const priceMap = {
            'Tất cả mức giá': { min: null, max: null },
            'Dưới 1 triệu': { min: null, max: 1000000 },
            '1 - 10 triệu': { min: 1000000, max: 10000000 },
            '10 - 30 triệu': { min: 10000000, max: 30000000 },
            '30 - 50 triệu': { min: 30000000, max: 50000000 },
            'Trên 50 triệu': { min: 50000000, max: null },
            'Trên 100 triệu': { min: 100000000, max: null },
        };
        return priceMap[priceStr] || { min: null, max: null };
    };

    const getAreaRange = areaStr => {
        const areaMap = {
            'Tất cả diện tích': { min: null, max: null },
            'Dưới 20m²': { min: null, max: 20 },
            '20 - 30m²': { min: 20, max: 30 },
            '30 - 50m²': { min: 30, max: 50 },
            '50 - 70m²': { min: 50, max: 70 },
            '70 - 90m²': { min: 70, max: 90 },
            'Trên 90m²': { min: 90, max: null },
        };
        return areaMap[areaStr] || { min: null, max: null };
    };

    const fetchListings = async () => {
        try {
            setLoading(true);
            const params = {
                limit: 50,
                sort_by: sortBy,
            };

            if (typeSlug) {
                params.type_slug = typeSlug;
            }

            if (selectedPrice) {
                const priceRange = getPriceRange(selectedPrice);
                if (priceRange.min !== null) params.min_price = priceRange.min;
                if (priceRange.max !== null) params.max_price = priceRange.max;
            }

            if (selectedArea) {
                const areaRange = getAreaRange(selectedArea);
                if (areaRange.min !== null) params.min_area = areaRange.min;
                if (areaRange.max !== null) params.max_area = areaRange.max;
            }

            if (selectedLocation) {
                params.location_id = selectedLocation;
            }

            if (selectedAmenities.length > 0) {
                params.amenities = JSON.stringify(selectedAmenities);
            }

            if (selectedSurroundings.length > 0) {
                params.surroundings = JSON.stringify(selectedSurroundings);
            }

            if (hasVideo) {
                params.has_video = 'true';
            }

            const response = await axios.get(`${API_URL}/api/listings/by-type`, { params });

            if (response.data.success) {
                setListings(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching listings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchListings();
    }, [
        typeSlug,
        sortBy,
        selectedPrice,
        selectedArea,
        selectedLocation,
        selectedAmenities,
        selectedSurroundings,
        hasVideo,
    ]);

    const handleSearch = () => {
        fetchListings();
        setLocationDropdown(false);
        setPriceDropdown(false);
        setAreaDropdown(false);
    };

    const handleResetFilters = () => {
        setSelectedLocation('');
        setSelectedPrice('');
        setSelectedArea('');
        setSearchAddress('');
        setSelectedAmenities([]);
        setSelectedSurroundings([]);
        setSortBy('newest');
        setHasVideo(false);
    };

    useEffect(() => {
        if (toggleFilter) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        return () => (document.body.style.overflow = 'auto');
    });

    useEffect(() => {
        const searchLocations = async () => {
            if (typeLocation === 'Address' && searchAddress.trim().length > 0) {
                setIsSearching(true);
                try {
                    const response = await axios.get(`${API_URL}/api/locations/search`, {
                        params: { q: searchAddress },
                    });

                    if (response.data.success) {
                        setSearchResults(response.data.data);
                    }
                } catch (error) {
                    console.error('Error searching locations:', error);
                    setSearchResults([]);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
            }
        };

        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        const timeout = setTimeout(() => {
            searchLocations();
        }, 300);

        setSearchTimeout(timeout);

        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
        };
    }, [searchAddress, typeLocation]);

    return (
        <div className="min-h-96">
            <div className="bg-[#0045a8] 2xl:px-48 xl:px-32 md:px-10 px-[10px] py-[10px] flex flex-wrap gap-x-2 gap-y-1 mt-[72px]">
                {/* Location Dropdown */}
                <div className="relative w-full lg:mb-0 lg:flex-2">
                    <div
                        ref={locationButtonRef}
                        onClick={toggleLocationDropdown}
                        className="p-[10px] rounded-md bg-white flex items-center gap-x-4 cursor-pointer"
                    >
                        <svg
                            version="1.1"
                            fill="#00b7ff"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512 512"
                            className="w-[20px] h-[20px]"
                        >
                            <g>
                                <path d="M172.625,102.4c-42.674,0-77.392,34.739-77.392,77.438c0,5.932,4.806,10.74,10.733,10.74c5.928,0,10.733-4.808,10.733-10.74c0-30.856,25.088-55.959,55.926-55.959c5.928,0,10.733-4.808,10.733-10.74C183.358,107.208,178.553,102.4,172.625,102.4z" />
                                <path d="M361.657,301.511c19.402-30.436,30.645-66.546,30.645-105.244C392.302,88.036,304.318,0,196.151,0c-38.676,0-74.765,11.25-105.182,30.663C66.734,46.123,46.11,66.759,30.659,91.008C11.257,121.444,0,157.568,0,196.267c0,108.217,87.998,196.266,196.151,196.266c38.676,0,74.779-11.264,105.197-30.677C325.582,346.396,346.206,325.76,361.657,301.511zM259.758,320.242c-19.075,9.842-40.708,15.403-63.607,15.403c-76.797,0-139.296-62.535-139.296-139.378c0-22.912,5.558-44.558,15.394-63.644c13.318-25.856,34.483-47.019,60.323-60.331c19.075-9.842,40.694-15.403,63.578-15.403c76.812,0,139.296,62.521,139.296,139.378c0,22.898-5.558,44.53-15.394,63.616C306.749,285.739,285.598,306.916,259.758,320.242z" />
                                <path d="M499.516,439.154L386.275,326.13c-16.119,23.552-36.771,44.202-60.309,60.345l113.241,113.024c8.329,8.334,19.246,12.501,30.148,12.501c10.916,0,21.833-4.167,30.162-12.501C516.161,482.83,516.161,455.822,499.516,439.154z" />
                            </g>
                        </svg>
                        <input
                            type="text"
                            className="w-full border-none outline-0 text-[13px] md:text-sm"
                            readOnly
                            value={
                                selectedLocation
                                    ? locations.find(l => l.id == selectedLocation)?.name
                                    : ''
                            }
                            placeholder="Bạn muốn tìm trọ ở đâu?"
                        />
                    </div>

                    {locationDropdown && (
                        <div
                            ref={locationDropdownRef}
                            className="absolute top-[120%] w-full bg-white left-0 shadow-lg rounded-md cursor-default z-50"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Tab Headers */}
                            <div className="flex items-center border-b border-b-gray-200">
                                <div
                                    className={`${
                                        typeLocation === 'Address'
                                            ? 'text-[#0045a8] border-b-2 border-b-[#0045a8]'
                                            : 'text-[#65676b] border-b-2 border-b-transparent'
                                    } flex-1 py-3 px-5 flex items-center gap-x-2 cursor-pointer`}
                                    onClick={() => setTypeLocation('Address')}
                                >
                                    <FontAwesomeIcon icon={faMapPin} className="text-[16px]" />
                                    <span className="text-sm">Tìm kiếm theo vị trí</span>
                                </div>
                                <div
                                    className={`${
                                        typeLocation === 'Range'
                                            ? 'text-[#0045a8] border-b-2 border-b-[#0045a8]'
                                            : 'text-[#65676b] border-b-2 border-b-transparent'
                                    } flex-1 py-3 px-5 flex items-center gap-x-3 cursor-pointer`}
                                    onClick={() => setTypeLocation('Range')}
                                >
                                    <FontAwesomeIcon icon={faMapLocation} className="text-[16px]" />
                                    <span className="text-sm">Chọn khu vực</span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-5">
                                {typeLocation === 'Address' ? (
                                    <div>
                                        <label className="text-[15px] font-[600] text-[#2e2a2a] block mb-2">
                                            Địa chỉ hoặc tên địa điểm
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm pr-10"
                                                placeholder="VD: Phường Hoàn Kiếm, Xã Yên Lãng..."
                                                value={searchAddress}
                                                onChange={e => setSearchAddress(e.target.value)}
                                                autoComplete="off"
                                            />

                                            {/* Loading Spinner */}
                                            {isSearching && (
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0045a8]"></div>
                                                </div>
                                            )}

                                            {/* Search Results Dropdown */}
                                            {searchAddress.trim().length > 0 && !isSearching && (
                                                <div className="absolute z-[60] w-full left-0 right-0 mt-2 border border-gray-300 bg-white rounded-md shadow-lg max-h-60 overflow-y-auto">
                                                    {searchResults.length > 0 ? (
                                                        searchResults.map(loc => (
                                                            <div
                                                                key={loc.id}
                                                                className="px-4 py-3 text-xs text-[#2e2a2a] hover:bg-[#e8f4ff] cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                                                                onClick={() => {
                                                                    setSelectedLocation(loc.id);
                                                                    setSearchAddress(loc.name);
                                                                    setSearchResults([]);
                                                                    setLocationDropdown(false);
                                                                }}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <svg
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        fill="none"
                                                                        viewBox="0 0 24 24"
                                                                        strokeWidth={1.5}
                                                                        stroke="currentColor"
                                                                        className="w-4 h-4 text-[#0045a8] flex-shrink-0"
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                                                                        />
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                                                                        />
                                                                    </svg>
                                                                    <div>
                                                                        <div className="font-medium">
                                                                            {loc.name}
                                                                        </div>
                                                                        <div className="text-xs text-gray-500">
                                                                            {loc.type === 'ward'
                                                                                ? 'Phường/Xã'
                                                                                : 'Khu vực'}{' '}
                                                                            • Hà Nội
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="px-4 py-8 text-center text-gray-500">
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth={1.5}
                                                                stroke="currentColor"
                                                                className="w-12 h-12 mx-auto mb-2 text-gray-300"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                                                                />
                                                            </svg>
                                                            <p className="text-sm font-medium">
                                                                Không tìm thấy khu vực phù hợp
                                                            </p>
                                                            <p className="text-xs mt-1">
                                                                Thử tìm kiếm với từ khóa khác
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {searchAddress.trim().length === 0 && (
                                                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                                    <span>💡</span>
                                                    <span>
                                                        Gợi ý: Nhập tên phường, xã hoặc địa điểm cụ
                                                        thể ở Hà Nội
                                                    </span>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="text-[15px] font-[600] text-[#2e2a2a] block mb-2">
                                            Chọn khu vực cụ thể
                                        </label>
                                        <div className="relative">
                                            <div
                                                onClick={() => setOpenRange(!openRange)}
                                                className="w-full cursor-pointer bg-[#f4f4f4] py-2 px-4 border mt-2 border-gray-300 rounded-md flex justify-between items-center"
                                            >
                                                <span className="text-[#2e2a2a] font-[500] text-[15px]">
                                                    {selectedLocation
                                                        ? locations.find(
                                                              l => l.id == selectedLocation
                                                          )?.name
                                                        : 'Phường/Xã...'}
                                                </span>
                                                <FontAwesomeIcon
                                                    icon={faAngleDown}
                                                    className="text-[#2e2a2a] text-[12px]"
                                                />
                                            </div>
                                            {openRange && (
                                                <div className="absolute z-50 w-full left-0 right-0 mt-2 border border-gray-300 bg-white rounded-md shadow-lg max-h-60 overflow-y-auto">
                                                    {locations.map(loc => (
                                                        <div
                                                            key={loc.id}
                                                            className="px-4 py-2 text-[15px] text-[#2e2a2a] hover:bg-[#e8f4ff] cursor-pointer"
                                                            onClick={() => {
                                                                setSelectedLocation(loc.id);
                                                                setOpenRange(false);
                                                            }}
                                                        >
                                                            {loc.name}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-5 flex items-center justify-between border-t border-t-gray-200">
                                <div
                                    className="flex items-center gap-x-2 text-[#2e2a2a] cursor-pointer"
                                    onClick={() => {
                                        setSelectedLocation('');
                                        setSearchAddress('');
                                    }}
                                >
                                    <FontAwesomeIcon icon={faArrowsRotate} className="text-sm" />
                                    <span className="text-sm font-medium">Đặt lại</span>
                                </div>
                                <div
                                    className="px-3 py-2 text-sm text-white bg-[#0045a8] rounded-sm cursor-pointer"
                                    onClick={handleSearch}
                                >
                                    Tìm ngay
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Type Rental Dropdown */}
                <div className="relative flex-1">
                    <div
                        ref={typeRentalButtonRef}
                        className="p-[10px] rounded-md bg-white flex items-center gap-x-4 cursor-pointer"
                        onClick={toggleTypeRentalDropdown}
                    >
                        <FontAwesomeIcon icon={faHouse} className="text-[20px] text-[#00b7ff]" />
                        <span className="text-[#898a8b] text-[13px] md:text-sm lg:text-[15px] whitespace-nowrap">
                            {getShortTypeName()}
                        </span>
                        <FontAwesomeIcon
                            icon={faAngleDown}
                            className="text-[#bd3535] text-sm lg:text-[15px] ml-auto"
                        />
                    </div>

                    {typeRentalDropdown && (
                        <div
                            ref={typeRentalDropdownRef}
                            className="absolute top-[120%] w-full bg-white left-0 shadow-lg rounded-md cursor-default z-50"
                            onClick={e => e.stopPropagation()}
                        >
                            <ul className="p-4 flex flex-col gap-y-2 text-sm font-500 text-[#2e2a2a]">
                                {['Tất cả', 'Nhà trọ, phòng trọ', 'Nhà nguyên căn', 'Căn hộ'].map(
                                    (type, i) => (
                                        <li
                                            key={i}
                                            className="py-2 px-1 cursor-pointer hover:bg-[#f4f4f4] rounded-md"
                                        >
                                            {type}
                                        </li>
                                    )
                                )}
                            </ul>

                            <div className="p-5 flex items-center justify-between border-t border-t-gray-200">
                                <div className="flex items-center gap-x-2 text-[#2e2a2a] cursor-pointer">
                                    <FontAwesomeIcon icon={faArrowsRotate} className="text-sm" />
                                    <span className="text-sm font-medium">Đặt lại</span>
                                </div>
                                <div className="px-3 py-2 text-sm text-white bg-[#0045a8] rounded-sm cursor-pointer">
                                    Áp dụng
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Price Dropdown */}
                <div className="relative flex-1">
                    <div
                        ref={priceButtonRef}
                        onClick={togglePriceDropdown}
                        className="p-[10px] rounded-md bg-white flex items-center gap-x-4 cursor-pointer"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            stroke="#00b7ff"
                            strokeWidth="1.91"
                            className="w-[20px] h-[20px]"
                        >
                            <g id="dolar_coin">
                                <path d="M22.5,12A10.5,10.5,0,1,1,12,1.5,10.5,10.5,0,0,1,22.5,12"></path>
                                <path d="M9.14,15.82H13a1.91,1.91,0,0,0,1.91-1.91h0A1.9,1.9,0,0,0,13,12h-1.9a1.9,1.9,0,0,1-1.91-1.91h0a1.91,1.91,0,0,1,1.91-1.91h3.81"></path>
                                <line x1="12" y1="6.27" x2="12" y2="8.18"></line>
                                <line x1="12" y1="15.82" x2="12" y2="17.73"></line>
                            </g>
                        </svg>
                        <span className="text-[#898a8b] text-[13px] md:text-sm lg:text-[15px] whitespace-nowrap">
                            {selectedPrice || 'Mức giá'}
                        </span>
                        <FontAwesomeIcon
                            icon={faAngleDown}
                            className="text-[#bd3535] text-sm lg:text-[15px] ml-auto"
                        />
                    </div>

                    {priceDropdown && (
                        <div
                            ref={priceDropdownRef}
                            className="absolute top-[120%] w-full bg-white left-0 shadow-lg rounded-md cursor-default z-50"
                            onClick={e => e.stopPropagation()}
                        >
                            <ul className="p-4 flex flex-col gap-y-2 text-sm font-500 text-[#2e2a2a]">
                                {[
                                    'Tất cả mức giá',
                                    'Dưới 1 triệu',
                                    '1 - 10 triệu',
                                    '10 - 30 triệu',
                                    '30 - 50 triệu',
                                    'Trên 50 triệu',
                                    'Trên 100 triệu',
                                ].map((price, i) => (
                                    <li
                                        key={i}
                                        className={`py-2 px-1 cursor-pointer hover:bg-[#f4f4f4] rounded-md ${
                                            selectedPrice === price ? 'bg-[#e8f4ff]' : ''
                                        }`}
                                        onClick={() => setSelectedPrice(price)}
                                    >
                                        {price}
                                    </li>
                                ))}
                            </ul>

                            <div className="p-5 flex items-center justify-between border-t border-t-gray-200">
                                <div
                                    className="flex items-center gap-x-2 text-[#2e2a2a] cursor-pointer"
                                    onClick={() => setSelectedPrice('')}
                                >
                                    <FontAwesomeIcon icon={faArrowsRotate} className="text-sm" />
                                    <span className="text-sm font-medium">Đặt lại</span>
                                </div>
                                <div
                                    className="px-3 py-2 text-sm text-white bg-[#0045a8] rounded-sm cursor-pointer"
                                    onClick={handleSearch}
                                >
                                    Tìm ngay
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div
                    className="p-[10px] rounded-md bg-[#ff5c00] w-full mt-2 lg:mt-0 lg:flex-1 flex items-center justify-center space-x-2 cursor-pointer hover:bg-orange-600 transition"
                    onClick={handleSearch}
                >
                    <svg
                        version="1.1"
                        fill="#fff"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                        className="w-[20px] h-[20px]"
                    >
                        <g>
                            <path d="M172.625,102.4c-42.674,0-77.392,34.739-77.392,77.438c0,5.932,4.806,10.74,10.733,10.74c5.928,0,10.733-4.808,10.733-10.74c0-30.856,25.088-55.959,55.926-55.959c5.928,0,10.733-4.808,10.733-10.74C183.358,107.208,178.553,102.4,172.625,102.4z" />
                            <path d="M361.657,301.511c19.402-30.436,30.645-66.546,30.645-105.244C392.302,88.036,304.318,0,196.151,0c-38.676,0-74.765,11.25-105.182,30.663C66.734,46.123,46.11,66.759,30.659,91.008C11.257,121.444,0,157.568,0,196.267c0,108.217,87.998,196.266,196.151,196.266c38.676,0,74.779-11.264,105.197-30.677C325.582,346.396,346.206,325.76,361.657,301.511zM259.758,320.242c-19.075,9.842-40.708,15.403-63.607,15.403c-76.797,0-139.296-62.535-139.296-139.378c0-22.912,5.558-44.558,15.394-63.644c13.318-25.856,34.483-47.019,60.323-60.331c19.075-9.842,40.694-15.403,63.578-15.403c76.812,0,139.296,62.521,139.296,139.378c0,22.898-5.558,44.53-15.394,63.616C306.749,285.739,285.598,306.916,259.758,320.242z" />
                            <path d="M499.516,439.154L386.275,326.13c-16.119,23.552-36.771,44.202-60.309,60.345l113.241,113.024c8.329,8.334,19.246,12.501,30.148,12.501c10.916,0,21.833-4.167,30.162-12.501C516.161,482.83,516.161,455.822,499.516,439.154z" />
                        </g>
                    </svg>
                    <span className="text-[15px] text-white font-semibold">Tìm kiếm</span>
                </div>
            </div>

            <div className="2xl:px-48 xl:px-32 md:px-10 px-[10px]">
                <div className="mt-10">
                    <Breadcrumb />
                </div>
                <h1 className="text-lg md:text-2xl font-bold text-[#2e2a2a] uppercase">{title}</h1>

                {(selectedLocation ||
                    selectedPrice ||
                    selectedArea ||
                    selectedAmenities.length > 0 ||
                    selectedSurroundings.length > 0 ||
                    hasVideo) && (
                    <div className="flex flex-wrap gap-2 mt-4">
                        {selectedLocation && (
                            <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2">
                                <span>{locations.find(l => l.id == selectedLocation)?.name}</span>
                                <button
                                    onClick={() => setSelectedLocation('')}
                                    className="hover:text-blue-900"
                                >
                                    ×
                                </button>
                            </div>
                        )}
                        {selectedPrice && (
                            <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2">
                                <span>{selectedPrice}</span>
                                <button
                                    onClick={() => setSelectedPrice('')}
                                    className="hover:text-blue-900"
                                >
                                    ×
                                </button>
                            </div>
                        )}
                        {selectedArea && (
                            <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2">
                                <span>{selectedArea}</span>
                                <button
                                    onClick={() => setSelectedArea('')}
                                    className="hover:text-blue-900"
                                >
                                    ×
                                </button>
                            </div>
                        )}
                        {selectedAmenities.map((amenity, i) => (
                            <div
                                key={i}
                                className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-2"
                            >
                                <span>{amenity}</span>
                                <button
                                    onClick={() =>
                                        setSelectedAmenities(prev =>
                                            prev.filter(a => a !== amenity)
                                        )
                                    }
                                    className="hover:text-green-900"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                        {selectedSurroundings.map((surrounding, i) => (
                            <div
                                key={i}
                                className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center gap-2"
                            >
                                <span>{surrounding}</span>
                                <button
                                    onClick={() =>
                                        setSelectedSurroundings(prev =>
                                            prev.filter(s => s !== surrounding)
                                        )
                                    }
                                    className="hover:text-purple-900"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={handleResetFilters}
                            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
                        >
                            Xóa tất cả bộ lọc
                        </button>
                    </div>
                )}

                <div className="flex mt-6 gap-x-2">
                    <div className="flex-4 p-5 shadow-[0_0_10px_rgba(0,0,0,0.1)] rounded-md">
                        <div className="flex lg:flex-row flex-col lg:justify-between lg:items-center mb-4">
                            <p className="sm:block hidden text-lg font-semibold text-[#2e2a2a]">
                                {loading ? 'Đang tải...' : `Tổng ${listings.length} kết quả`}
                            </p>
                            <div className="flex justify-between flex-wrap gap-y-4">
                                <div className="flex items-center gap-x-2">
                                    <p className="text-[16px] font-semibold text-[#2e2a2a]">
                                        Sắp xếp theo
                                    </p>
                                    <select
                                        value={sortBy}
                                        onChange={e => setSortBy(e.target.value)}
                                        className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                                    >
                                        <option value="newest">Mới nhất</option>
                                        <option value="price_asc">Giá tăng dần</option>
                                        <option value="price_desc">Giá giảm dần</option>
                                    </select>
                                </div>
                                <button
                                    className="lg:hidden cursor-pointer flex items-center gap-x-2 text-sm w-fit text-[#2e2a2a] px-[13px] h-[38px] py-[11px] bg-[#f8f8f8] border border-gray-300 rounded-md"
                                    onClick={() => setToggleFilter(true)}
                                >
                                    <FontAwesomeIcon icon={faFilter} />
                                    <span className="font-[500]">Lọc tìm kiếm</span>
                                </button>
                            </div>
                        </div>

                        {/* Loading State */}
                        {loading ? (
                            <div className="grid 2xl:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4">
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className="animate-pulse">
                                        <div className="bg-gray-200 aspect-[4/3] rounded-md mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                        <div className="flex gap-2">
                                            <div className="h-6 bg-gray-200 rounded flex-1"></div>
                                            <div className="h-6 bg-gray-200 rounded flex-1"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : listings.length > 0 ? (
                            <div className="grid 2xl:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4">
                                {listings.map(listing => (
                                    <ListingCard key={listing.id} listing={listing} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-16 w-16 mx-auto text-gray-300 mb-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                    />
                                </svg>
                                <h4 className="text-lg font-semibold text-gray-600 mb-2">
                                    Chưa có tin đăng
                                </h4>
                                <p className="text-sm text-gray-400">
                                    Không tìm thấy kết quả phù hợp với bộ lọc của bạn
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="lg:flex-1 lg:block hidden">
                        <Filter
                            isDesktop
                            selectedPrice={selectedPrice}
                            setSelectedPrice={setSelectedPrice}
                            selectedArea={selectedArea}
                            setSelectedArea={setSelectedArea}
                            onApply={fetchListings}
                            selectedAmenities={selectedAmenities}
                            setSelectedAmenities={setSelectedAmenities}
                            selectedSurroundings={selectedSurroundings}
                            setSelectedSurroundings={setSelectedSurroundings}
                            hasVideo={hasVideo}
                            setHasVideo={setHasVideo}
                        />
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {toggleFilter && (
                    <motion.div
                        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center"
                        onClick={() => setToggleFilter(false)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Filter
                            toggleFilter={setToggleFilter}
                            selectedArea={selectedArea}
                            setSelectedArea={setSelectedArea}
                            selectedAmenities={selectedAmenities}
                            setSelectedAmenities={setSelectedAmenities}
                            selectedSurroundings={selectedSurroundings}
                            setSelectedSurroundings={setSelectedSurroundings}
                            onApply={fetchListings}
                            hasVideo={hasVideo}
                            setHasVideo={setHasVideo}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RentalListPage;
