import { faEnvelope, faLocationArrow, faPhone } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { logo } from '../assets/assets';

const Footer = () => {
    return (
        <div className=" border-t border-t-gray-200 mt-10">
            <div className="2xl:px-48 xl:px-32 md:px-10 px-[10px] ">
                <div className="grid md:grid-cols-3 py-10 gap-12 ">
                    {/* Left */}
                    <div className="flex flex-col gap-y-4">
                        <div className="flex items-center gap-x-2 cursor-pointer">
                            {/* Header Logo */}
                            <div className="w-14 h-14 md:w-16 md:h-16 flex items-center">
                                <img src={logo} alt="" />
                            </div>
                            <h3 className="text-[#0043a1] font-bold text-[15px] md:text-lg uppercase text-shadow-sm  self-end">
                                Phongtro247
                            </h3>
                        </div>
                        <div className="flex flex-col gap-y-2">
                            <p className="text-[#0045a8] text-sm uppercase font-semibold">
                                Tải App Trọ Mới ngay
                            </p>
                            <div className="flex items-center gap-x-2">
                                <div className="w-[95px] h-[95px] border-1 p-1 rounded-md">
                                    <img
                                        src="https://tromoi.com/frontend/home/images/qr_app_user.png"
                                        alt="qr-code"
                                    />
                                </div>
                                <div className="h-[95px] flex flex-col gap-y-2">
                                    <img
                                        src="https://tromoi.com/frontend/home/images/download_app_store.svg"
                                        alt="app-store-download"
                                        className="w-full h-[47px] object-cover"
                                    />
                                    <img
                                        src="https://tromoi.com/frontend/home/images/download_google_play.png"
                                        alt="ch-play-download"
                                        className="w-full h-[41px] object-cover"
                                    />
                                </div>
                            </div>
                        </div>
                        <p className="mt-5 text-[#2e2a2a] text-sm">
                            Tải App ngay trên App Store hoặc CH-Play để tìm trọ một cách nhanh chóng
                            và hiệu quả.
                        </p>
                    </div>
                    {/* Center */}
                    <div className="flex md:justify-center">
                        <div className="flex flex-col gap-y-6 w-fit">
                            <div>
                                <p className="text-[#0045a8] text-[15px] sm:text-lg font-bold mb-4 uppercase">
                                    HỆ THỐNG
                                </p>
                                <ul className="text-[#2e2a2a] flex flex-col gap-y-2 text-[13px] sm:text-[15px]">
                                    <li>Dành cho chủ trọ</li>
                                    <li>Hướng dẫn</li>
                                    <li>Liên hệ</li>
                                </ul>
                            </div>
                            <div>
                                <p className="text-[#0045a8] text-[15px] sm:text-lg font-bold mb-4 uppercase">
                                    THÔNG TIN
                                </p>
                                <ul className="text-[#2e2a2a] flex flex-col gap-y-2 text-[13px] sm:text-[15px]">
                                    <li>Điều khoản & Cam kết</li>
                                    <li>Quy chế hoạt động</li>
                                    <li>Giải quyết khiếu nại</li>
                                    <li>Chính sách bảo mật</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    {/* Right */}
                    <div className="flex md:justify-center">
                        <div className="flex flex-col gap-y-2">
                            <p className="text-[#0045a8] text-[15px] sm:text-lg font-bold mb-4 uppercase">
                                KẾT NỐI VỚI CHÚNG TÔI
                            </p>
                            <div className="flex items-center gap-x-3">
                                <span className="p-[6px] w-8 h-8 rounded-full bg-[#f0f7ff] inline-flex items-center justify-center">
                                    <FontAwesomeIcon
                                        icon={faPhone}
                                        className="text-[#0045a8] text-sm"
                                    />
                                </span>
                                <span className="text-[13px] sm:text-[15px] text-[#2e2a2a] font-[400]">
                                    033.266.1579
                                </span>
                            </div>
                            <div className="flex items-center gap-x-3">
                                <span className="p-[6px] w-8 h-8 rounded-full bg-[#f0f7ff] inline-flex items-center justify-center">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        stroke="#0045a8"
                                        width="15"
                                        height="15"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            fill="currentColor"
                                            d="M12.49 10.272v-.45h1.347v6.322h-.77a.576.576 0 0 1-.577-.573v.001a3.273 3.273 0 0 1-1.938.632a3.284 3.284 0 0 1-3.284-3.282a3.284 3.284 0 0 1 3.284-3.282a3.273 3.273 0 0 1 1.937.632zM6.919 7.79v.205c0 .382-.051.694-.3 1.06l-.03.034a7.714 7.714 0 0 0-.242.285L2.024 14.8h4.895v.768a.576.576 0 0 1-.577.576H0v-.362c0-.443.11-.641.25-.847L4.858 9.23H.192V7.79zm8.551 8.354a.48.48 0 0 1-.48-.48V7.79h1.441v8.354zM20.693 9.6a3.306 3.306 0 1 1 .002 6.612a3.306 3.306 0 0 1-.002-6.612m-10.14 5.253a1.932 1.932 0 1 0 0-3.863a1.932 1.932 0 0 0 0 3.863m10.14-.003a1.945 1.945 0 1 0 0-3.89a1.945 1.945 0 0 0 0 3.89"
                                        ></path>
                                    </svg>
                                </span>
                                <span className="text-[13px] sm:text-[15px] text-[#2e2a2a] font-[400]">
                                    033.266.1579
                                </span>
                            </div>
                            <div className="flex items-center gap-x-3">
                                <span className="p-[6px] w-8 h-8 rounded-full bg-[#f0f7ff] inline-flex items-center justify-center">
                                    <FontAwesomeIcon
                                        icon={faEnvelope}
                                        className="text-[#0045a8] text-sm"
                                    />
                                </span>
                                <span className="text-[13px] sm:text-[15px] text-[#2e2a2a] font-[400]">
                                    info@tromoi.com
                                </span>
                            </div>
                            <div className="flex items-center gap-x-3">
                                <span className="p-[6px] w-8 h-8 rounded-full bg-[#f0f7ff] inline-flex items-center justify-center">
                                    <FontAwesomeIcon
                                        icon={faLocationArrow}
                                        className="text-[#0045a8] text-sm"
                                    />
                                </span>
                                <span className="text-[13px] sm:text-[15px] text-[#2e2a2a] font-[400]">
                                    VP Huế: 4/16 Đoàn Hữu Trưng, TP. Huế
                                </span>
                            </div>
                            <div className="flex items-center gap-x-3">
                                <span className="p-[6px] w-8 h-8 rounded-full bg-[#f0f7ff] inline-flex items-center justify-center">
                                    <FontAwesomeIcon
                                        icon={faLocationArrow}
                                        className="text-[#0045a8] text-sm"
                                    />
                                </span>
                                <span className="text-[13px] sm:text-[15px] text-[#2e2a2a] font-[400]">
                                    VP Huế: 4/16 Đoàn Hữu Trưng, TP. Huế
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <p className="py-2 text-center text-[12px] text-white bg-[#0045a8]">
                Copyright © 2015 - 2025 OHI Co.Ltd
            </p>
        </div>
    );
};

export default Footer;
