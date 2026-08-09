import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { logo } from '@/assets/assets';

interface AuthPageShellProps {
    title: string;
    children: ReactNode;
}

export default function AuthPageShell({ title, children }: AuthPageShellProps) {
    return (
        <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10">
            <Card className="w-full max-w-md shadow-sm">
                <CardHeader className="items-center gap-3 text-center">
                    <img src={logo} alt="Phongtro247" className="size-14 object-contain" />
                    <CardTitle className="text-xl">{title}</CardTitle>
                </CardHeader>
                <CardContent>{children}</CardContent>
            </Card>
        </main>
    );
}
