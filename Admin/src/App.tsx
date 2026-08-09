import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import BackofficeShell from '@/features/backoffice/components/BackofficeShell';

const BackofficeLogin = lazy(() => import('@/features/backoffice/pages/BackofficeLogin'));
const ComplaintsPage = lazy(() => import('@/features/backoffice/pages/ComplaintsPage'));
const DashboardPage = lazy(() => import('@/features/backoffice/pages/DashboardPage'));
const ListingsPage = lazy(() => import('@/features/backoffice/pages/ListingsPage'));
const MasterDataPage = lazy(() => import('@/features/backoffice/pages/MasterDataPage'));
const ReportsPage = lazy(() => import('@/features/backoffice/pages/ReportsPage'));
const RequestsPage = lazy(() => import('@/features/backoffice/pages/RequestsPage'));
const RevenuePage = lazy(() => import('@/features/backoffice/pages/RevenuePage'));
const UsersPage = lazy(() => import('@/features/backoffice/pages/UsersPage'));

function RouteLoading() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
            Đang tải...
        </div>
    );
}

function AdminLayout() {
    return <BackofficeShell><Outlet /></BackofficeShell>;
}

export default function App() {
    return (
        <BrowserRouter>
            <Suspense fallback={<RouteLoading />}>
                <Routes>
                    <Route path="/login" element={<BackofficeLogin />} />
                    <Route path="/backoffice/login" element={<Navigate to="/login" replace />} />
                    <Route element={<AdminLayout />}>
                        <Route path="/" element={<DashboardPage />} />
                        <Route path="/requests" element={<RequestsPage />} />
                        <Route path="/users" element={<UsersPage />} />
                        <Route path="/listings" element={<ListingsPage />} />
                        <Route path="/complaints" element={<ComplaintsPage />} />
                        <Route path="/revenue" element={<RevenuePage />} />
                        <Route path="/reports" element={<ReportsPage />} />
                        <Route path="/master-data" element={<MasterDataPage />} />
                    </Route>
                    <Route path="/backoffice" element={<Navigate to="/" replace />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}
