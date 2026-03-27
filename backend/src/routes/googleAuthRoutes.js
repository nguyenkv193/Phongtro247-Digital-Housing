const express = require('express');
const router = express.Router();
const googleAuthController = require('../controllers/googleAuthController');
const googleAuthUserInfoController = require('../controllers/googleAuthUserInfoController');

router.post('/google', googleAuthController.googleLogin);

router.post('/google-userinfo', googleAuthUserInfoController.googleLoginUserInfo);

module.exports = router;
