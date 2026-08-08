declare module 'react-helmet' {
    import type { FC, ReactNode } from 'react';

    interface HelmetProps {
        children?: ReactNode;
        [key: string]: unknown;
    }

    export const Helmet: FC<HelmetProps>;
}
