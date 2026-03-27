import { useState, useRef, useEffect } from 'react';

export const useSearchFormState = () => {
    const [type, setType] = useState('All');
    const [locationDropdown, setLocationDropdown] = useState(false);
    const [priceDropdown, setPriceDropdown] = useState(false);
    const [areaDropdown, setAreaDropdown] = useState(false);
    const [typeRentalDropdown, setTypeRentalDropdown] = useState(false);
    const [typeLocation, setTypeLocation] = useState('Address');
    const [selectedRentalType, setSelectedRentalType] = useState('Nhà trọ, phòng trọ');
    const [openRange, setOpenRange] = useState(false);

    const locationDropdownRef = useRef(null);
    const priceDropdownRef = useRef(null);
    const areaDropdownRef = useRef(null);
    const typeRentalDropdownRef = useRef(null);
    const locationButtonRef = useRef(null);
    const priceButtonRef = useRef(null);
    const areaButtonRef = useRef(null);
    const typeRentalButtonRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = e => {
            if (
                locationDropdown &&
                !locationDropdownRef.current?.contains(e.target) &&
                !locationButtonRef.current?.contains(e.target)
            ) {
                setLocationDropdown(false);
                setOpenRange(false);
            }

            if (
                priceDropdown &&
                !priceDropdownRef.current?.contains(e.target) &&
                !priceButtonRef.current?.contains(e.target)
            ) {
                setPriceDropdown(false);
            }

            if (
                areaDropdown &&
                !areaDropdownRef.current?.contains(e.target) &&
                !areaButtonRef.current?.contains(e.target)
            ) {
                setAreaDropdown(false);
            }

            if (
                typeRentalDropdown &&
                !typeRentalDropdownRef.current?.contains(e.target) &&
                !typeRentalButtonRef.current?.contains(e.target)
            ) {
                setTypeRentalDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [locationDropdown, priceDropdown, areaDropdown, typeRentalDropdown]);

    const toggleLocationDropdown = () => {
        setLocationDropdown(!locationDropdown);
        setPriceDropdown(false);
        setAreaDropdown(false);
        setTypeRentalDropdown(false);
    };

    const togglePriceDropdown = () => {
        setPriceDropdown(!priceDropdown);
        setLocationDropdown(false);
        setAreaDropdown(false);
        setTypeRentalDropdown(false);
    };

    const toggleAreaDropdown = () => {
        setAreaDropdown(!areaDropdown);
        setLocationDropdown(false);
        setPriceDropdown(false);
        setTypeRentalDropdown(false);
    };

    const toggleTypeRentalDropdown = () => {
        setTypeRentalDropdown(!typeRentalDropdown);
        setLocationDropdown(false);
        setPriceDropdown(false);
        setAreaDropdown(false);
    };

    const closeAllDropdowns = () => {
        setLocationDropdown(false);
        setPriceDropdown(false);
        setAreaDropdown(false);
        setTypeRentalDropdown(false);
        setOpenRange(false);
    };

    return {
        type,
        setType,
        locationDropdown,
        setLocationDropdown,
        priceDropdown,
        setPriceDropdown,
        areaDropdown,
        setAreaDropdown,
        typeRentalDropdown,
        setTypeRentalDropdown,
        typeLocation,
        setTypeLocation,
        selectedRentalType,
        setSelectedRentalType,
        openRange,
        setOpenRange,
        locationDropdownRef,
        priceDropdownRef,
        areaDropdownRef,
        typeRentalDropdownRef,
        locationButtonRef,
        priceButtonRef,
        areaButtonRef,
        typeRentalButtonRef,
        toggleLocationDropdown,
        togglePriceDropdown,
        toggleAreaDropdown,
        toggleTypeRentalDropdown,
        closeAllDropdowns,
    };
};
