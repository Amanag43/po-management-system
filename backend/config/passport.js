const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({  
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
},

async( accessToken, refreshToken, profile, done) => {
    try {
        // Here you would typically find or create a user in your database
        const user = {
            googleId: profile.id,
                email: profile.emails[0].value,
                name: profile.displayName,
                avatar: profile.photos[0]?.value
        };

        return done(null, user);
    }   catch (error) {     
        return done(error, null);
    }
}));