'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import type { FormEvent } from 'react';
import { useUser } from '@/providers/UserContext';
import type { LoginResponse } from '@/features/backoffice/types';
import { API_URL, getApiErrorMessage } from '@/features/backoffice/utils';
import AuthPageShell from '@/features/auth/components/AuthPageShell';

export default function BackofficeLogin() {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { currentUser, loading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!loading && currentUser?.role?.toLowerCase() === 'admin') {
            router.replace('/backoffice');
        }
    }, [currentUser, loading, router]);

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            const response = await axios.post<LoginResponse>(`${API_URL}/api/auth/login`, {
                emailOrPhone: identifier,
                password,
            });
            if (response.data.user.role.toLowerCase() !== 'admin') {
                setError('Tài khoản này không có quyền truy cập Backoffice.');
                return;
            }
            const user = {
                ...response.data.user,
                full_name: response.data.user.full_name || response.data.user.fullName,
            };
            localStorage.setItem('auth_token', response.data.token);
            localStorage.setItem('auth_user', JSON.stringify(user));
            axios.defaults.headers.common.Authorization = `Bearer ${response.data.token}`;
            window.dispatchEvent(new Event('authChanged'));
            router.replace('/backoffice');
        } catch (requestError) {
            setError(getApiErrorMessage(requestError, 'Không thể đăng nhập. Vui lòng thử lại.'));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AuthPageShell title="Đăng nhập quản trị">
            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Tài khoản</label>
                    <input
                        type="text"
                        value={identifier}
                        onChange={event => setIdentifier(event.target.value)}
                        placeholder="Nhập email hoặc số điện thoại"
                        className="w-full border text-sm border-[#e4e4e7] hover:border-[#00b7ff] focus:border-[#00b7ff] outline-0 rounded-lg px-3 py-2"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Mật khẩu</label>
                    <input
                        type="password"
                        value={password}
                        onChange={event => setPassword(event.target.value)}
                        placeholder="Nhập mật khẩu"
                        className="w-full border text-sm border-[#e4e4e7] hover:border-[#00b7ff] focus:border-[#00b7ff] outline-0 rounded-lg px-3 py-2"
                        required
                    />
                </div>
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}
                <button
                    type="submit"
                    disabled={submitting}
                    className={`w-full h-[46px] ${
                        submitting
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-[#ff5c00] cursor-pointer hover:opacity-80'
                    } text-white py-2 rounded-lg font-semibold mt-4 text-sm transition-opacity duration-300`}
                >
                    {submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </button>
            </form>
        </AuthPageShell>
    );
}
