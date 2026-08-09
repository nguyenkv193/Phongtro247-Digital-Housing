import type { ImgHTMLAttributes } from 'react';

interface CompatImageProps extends ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    fill?: boolean;
}

export default function CompatImage({ src, fill: _fill, ...props }: CompatImageProps) {
    return <img src={src} {...props} />;
}
