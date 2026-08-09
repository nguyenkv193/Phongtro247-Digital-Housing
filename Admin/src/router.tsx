import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import type { ComponentProps } from 'react';

function normalizePath(path: string): string {
    if (path === '/backoffice' || path === '/backoffice/') return '/';
    if (path.startsWith('/backoffice/')) return path.slice('/backoffice'.length);
    return path;
}

type LinkProps = Omit<ComponentProps<typeof RouterLink>, 'to'> & { href: string };

export default function Link({ href, ...props }: LinkProps) {
    return <RouterLink to={normalizePath(href)} {...props} />;
}

export function usePathname(): string {
    const location = useLocation();
    return location.pathname === '/' ? '/backoffice' : `/backoffice${location.pathname}`;
}

export function useRouter() {
    const navigate = useNavigate();
    return {
        push: (path: string) => navigate(normalizePath(path)),
        replace: (path: string) => navigate(normalizePath(path), { replace: true }),
        back: () => navigate(-1),
    };
}
