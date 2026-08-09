export interface AdminSessionUser {
    id: number;
    full_name?: string;
    fullName?: string;
    name?: string;
    email?: string | null;
    phone?: string | null;
    role: string;
}
