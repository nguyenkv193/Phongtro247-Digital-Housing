'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { ArrowRight, LockKeyhole, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { FormEvent } from 'react';
import { useUser } from '@/providers/UserContext';
import type { LoginResponse } from '@/features/backoffice/types';
import { API_URL, getApiErrorMessage } from '@/features/backoffice/utils';

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
        <main className="grid min-h-screen bg-slate-50 lg:grid-cols-2">
            <section className="hidden bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 p-12 text-white lg:flex lg:flex-col lg:justify-between">
                <div className="flex items-center gap-3 font-bold"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-lg">P</span> Phongtro247</div>
                <div className="max-w-md">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15"><ShieldCheck size={30} /></span>
                    <h1 className="mt-7 text-4xl font-bold leading-tight">Trung tâm vận hành hệ thống.</h1>
                    <p className="mt-4 text-base leading-7 text-blue-100">Quản lý nội dung, kiểm duyệt yêu cầu và theo dõi hoạt động kinh doanh từ một nơi.</p>
                </div>
                <p className="text-sm text-blue-200">Khu vực dành riêng cho quản trị viên.</p>
            </section>
            <section className="flex items-center justify-center p-5 sm:p-10">
                <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/60 sm:p-9">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white lg:hidden"><ShieldCheck size={25} /></span>
                    <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Backoffice</p>
                    <h2 className="mt-2 text-2xl font-bold text-slate-900">Đăng nhập quản trị</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-500">Sử dụng tài khoản đã được cấp quyền quản trị viên.</p>
                    <form className="mt-7 space-y-5" onSubmit={submit}>
                        <label className="block text-sm font-semibold text-slate-700">
                            Email hoặc số điện thoại
                            <input value={identifier} onChange={event => setIdentifier(event.target.value)} required className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50" placeholder="Nhập email hoặc số điện thoại" />
                        </label>
                        <label className="block text-sm font-semibold text-slate-700">
                            Mật khẩu
                            <input type="password" value={password} onChange={event => setPassword(event.target.value)} required className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50" placeholder="Nhập mật khẩu" />
                        </label>
                        {error && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
                        <button type="submit" disabled={submitting} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
                            <LockKeyhole size={18} />
                            {submitting ? 'Đang đăng nhập...' : 'Vào Backoffice'}
                            {!submitting && <ArrowRight size={18} />}
                        </button>
                    </form>
                </div>
            </section>
        </main>
    );
}
