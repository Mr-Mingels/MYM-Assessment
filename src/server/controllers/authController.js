const bcrypt = require("bcryptjs");
const User = require("../models/user");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy
const passport = require("passport");

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, username, password, done) => {
      try {
        const email = req.body.email; // Get the email from the request
        const userByEmail = await User.findOne({ email: email }); // Look for a user with the email

        // Checks if the users email is not in the database
        if (!userByEmail) {
          // if the email is not in the database it sends an authentication failure response with the message "Incorrect email."
          return done(null, false, { message: "Incorrect email" });
        }

        // This code compares the provided 'password' with the hashed password stored in the database for the corresponding user.
        // If they match, it logs the user in; otherwise, it indicates that the passwords do not match.
        bcrypt.compare(password, userByEmail.password, (err, res) => {
          if (err) {
            return done(err);
          }

          if (res) {
            // If true, passwords match so it logs the user in
            return done(null, userByEmail);
          } else {
            // Passwords do not match
            return done(null, false, { message: "Incorrect password" });
          }
        });
      } catch (err) {
        return done(err);
      }
    }
  )
);

// Configure Passport to use Google OAuth strategy with specified credentials and callback URL.
passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackURL: "/auth/google/callback",
			scope: ["profile", "email"],
		},
		function (accessToken, refreshToken, profile, callback) {
			callback(null, profile);
		}
	)
);

// These Passport.js functions serialize and deserialize user data,
// allowing user sessions to be managed in the application.

passport.serializeUser((user, done) => {
	done(null, user);
});

passport.deserializeUser((user, done) => {
	done(null, user);
});

module.exports = {
  localStrategy: passport.initialize(),
  session: passport.session(),
};
