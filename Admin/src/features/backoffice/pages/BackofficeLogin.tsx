'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from '@/router';
import type { FormEvent } from 'react';
import { useUser } from '@/providers/UserContext';
import type { LoginResponse } from '@/features/backoffice/types';
import { API_URL, getApiErrorMessage } from '@/features/backoffice/utils';
import { Button } from '@/features/backoffice/components/BackofficeUi';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
                    <Label htmlFor="backoffice-identifier">Tài khoản</Label>
                    <Input
                        id="backoffice-identifier"
                        type="text"
                        value={identifier}
                        onChange={event => setIdentifier(event.target.value)}
                        placeholder="Nhập email hoặc số điện thoại"
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="backoffice-password">Mật khẩu</Label>
                    <Input
                        id="backoffice-password"
                        type="password"
                        value={password}
                        onChange={event => setPassword(event.target.value)}
                        placeholder="Nhập mật khẩu"
                        required
                    />
                </div>
                {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                <Button
                    type="submit"
                    disabled={submitting}
                    className="mt-4 h-[46px] w-full"
                >
                    {submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </Button>
            </form>
        </AuthPageShell>
    );
}


