import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import AdminVideoRequests from './pages/admin/AdminVideoRequests';
import Users from './pages/admin/Users';
import Listings from './pages/admin/Listings';
import Revenue from './pages/admin/Revenue';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
    return (
        <AuthProvider>
            <BrowserRouter>
                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="light"
                />
                <Routes>
                    <Route path="/login" element={<AdminLogin />} />
                    <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
                    <Route 
                        path="/admin/*" 
                        element={
                            <ProtectedRoute>
                                <AdminLayout>
                                    <Routes>
                                        <Route index element={<Navigate to="dashboard" replace />} />
                                        <Route path="dashboard" element={<Dashboard />} />
                                        <Route path="video-requests" element={<AdminVideoRequests />} />
                                        <Route path="users" element={<Users />} />
                                        <Route path="listings" element={<Listings />} />
                                        <Route path="revenue" element={<Revenue />} />
                                    </Routes>
                                </AdminLayout>
                            </ProtectedRoute>
                        } 
                    />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
};

export default App;
