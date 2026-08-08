import React from 'react';
import { useNavigate } from '@/lib/navigation/router-compat';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faAngleDown,
    faArrowsRotate,
    faMapLocation,
    faMapPin,
} from '@fortawesome/free-solid-svg-icons';
import { useEffect } from 'react';
import axios from 'axios';

import { useSearchFormState } from '@/hooks/useSearchFormState';
import type { ListingLocation } from '@/types';

const SearchForm = () => {
    const navigate = useNavigate();
    const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5175') || 'http://localhost:5175';

    const {
        type,
        setType,
        locationDropdown,
        toggleLocationDropdown,
        priceDropdown,
        togglePriceDropdown,
        areaDropdown,
        toggleAreaDropdown,
        typeLocation,
        setTypeLocation,
        openRange,
        setOpenRange,
        locationDropdownRef,
        priceDropdownRef,
        areaDropdownRef,
        locationButtonRef,
        priceButtonRef,
        areaButtonRef,
    } = useSearchFormState();

    const [selectedLocation, setSelectedLocation] = React.useState('');
    const [selectedPrice, setSelectedPrice] = React.useState('');
    const [selectedArea, setSelectedArea] = React.useState('');
    const [searchAddress, setSearchAddress] = React.useState('');
    const [locations, setLocations] = React.useState<ListingLocation[]>([]);
    const [searchResults, setSearchResults] = React.useState<ListingLocation[]>([]);
    const [isSearching, setIsSearching] = React.useState(false);

    const typeToSlugMap: Record<string, string> = {
        All: 'all',
        Rental: 'rental-rooms',
        EntireHouse: 'whole-houses',
        Apartment: 'apartments',
    };

    const handleSearch = () => {
        const params = new URLSearchParams();

        if (selectedLocation) {
            params.append('location', selectedLocation);
        }

        if (selectedPrice) {
            params.append('price', selectedPrice);
        }

        if (selectedArea) {
            params.append('area', selectedArea);
        }

        const slug = typeToSlugMap[type] || 'all';

        const searchQuery = params.toString();
        const path = searchQuery ? `/${slug}?${searchQuery}` : `/${slug}`;

        navigate(path);

        if (locationDropdown) toggleLocationDropdown();
        if (priceDropdown) togglePriceDropdown();
        if (areaDropdown) toggleAreaDropdown();
    };

    const handleReset = (dropdownType: 'location' | 'price' | 'area'): void => {
        switch (dropdownType) {
            case 'location':
                setSelectedLocation('');
                setSearchAddress('');
                break;
            case 'price':
                setSelectedPrice('');
                break;
            case 'area':
                setSelectedArea('');
                break;
            default:
                break;
        }
    };

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

        const timeout = setTimeout(() => {
            searchLocations();
        }, 300);

        return () => clearTimeout(timeout);
    }, [searchAddress, typeLocation, API_URL]);

    return (
        <div className="w-full">
            {/* Type Tabs */}
            <ul className="flex w-full gap-x-[2px]">
                {[
                    { key: 'All', label: 'Tất cả' },
                    { key: 'Rental', label: 'Nhà trọ, phòng trọ' },
                    { key: 'EntireHouse', label: 'Nhà nguyên căn' },
                    { key: 'Apartment', label: 'Căn hộ' },
                ].map(item => (
                    <li
                        key={item.key}
                        onClick={() => setType(item.key)}
                        className={`cursor-pointer text-[12px] md:text-sm whitespace-nowrap lg:text-[15px] text-center px-2 lg:px-10 py-[10px] flex-1 lg:flex-none rounded-t-xl font-[600] ${
                            type === item.key
                                ? 'bg-[#0045a8] text-white'
                                : 'bg-[#e6ecf6] text-[#0045a8]'
                        }`}
                    >
                        {item.label}
                    </li>
                ))}
            </ul>

            <div className="bg-[#0045a8] p-5 rounded-bl-xl rounded-br-xl lg:rounded-tr-xl flex flex-wrap gap-x-2">
                {/* Location Dropdown */}
                <div className="relative w-full mb-2 lg:mb-0 lg:flex-2">
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
                                    ? locations.find(l => l.id == selectedLocation)?.name || ''
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
                                            {isSearching && (
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0045a8]"></div>
                                                </div>
                                            )}
                                            {searchAddress.trim().length > 0 && !isSearching && (
                                                <div className="absolute z-[60] w-full left-0 right-0 mt-2 border border-gray-300 bg-white rounded-md shadow-lg max-h-60 overflow-y-auto">
                                                    {searchResults.length > 0 ? (
                                                        searchResults.map(loc => (
                                                            <div
                                                                key={loc.id}
                                                                className="px-4 py-3 text-xs text-[#2e2a2a] hover:bg-[#e8f4ff] cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                                                                onClick={() => {
                                                                    setSelectedLocation(String(loc.id));
                                                                    setSearchAddress(loc.name);
                                                                    setSearchResults([]);
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
                                                                setSelectedLocation(String(loc.id));
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
                                    onClick={() => handleReset('location')}
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
                        <span className="text-[#898a8b] text-[13px] md:text-sm lg:text-[15px]">
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
                                    onClick={() => handleReset('price')}
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

                {/* Area Dropdown */}
                <div className="relative flex-1">
                    <div
                        ref={areaButtonRef}
                        className="p-[10px] rounded-md bg-white flex items-center gap-x-4 cursor-pointer"
                        onClick={toggleAreaDropdown}
                    >
                        <svg
                            fill="#00b7ff"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-[20px] h-[20px]"
                        >
                            <path d="M20 17h-16c-.552 0-1-.447-1-1v-3c0-.68.234-1.346.658-1.874l4-5c.98-1.226,2.885-1.469,4.143-.524l1.674 1.254 2.185-2.729c.57-.717 1.424-1.127 2.341-1.127.679 0 1.343.232 1.873.657.716.572 1.126 1.426 1.126 2.343v10c0 .553-.448 1-1 1zm-15-2h14v-9c0-.307-.137-.59-.375-.779-.227-.183-.465-.221-.624-.221-.306 0-.591.137-.782.376l-2.789 3.485c-.337.423-.949.5-1.381.176l-2.449-1.837c-.422-.316-1.055-.233-1.381.176l-4 5c-.181.228-.219.464-.219.624v2zM20,21h-16c-.552,0-1-.447-1-1s.448-1,1-1h16c.552,0,1,.447,1,1s-.448,1-1,1z" />
                        </svg>
                        <span className="text-[#898a8b] text-[13px] md:text-sm lg:text-[15px]">
                            {selectedArea || 'Diện tích'}
                        </span>
                        <FontAwesomeIcon
                            icon={faAngleDown}
                            className="text-[#bd3535] text-sm lg:text-[15px] ml-auto"
                        />
                    </div>

                    {areaDropdown && (
                        <div
                            ref={areaDropdownRef}
                            className="absolute top-[120%] w-full bg-white left-0 shadow-lg rounded-md cursor-default z-50"
                            onClick={e => e.stopPropagation()}
                        >
                            <ul className="p-4 flex flex-col gap-y-2 text-sm font-500 text-[#2e2a2a]">
                                {[
                                    'Tất cả diện tích',
                                    'Dưới 20m²',
                                    '20 - 30m²',
                                    '30 - 50m²',
                                    '50 - 70m²',
                                    '70 - 90m²',
                                    'Trên 90m²',
                                ].map((area, i) => (
                                    <li
                                        key={i}
                                        className={`py-2 px-1 cursor-pointer hover:bg-[#f4f4f4] rounded-md ${
                                            selectedArea === area ? 'bg-[#e8f4ff]' : ''
                                        }`}
                                        onClick={() => setSelectedArea(area)}
                                    >
                                        {area}
                                    </li>
                                ))}
                            </ul>

                            <div className="p-5 flex items-center justify-between border-t border-t-gray-200">
                                <div
                                    className="flex items-center gap-x-2 text-[#2e2a2a] cursor-pointer"
                                    onClick={() => handleReset('area')}
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

                {/* Search Button */}
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
        </div>
    );
};

export default SearchForm;
