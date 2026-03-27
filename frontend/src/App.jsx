import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Home from './pages/Home';
import VideoReview from './pages/VideoReview';
import Contact from './pages/Contact';
import RentalListPage from './pages/RentalListPage';
import HostInfo from './pages/HostInfo';
import LandlordDashboard from './pages/LandlordDashboard';

import TenantManagement from './pages/TenantManagement';
import ContractManagement from './pages/ContractManagement';
import ServicesManagement from './pages/ServicesManagement';
import ComplaintsManagement from './pages/ComplaintsManagement';
import ExpensesManagement from './pages/ExpensesManagement';
import ReportsManagement from './pages/ReportsManagement';
import ReviewsManagement from './pages/ReviewsManagement';
import InvoicesManagement from './pages/InvoicesManagement';
import Deposit from './pages/Deposit';
import TransactionHistory from './pages/TransactionHistory';
import DashboardHome from './pages/DashboardHome';

import BackToTop from './components/BackToTop';
import Footer from './components/Footer';
import Header from './components/Header';
import ErrorPage from './pages/ErrorPage';
import ScrollToTop from './components/ScrollToTop';
import CreateListingForm from './pages/CreateListingForm';

import Account from './pages/Account';
import AccommodationInfo from './components/AccountComponents/AccommodationInfo';
import UserInfo from './components/AccountComponents/UserInfo';
import AccountInfo from './components/AccountComponents/AccountInfo';
import Notifications from './components/AccountComponents/Notifications';
import Reviews from './components/AccountComponents/Reviews';
import SavedItems from './components/AccountComponents/SavedItems';
import ListingDetail from './pages/ListingDetail';
import PaymentResult from './components/PaymentResult';
import VerifyEmail from './pages/VerifyEmail';

const App = () => {
    const location = useLocation();

    const shouldHide =
        location.pathname === '/host-info' || location.pathname.startsWith('/landlord-dashboard');

    return (
        <div>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
            {!shouldHide && <Header />}

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/all" element={<RentalListPage />} />
                <Route path="/rental-rooms" element={<RentalListPage />} />
                <Route path="/whole-houses" element={<RentalListPage />} />
                <Route path="/apartments" element={<RentalListPage />} />
                <Route path="/videos" element={<VideoReview />} />
                <Route path="/contact" element={<Contact />} />

                <Route path="/landlord-dashboard" element={<LandlordDashboard />}>
                    <Route index element={<DashboardHome />} />
                    <Route path="create-new" element={<CreateListingForm />} />
                    <Route path="tenants" element={<TenantManagement />} />
                    <Route path="contracts" element={<ContractManagement />} />
                    <Route path="invoices" element={<InvoicesManagement />} />
                    <Route path="expenses" element={<ExpensesManagement />} />
                    <Route path="services" element={<ServicesManagement />} />
                    <Route path="reports" element={<ReportsManagement />} />
                    <Route path="complaints" element={<ComplaintsManagement />} />
                    <Route path="reviews" element={<ReviewsManagement />} />
                    <Route path="deposit" element={<Deposit />} />
                    <Route path="transactions" element={<TransactionHistory />} />
                    <Route path="user-info" element={<UserInfo />} />
                    <Route path="account-info" element={<AccountInfo />} />
                    <Route path="accommodation" element={<AccommodationInfo />} />
                    <Route path="saved" element={<SavedItems />} />
                    <Route path="notifications" element={<Notifications />} />
                </Route>

                <Route path="/payment-result" element={<PaymentResult />} />
                <Route path="/verify-email" element={<VerifyEmail />} />

                <Route path="/account-info" element={<Account />}>
                    <Route index element={<UserInfo />} />
                    <Route path="user-info" element={<UserInfo />} />
                    <Route path="account-info" element={<AccountInfo />} />
                    <Route path="accommodation" element={<AccommodationInfo />} />
                    <Route path="reviews" element={<Reviews />} />
                    <Route path="saved" element={<SavedItems />} />
                    <Route path="notifications" element={<Notifications />} />
                </Route>

                <Route path="/listing/:id" element={<ListingDetail />} />
                <Route path="/host-info" element={<HostInfo />} />
                <Route path="*" element={<ErrorPage />} />
            </Routes>

            {!shouldHide && <Footer />}
            <BackToTop />
            <ScrollToTop />
        </div>
    );
};

export default App;
