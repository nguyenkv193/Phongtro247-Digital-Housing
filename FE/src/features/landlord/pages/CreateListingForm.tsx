import { faArrowLeft, faCloudArrowUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import axios from 'axios';
import type { ListingLocation, User } from '@/types';

interface ListingFormData {
    name: string;
    roomCount: string;
    area: string;
    locationId: string;
    street: string;
    address: string;
    price: string;
    amenities: string[];
    surroundings: string[];
    description: string;
    rules: string;
    images: File[];
}

type TextField = Exclude<keyof ListingFormData, 'amenities' | 'surroundings' | 'images'>;

interface CreateListingFormProps {
    type: string;
    onBack: () => void;
}

interface MasterDataOption {
    name: string;
    status: boolean;
}

const CreateListingForm = ({ type, onBack }: CreateListingFormProps) => {
    const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');
    const [locations, setLocations] = useState<ListingLocation[]>([]);
    const [amenitiesList, setAmenitiesList] = useState<string[]>([]);
    const [surroundingsList, setSurroundingsList] = useState<string[]>([]);

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
        const fetchMasterData = async () => {
            try {
                const [amenitiesResponse, surroundingsResponse] = await Promise.all([
                    axios.get<{ data: MasterDataOption[] }>(`${API_URL}/api/master-data/AMENITY`),
                    axios.get<{ data: MasterDataOption[] }>(`${API_URL}/api/master-data/SURROUNDING`),
                ]);
                setAmenitiesList(amenitiesResponse.data.data.filter(item => item.status).map(item => item.name));
                setSurroundingsList(surroundingsResponse.data.data.filter(item => item.status).map(item => item.name));
            } catch (error) {
                console.error('Error fetching master data:', error);
            }
        };
        void fetchMasterData();
    }, [API_URL]);

    const [formData, setFormData] = useState<ListingFormData>({
        name: '',
        roomCount: '',
        area: '',
        locationId: '',
        street: '',
        address: '',
        price: '',
        amenities: [],
        surroundings: [],
        description: '',
        rules: '',
        images: [],
    });

    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [previewImages, setPreviewImages] = useState<string[]>([]);

    useEffect(() => {
        const raw = localStorage.getItem('auth_user');
        if (raw) {
            try {
                setCurrentUser(JSON.parse(raw));
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }
    }, []);

    const handleInputChange = (
        e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ): void => {
        const { id, value } = e.target;
        const field = id as TextField;

        if (id === 'price') {
            console.log('💰 Price input changed:', value);
            console.log('💰 Type:', typeof value);
        }

        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleCheckboxChange = (field: 'amenities' | 'surroundings', value: string): void => {
        setFormData(prev => {
            const exists = prev[field].includes(value);
            return {
                ...prev,
                [field]: exists ? prev[field].filter(v => v !== value) : [...prev[field], value],
            };
        });
    };

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const files = Array.from(e.target.files || []);
        const previews = files.map(file => URL.createObjectURL(file));
        setPreviewImages(prev => [...prev, ...previews]);

        setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...files],
        }));
    };

    const removeImage = (index: number): void => {
        setPreviewImages(prev => prev.filter((_, i) => i !== index));
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();

        if (!formData.name || !formData.price || !formData.area) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
            return;
        }

        const token = localStorage.getItem('auth_token');

        if (!token) {
            alert('Vui lòng đăng nhập để đăng tin!');
            return;
        }

        setLoading(true);

        try {
            console.log('🔍 FormData before sending:');
            console.log('Price value:', formData.price);
            console.log('Price type:', typeof formData.price);

            const formDataToSend = new FormData();

            formDataToSend.append('listingType', type);
            formDataToSend.append('name', formData.name);
            formDataToSend.append('roomCount', formData.roomCount || '1');
            formDataToSend.append('area', formData.area);
            formDataToSend.append('locationId', formData.locationId || '');
            formDataToSend.append('street', formData.street);
            formDataToSend.append('address', formData.address);
            formDataToSend.append('price', formData.price);

            console.log('Price appended to FormData:', formData.price);
            formDataToSend.append('amenities', JSON.stringify(formData.amenities));
            formDataToSend.append('surroundings', JSON.stringify(formData.surroundings));
            formDataToSend.append('description', formData.description);
            formDataToSend.append('rules', formData.rules);

            formData.images.forEach(image => {
                formDataToSend.append('images', image);
            });

            const response = await axios.post(`${API_URL}/api/listings/create`, formDataToSend, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                alert(response.data.message || 'Đăng tin thành công!');
                setFormData({
                    name: '',
                    roomCount: '',
                    area: '',
                     locationId: '',
                    street: '',
                    address: '',
                    price: '',
                    amenities: [],
                    surroundings: [],
                    description: '',
                    rules: '',
                    images: [],
                });
                setPreviewImages([]);
                window.dispatchEvent(new Event('authChanged'));
                onBack();
            }
        } catch (error: unknown) {
            console.error('Error creating listing:', error);
            const message = axios.isAxiosError<{ message?: string }>(error)
                ? error.response?.data?.message
                : undefined;
            alert(message || 'Có lỗi xảy ra khi đăng tin!');
        } finally {
            setLoading(false);
        }
    };

    const getTitleByType = () => {
        switch (type) {
            case 'Nhà trọ, phòng trọ':
                return 'Thông tin nhà trọ, phòng trọ';
            case 'Ký túc xá':
                return 'Thông tin ký túc xá';
            case 'Nhà nguyên căn':
                return 'Thông tin nhà nguyên căn';
            case 'Căn hộ':
                return 'Thông tin căn hộ';
            default:
                return 'Thông tin cho thuê';
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#f5f7fa]">
            <div className="bg-white shadow-sm rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                    <button
                        onClick={onBack}
                        className="text-gray-500 hover:text-[#1976d2] flex items-center gap-x-[4px] cursor-pointer"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
                        <span className="text-[14px]">Quay lại</span>
                    </button>
                </div>

                <form className="space-y-8" onSubmit={handleSubmit}>
                    {/* THÔNG TIN */}
                    <div>
                        <h3 className="text-lg font-semibold mb-6">{getTitleByType()}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label htmlFor="name" className="text-sm mb-2 inline-block">
                                    Tên <span className="lowercase">{type}</span>{' '}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder={`Tên ${type.toLowerCase()}`}
                                    className="border border-gray-300 p-2 rounded-lg w-full text-sm outline-0"
                                    required
                                />
                            </div>
                            <div className="col-span-2 md:col-span-1">
                                <label htmlFor="roomCount" className="text-sm mb-2 inline-block">
                                    Số lượng phòng
                                </label>
                                <input
                                    id="roomCount"
                                    type="number"
                                    value={formData.roomCount}
                                    onChange={handleInputChange}
                                    placeholder="Số lượng phòng"
                                    className="border border-gray-300 p-2 rounded-lg w-full text-sm outline-0"
                                />
                            </div>
                            <div className="col-span-2 md:col-span-1">
                                <label htmlFor="area" className="text-sm mb-2 inline-block">
                                    Diện tích <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="area"
                                    type="text"
                                    value={formData.area}
                                    onChange={handleInputChange}
                                    placeholder="Diện tích (m²)"
                                    className="border border-gray-300 p-2 rounded-lg w-full text-sm outline-0"
                                    required
                                />
                            </div>
                            <div className="col-span-2 flex flex-col gap-y-4">
                                <div>
                                    <label
                                        htmlFor="locationId"
                                        className="text-sm mb-2 inline-block"
                                    >
                                        Phường/Xã <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="locationId"
                                        value={formData.locationId}
                                        onChange={handleInputChange}
                                        className="border border-gray-300 p-2 rounded-lg w-full text-sm outline-0"
                                        required
                                    >
                                        <option value="">-- Chọn phường/xã --</option>
                                        {locations.map(loc => (
                                            <option key={loc.id} value={loc.id}>
                                                {loc.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="street" className="text-sm mb-2 inline-block">
                                        Đường
                                    </label>
                                    <input
                                        id="street"
                                        type="text"
                                        value={formData.street}
                                        onChange={handleInputChange}
                                        placeholder="VD: Km 10, Đường Trần Phú"
                                        className="border border-gray-300 p-2 rounded-lg w-full text-sm outline-0"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="address" className="text-sm mb-2 inline-block">
                                        Địa chỉ
                                    </label>
                                    <input
                                        id="address"
                                        type="text"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        placeholder="VD: Km 10, Đường Trần Phú, phường Hà Đông, thành phố Hà Nội"
                                        className="border border-gray-300 p-2 rounded-lg w-full text-sm outline-0"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="price" className="text-sm mb-2 inline-block">
                                        Giá thuê <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="price"
                                        type="text"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        placeholder="VD: 5000000"
                                        className="border border-gray-300 p-2 rounded-lg w-full text-sm outline-0"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* TIỆN NGHI */}
                    <div>
                        <h3 className="text-sm font-[400] mb-4">Tiện nghi</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {amenitiesList.map((item, idx) => (
                                <label
                                    key={idx}
                                    className="flex items-center gap-2 text-sm font-[300] cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={formData.amenities.includes(item)}
                                        onChange={() => handleCheckboxChange('amenities', item)}
                                    />
                                    {item}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* MÔI TRƯỜNG */}
                    <div>
                        <h3 className="text-sm font-[400] mb-4">Môi trường xung quanh</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {surroundingsList.map((item, idx) => (
                                <label
                                    key={idx}
                                    className="flex items-center gap-2 text-sm font-[300] cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={formData.surroundings.includes(item)}
                                        onChange={() => handleCheckboxChange('surroundings', item)}
                                    />
                                    {item}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* MÔ TẢ */}
                    <div>
                        <h3 className="text-sm font-[400] mb-4">Mô tả</h3>
                        <textarea
                            id="description"
                            rows={8}
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Nhập mô tả chi tiết..."
                            className="w-full border border-gray-300 p-2 rounded outline-0 text-sm"
                        />
                    </div>

                    {/* NỘI QUY */}
                    <div>
                        <h3 className="text-sm font-[400] mb-4">Nội quy</h3>
                        <textarea
                            id="rules"
                            rows={8}
                            value={formData.rules}
                            onChange={handleInputChange}
                            placeholder="Nhập nội quy..."
                            className="w-full border border-gray-300 p-2 rounded outline-0 text-sm"
                        />
                    </div>

                    {/* HÌNH ẢNH */}
                    <div>
                        <h3 className="text-sm font-[400] mb-4">Hình ảnh tổng quan</h3>

                        <label
                            htmlFor="file"
                            className="flex justify-center items-center gap-x-2 min-h-[150px] border-1 border-dashed border-[#006ffd] rounded-lg p-6 text-center text-gray-500 cursor-pointer bg-[#eaf2ff]"
                        >
                            <div className="mt-2 text-gray-400">
                                <FontAwesomeIcon
                                    icon={faCloudArrowUp}
                                    className="text-[50px] text-[#006ffd]"
                                />
                            </div>
                            <div className="flex flex-col justify-center">
                                <span className="uppercase font-[500] text-[#006ffd]">
                                    Kéo thả hình ảnh{' '}
                                </span>
                                <span className="text-sm text-gray-400">(Hoặc chọn hình ảnh)</span>
                            </div>
                        </label>

                        <input
                            id="file"
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                        />

                        {/* Preview Images */}
                        {previewImages.length > 0 && (
                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-4 mt-4">
                                {previewImages.map((img, idx) => (
                                    <div key={idx} className="relative group">
                                        <img
                                            src={img}
                                            alt={`Preview ${idx}`}
                                            className="w-24 h-24 object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(idx)}
                                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            ×
                                        </button>
                                        {idx === 0 && (
                                            <span className="absolute bottom-2 left-2 bg-blue-500 text-white text-[10px] px-2 py-1 rounded">
                                                Ảnh chính
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-6">Thông tin liên hệ</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="owner_name" className="text-sm mb-2 inline-block">
                                    Họ tên
                                </label>
                                <input
                                    id="owner_name"
                                    type="text"
                                    value={currentUser?.full_name || ''}
                                    readOnly
                                    className="border border-gray-300 p-2 rounded-lg w-full text-sm outline-0 bg-gray-100 cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label htmlFor="owner_phone" className="text-sm mb-2 inline-block">
                                    Số điện thoại
                                </label>
                                <input
                                    id="owner_phone"
                                    type="text"
                                    value={currentUser?.phone || ''}
                                    readOnly
                                    className="border border-gray-300 p-2 rounded-lg w-full text-sm outline-0 bg-gray-100 cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label htmlFor="zalo" className="text-sm mb-2 inline-block">
                                    Zalo
                                </label>
                                <input
                                    id="zalo"
                                    type="text"
                                    value={currentUser?.phone ? `zalo.me/${currentUser.phone}` : ''}
                                    readOnly
                                    className="border border-gray-300 p-2 rounded-lg w-full text-sm outline-0 bg-gray-100 cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>

                    {/* NÚT */}
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onBack}
                            disabled={loading}
                            className="px-4 py-2 flex items-center justify-center text-sm cursor-pointer text-[#006ffd] hover:text-[#00b7ff] hover:border-[#00b7ff] transition-colors duration-300 border border-[#006ffd] rounded-lg w-[60px] h-[38px]"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 flex items-center justify-center bg-[#006ffd] hover:opacity-80 transition-opacity duration-300 cursor-pointer text-white rounded-lg text-sm min-w-[60px] h-[38px] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Đang lưu...' : 'Lưu'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateListingForm;
