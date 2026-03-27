const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token =
        typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
            ? authHeader.split(' ')[1]
            : authHeader;

    if (!token) {
        return res.status(403).json({ message: 'Không có token!' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Token không hợp lệ!' });
        }

        req.user = {
            id: decoded.id,
            role: decoded.role,
            email: decoded.email,
        };

        req.userId = decoded.id;
        req.userRole = decoded.role;

        next();
    });
};

const isAdmin = (req, res, next) => {
    if (req.userRole === 'admin' || req.user?.role === 'admin') {
        return next();
    }
    return res.status(403).json({ message: 'Bạn không có quyền admin!' });
};

module.exports = { verifyToken, isAdmin };
