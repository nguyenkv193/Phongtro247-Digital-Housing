'use client';

import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import NextLink from 'next/link';
import type { LinkProps as NextLinkProps } from 'next/link';
import {
    usePathname,
    useParams as useNextParams,
    useRouter,
    useSearchParams as useNextSearchParams,
} from 'next/navigation';

type RouterHref = string;
type RouterClassName = string | ((state: { isActive: boolean }) => string);

type CompatLinkProps = Omit<NextLinkProps, 'href' | 'children' | 'className'> & {
    to?: RouterHref;
    href?: RouterHref;
    children: ReactNode;
    className?: string;
};

type CompatNavLinkProps = Omit<CompatLinkProps, 'children' | 'className'> & {
    children: ReactNode | ((state: { isActive: boolean }) => ReactNode);
    className?: RouterClassName;
    end?: boolean;
};

const OutletContext = createContext<unknown>(undefined);
const OutletChildrenContext = createContext<ReactNode>(null);

const TOP_LEVEL_ROUTES = new Set(['rental-rooms', 'whole-houses', 'apartments', 'videos', 'contact']);

function resolveHref(target: RouterHref, pathname: string): RouterHref {
    if (typeof target !== 'string') return target;
    if (target.startsWith('/')) return target;
    if (target.startsWith('?')) return `${pathname}${target}`;
    if (target === '' || target === '.') return pathname || '/';
    if (TOP_LEVEL_ROUTES.has(target.split('/')[0])) return `/${target}`;
    if (pathname.startsWith('/landlord-dashboard')) return `/landlord-dashboard/${target}`;
    if (pathname.startsWith('/account-info')) return `/account-info/${target}`;
    return target;
}

export function Link({ to, href, children, className, ...props }: CompatLinkProps) {
    const pathname = usePathname() || '/';
    const destination = resolveHref(href ?? to ?? '/', pathname);
    return (
        <NextLink href={destination} className={className} {...props}>
            {children}
        </NextLink>
    );
}

export function NavLink({ to, href, className, children, end = false, ...props }: CompatNavLinkProps) {
    const pathname = usePathname() || '/';
    const destination = resolveHref(href ?? to ?? '/', pathname);
    const normalizedDestination = typeof destination === 'string' ? destination.split('?')[0] : destination;
    const isActive = end
        ? pathname === normalizedDestination
        : normalizedDestination === '/'
          ? pathname === '/'
          : pathname === normalizedDestination || pathname.startsWith(`${normalizedDestination}/`);
    const resolvedClassName = typeof className === 'function' ? className({ isActive }) : className;

    return (
        <NextLink href={destination} className={resolvedClassName} {...props}>
            {typeof children === 'function' ? children({ isActive }) : children}
        </NextLink>
    );
}

export interface NavigateOptions {
    replace?: boolean;
}

export function useNavigate(): (target: RouterHref | number, options?: NavigateOptions) => void {
    const router = useRouter();
    const pathname = usePathname() || '/';

    return (target, options: NavigateOptions = {}) => {
        if (typeof target === 'number') {
            if (target < 0) router.back();
            return;
        }

        const destination = resolveHref(target, pathname);
        if (options.replace) router.replace(destination);
        else router.push(destination);
    };
}

export function useLocation() {
    const pathname = usePathname() || '/';
    const searchParams = useNextSearchParams();
    const search = searchParams.toString() ? `?${searchParams.toString()}` : '';

    return {
        pathname,
        search,
        hash: '',
        state: null,
        key: 'next',
    };
}

export function useParams(): Record<string, string | undefined> {
    return useNextParams() as Record<string, string | undefined>;
}

// React Router returns [URLSearchParams]. Keep that shape so existing pages can
// be migrated without changing their query handling in this first pass.
export function useSearchParams(): [URLSearchParams | ReturnType<typeof useNextSearchParams>] {
    return [useNextSearchParams() ?? new URLSearchParams()];
}

export function OutletChildrenProvider({
    outlet,
    children,
}: {
    outlet: ReactNode;
    children: ReactNode;
}) {
    return <OutletChildrenContext.Provider value={outlet}>{children}</OutletChildrenContext.Provider>;
}

export function Outlet({ context }: { context?: unknown }) {
    const outlet = useContext(OutletChildrenContext);

    if (context !== undefined) {
        return <OutletContext.Provider value={context}>{outlet}</OutletContext.Provider>;
    }

    return outlet;
}

export function useOutletContext<T = unknown>(): T {
    return useContext(OutletContext) as T;
}


