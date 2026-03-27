const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

transporter.verify(function (error, success) {
    if (error) {
        console.log('❌ Email service error:', error);
    } else {
        console.log('✅ Email service is ready');
    }
});

const getVerificationEmailTemplate = (userName, verificationLink) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0045a8 0%, #0066cc 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 15px 30px; background: #0045a8; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏠 Phongtro247</h1>
            <p>Xác thực địa chỉ email của bạn</p>
        </div>
        <div class="content">
            <p>Xin chào <strong>${userName}</strong>,</p>
            <p>Cảm ơn bạn đã đăng ký tài khoản tại Phongtro247!</p>
            <p>Vui lòng click vào nút bên dưới để xác thực địa chỉ email của bạn:</p>
            <div style="text-align: center;">
                <a href="${verificationLink}" class="button">Xác thực Email</a>
            </div>
            <p style="color: #666; font-size: 14px;">
                Hoặc copy link sau vào trình duyệt:<br>
                <a href="${verificationLink}">${verificationLink}</a>
            </p>
            <p style="color: #ff5c00; font-size: 14px;">
                ⚠️ Link này sẽ hết hạn sau 24 giờ.
            </p>
            <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
        </div>
        <div class="footer">
            <p>© 2025 Phongtro247. All rights reserved.</p>
            <p>Email này được gửi tự động, vui lòng không reply.</p>
        </div>
    </div>
</body>
</html>
    `;
};

const sendVerificationEmail = async (to, userName, verificationLink) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'Phongtro247 <noreply@phongtro247.com>',
            to: to,
            subject: '🔐 Xác thực email - Phongtro247',
            html: getVerificationEmailTemplate(userName, verificationLink),
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending email:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendVerificationEmail,
};
