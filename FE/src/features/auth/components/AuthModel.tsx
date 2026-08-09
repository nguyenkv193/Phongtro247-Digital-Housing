/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { logo } from '@/assets/assets';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';
import GoogleLoginButton from './GoogleLoginButton';
import type { FormEvent, MouseEvent } from 'react';

export type AuthMode = 'Login' | 'Register';

interface AuthModelProps {
    type: AuthMode | null;
    onClick: (type: AuthMode | null) => void;
}

const AuthModel = ({ type, onClick }: AuthModelProps) => {
    const [isOpen, setIsOpen] = useState(Boolean(type));
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();

    useEffect(() => {
        const savedToken = localStorage.getItem('auth_token');
        if (savedToken) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
        }
    }, []);

    useEffect(() => {
        if (type) setIsOpen(true);
    }, [type]);

    useEffect(() => {
        const handleAuthChanged = () => {
            const token = localStorage.getItem('auth_token');
            if (token) {
                setIsOpen(false);
                setTimeout(() => {
                    onClick(null);
                }, 300);
            }
        };

        window.addEventListener('authChanged', handleAuthChanged);
        return () => window.removeEventListener('authChanged', handleAuthChanged);
    }, [onClick]);

    const requestClose = (e?: MouseEvent<HTMLDivElement>): void => {
        if (e) e.stopPropagation();
        setIsOpen(false);
    };

    const handleRegister = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setError('');
        const normalizedFullName = fullName.trim();
        const normalizedUsername = username.trim();

        if (!normalizedFullName || !normalizedUsername || !password || !confirmPassword) {
            setError('Vui lòng nhập đầy đủ thông tin!');
            return;
        }
        if (password.length < 8) {
            setError('Mật khẩu phải có ít nhất 8 ký tự');
            return;
        }
        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp!');
            return;
        }
        setLoading(true);
        try {
            await axios.post(`${API_URL}/api/auth/register`, {
                full_name: normalizedFullName,
                email: normalizedUsername.includes('@') ? normalizedUsername : '',
                phone: !normalizedUsername.includes('@') ? normalizedUsername : '',
                password,
            });
            toast.success('Đăng ký thành công!');
            setLoading(false);
            onClick('Login');
        } catch (err: unknown) {
            setLoading(false);
            if (axios.isAxiosError<{ message?: string; violations?: Record<string, string> }>(err)) {
                const violations = err.response?.data?.violations;
                setError(Object.values(violations ?? {})[0] || err.response?.data?.message || 'Đăng ký thất bại!');
                return;
            }
            setError('Đăng ký thất bại!');
        }
    };

    const handleLogin = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setError('');
        if (!username || !password) {
            setError('Vui lòng nhập đầy đủ thông tin!');
            return;
        }
        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/api/auth/login`, {
                emailOrPhone: username,
                password,
            });

            const { token, user } = res.data;

            localStorage.setItem('auth_token', token);
            localStorage.setItem('auth_user', JSON.stringify(user));
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            window.dispatchEvent(new Event('authChanged'));

            toast.success('Đăng nhập thành công!');
            setLoading(false);
            onClick(null);
        } catch (err: unknown) {
            setLoading(false);
            setError(
                (axios.isAxiosError<{ message?: string }>(err) ? err.response?.data?.message : undefined) ||
                    'Đăng nhập thất bại!'
            );
        }
    };

    return (
        <AnimatePresence
            mode="wait"
            onExitComplete={() => {
                if (!isOpen) onClick(null);
            }}
        >
            {type && isOpen && (
                <motion.div
                    key={type}
                    className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center"
                    onClick={requestClose}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <motion.div
                        className="p-5 py-11 w-full h-full sm:w-[450px] sm:h-auto bg-white sm:rounded-lg relative"
                        onClick={e => e.stopPropagation()}
                        initial={{ translateY: '150%' }}
                        animate={{ translateY: 0 }}
                        exit={{ translateY: '150%' }}
                        transition={{ duration: 0.3 }}
                    >
                        <div
                            className="absolute top-2 right-2 cursor-pointer w-8 h-8 flex items-center justify-center z-[99]"
                            onClick={requestClose}
                        >
                            <FontAwesomeIcon icon={faTimes} className="text-[20px]" />
                        </div>

                        {type === 'Login' && (
                            <div className="w-[60px] h-[60px] flex items-center mx-auto">
                                <img src={logo} alt="logo" />
                            </div>
                        )}

                        <p
                            className={`${
                                type === 'Login'
                                    ? 'text-center font-semibold text-[#2e2a2a] text-[18px] capitalize mt-2'
                                    : 'font-semibold text-[#2e2a2a] text-[18px] capitalize'
                            }`}
                        >
                            {type === 'Login'
                                ? 'Chào mừng bạn đến với Phongtro247'
                                : 'Đăng ký tài khoản mới'}
                        </p>

                        <form onSubmit={type === 'Register' ? handleRegister : handleLogin}>
                            <div className="mt-6 flex flex-col gap-y-4 text-[#2e2a2a]">
                                {type === 'Register' && (
                                    <div>
                                        <label
                                            htmlFor="fullname"
                                            className="text-sm whitespace-nowrap font-[400] mb-2 block "
                                        >
                                            Họ và Tên
                                        </label>
                                        <input
                                            id="fullname"
                                            type="text"
                                            value={fullName}
                                            onChange={e => setFullName(e.target.value)}
                                            className="border block w-full border-gray-300 outline-0 hover:border-[#00b7ff] focus:border-[#00b7ff] transition-colors duration-300 rounded-md px-3 py-2 text-sm"
                                            placeholder="Nhập vào Họ và Tên"
                                        />
                                    </div>
                                )}

                                <div>
                                    <label
                                        htmlFor="username"
                                        className="text-sm whitespace-nowrap font-[400] mb-2 block "
                                    >
                                        Email / Số điện thoại
                                    </label>
                                    <input
                                        id="username"
                                        type="text"
                                        value={username}
                                        onChange={e => setUsername(e.target.value)}
                                        className="border block w-full border-gray-300 outline-0 hover:border-[#00b7ff] focus:border-[#00b7ff] transition-colors duration-300 rounded-md px-3 py-2 text-sm"
                                        placeholder="Nhập vào Email hoặc Số điện thoại"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="password"
                                        className="text-sm whitespace-nowrap font-[400] mb-2 block"
                                    >
                                        Mật khẩu
                                    </label>
                                    <input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className="border block w-full border-gray-300 outline-0 hover:border-[#00b7ff] focus:border-[#00b7ff] transition-colors duration-300 rounded-md px-3 py-2 text-sm"
                                        placeholder="Nhập vào mật khẩu"
                                    />
                                </div>

                                {type === 'Register' && (
                                    <div>
                                        <label
                                            htmlFor="confirmPassword"
                                            className="text-sm whitespace-nowrap font-[400] mb-2 block"
                                        >
                                            Xác nhận mật khẩu
                                        </label>
                                        <input
                                            id="confirmPassword"
                                            type="password"
                                            value={confirmPassword}
                                            onChange={e => setConfirmPassword(e.target.value)}
                                            className="border block w-full border-gray-300 outline-0 hover:border-[#00b7ff] focus:border-[#00b7ff] transition-colors duration-300 rounded-md px-3 py-2 text-sm"
                                            placeholder="Nhập lại mật khẩu"
                                        />
                                    </div>
                                )}

                                {error && <div className="text-red-500 text-sm">{error}</div>}

                                {type === 'Login' && (
                                    <div className="text-[#0045a8] text-[12px] font-[300] flex items-center justify-between">
                                        <button
                                            type="button"
                                            className="cursor-pointer hover:underline underline-offset-2"
                                        >
                                            Quên mật khẩu?
                                        </button>
                                        <button
                                            type="button"
                                            onClick={e => {
                                                e.stopPropagation();
                                                onClick('Register');
                                            }}
                                            className="cursor-pointer hover:underline underline-offset-2"
                                        >
                                            Đăng ký
                                        </button>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full p-[15px] font-[500] bg-[#ff5c00] cursor-pointer flex items-center justify-center hover:opacity-80 transition-opacity duration-300 text-white text-sm rounded-lg h-[46px]"
                                >
                                    {loading
                                        ? 'Đang xử lý...'
                                        : type === 'Login'
                                        ? 'Đăng nhập'
                                        : 'Đăng ký'}
                                </button>

                                {type === 'Register' && (
                                    <p className="text-[12px] text-[#8f9098] leading-relaxed">
                                        Bằng cách tiếp tục, bạn đồng ý với{' '}
                                        <span className="text-[#006ffd] hover:underline underline-offset-2 cursor-pointer">
                                            Điều khoản & Cam kết
                                        </span>{' '}
                                        của Phongtro247 và xác nhận rằng bạn đã đọc{' '}
                                        <span className="text-[#006ffd] hover:underline underline-offset-2 cursor-pointer">
                                            Chính sách bảo mật
                                        </span>{' '}
                                        của chúng tôi.
                                    </p>
                                )}
                            </div>
                        </form>

                        {type === 'Login' && (
                            <div className="mt-6">
                                <div className="flex items-center gap-x-[2px]">
                                    <span className="h-[1px] bg-[#ebecec] flex-1 rounded-full"></span>
                                    <span className="flex-1 text-[12px] text-[#8f9098] text-center">
                                        Hoặc đăng nhập bằng
                                    </span>
                                    <span className="h-[1px] bg-[#ebecec] flex-1"></span>
                                </div>

                                <div className="mt-6">
                                    {googleClientId ? (
                                        <GoogleLoginButton />
                                    ) : (
                                        <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-center text-xs text-amber-700">
                                            Đăng nhập Google chưa được cấu hình.
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AuthModel;
