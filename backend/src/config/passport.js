const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('../config/db');

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails[0].value;
                const googleId = profile.id;
                const fullName = profile.displayName;
                const avatar = profile.photos[0]?.value || null;

                const [existingUsers] = await db.query('SELECT * FROM users WHERE google_id = ?', [
                    googleId,
                ]);

                if (existingUsers.length > 0) {
                    return done(null, existingUsers[0]);
                }

                const [emailUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

                if (emailUsers.length > 0) {
                    await db.query(
                        'UPDATE users SET google_id = ?, auth_provider = ?, email_verified = 1, avatar = ? WHERE id = ?',
                        [googleId, 'google', avatar, emailUsers[0].id]
                    );

                    const [updatedUser] = await db.query('SELECT * FROM users WHERE id = ?', [
                        emailUsers[0].id,
                    ]);
                    return done(null, updatedUser[0]);
                }

                const [result] = await db.query(
                    `INSERT INTO users (full_name, email, google_id, auth_provider, avatar, email_verified, verified, role) 
                     VALUES (?, ?, ?, 'google', ?, 1, 1, 'user')`,
                    [fullName, email, googleId, avatar]
                );

                const [newUser] = await db.query('SELECT * FROM users WHERE id = ?', [
                    result.insertId,
                ]);

                return done(null, newUser[0]);
            } catch (error) {
                console.error('Google OAuth Error:', error);
                return done(error, null);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const [users] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
        done(null, users[0]);
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport;
