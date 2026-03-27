require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const googleAuthRoutes = require('./routes/googleAuthRoutes');
const userRoutes = require('./routes/userRoutes');
const listingRoutes = require('./routes/listingRoutes');
const locationRoutes = require('./routes/locationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const adminListingRoutes = require('./routes/adminListingRoutes');
const revenueRoutes = require('./routes/revenueRoutes');
const adminComplaintRoutes = require('./routes/adminComplaintRoutes');
const adminReportRoutes = require('./routes/adminReportRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const videoRoutes = require('./routes/videoRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const listingReportRoutes = require('./routes/listingReportRoutes');
const ogRoutes = require('./routes/ogRoutes');
const hotListingRoutes = require('./routes/hotListingRoutes');
const tenantRoutes = require('./routes/tenantsRoutes');
const contractRoutes = require('./routes/contractRoutes');
const incidentRoutes = require('./routes/incidentRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const reportRoutes = require('./routes/reportRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const emailVerificationRoutes = require('./routes/emailVerificationRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/auth', googleAuthRoutes);
app.use('/api/user', userRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/adminlistings', adminListingRoutes);
app.use('/api/admin/revenues', revenueRoutes);
app.use('/api/admin/complaints', adminComplaintRoutes);
app.use('/api/admin/reports', adminReportRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/listing-reports', listingReportRoutes);
app.use('/og', ogRoutes);
app.use('/api/hot-listings', hotListingRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/email-verification', emailVerificationRoutes);

app.get('/', (req, res) => {
    res.send('API đang chạy!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
