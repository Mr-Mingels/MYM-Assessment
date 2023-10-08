const express = require("express");
const router = express.Router();
const passport = require("passport");
const bcrypt = require("bcryptjs");
const User = require("../models/user");

router.post("/sign-up-page", async (req, res) => {
  try {
    const password = req.body.password;
    const email = req.body.email.toUpperCase();
    const userByEmail = await User.findOne({ email: email });

    // Check if the email has already been taken
    if (userByEmail) {
      return res.status(400).send({ message: "Email has already been taken" });
    }

    // Check if the req fields are empty
    if (!req.body.email || !password) {
      return res.status(400).send({ message: "All fields are required" });
    }

    // This code block uses the bcrypt library to hash the provided 'password' with a salt factor of 10.
    // It then creates a new 'User' object with the 'email' and 'hashedPassword', saves it to the database,
    // and sends a successful response to the client with a message indicating the creation of a new user.
    bcrypt.hash(password, 10, async (err, hashedPassword) => {
      if (err) console.log(err);
      const user = new User({
        email: email,
        password: hashedPassword,
      });
      await user.save();
      return res.status(200).send({ message: "Created new User" });
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Server error" });
  }
});

router.post("/log-in-page", async (req, res, next) => {
  try {
    const password = req.body.password;
    const email = req.body.email.toUpperCase();
    const userByEmail = await User.findOne({ email: email });
  
    // Check if the request fields are empty. If they are not empty, the code verifies if the email sent to the server exists in the MongoDB database.
    // If the email is not found in the database, it is likely an incorrect email, and in such cases, a 400 error response is sent.
    if (!req.body.email || !password) {
      return res.status(400).send({ message: "All fields are required" });
    } else if (!userByEmail) {
      return res.status(400).send({ message: "Email is incorrect" });
    }
  
    // This code uses Passport.js to authenticate a user's login credentials.
    // It handles different scenarios, such as errors, unsuccessful logins, and successful logins,
    // and sends appropriate responses to the client based on the outcome.
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        console.error(`Error: ${err}`);
        return res.status(500).send({ message: `Error: ${err}` });
      }
      if (!user) {
        console.log("Log in Error:", info);
        return res.status(401).send({ message: `${info.message}` });
      }
      req.logIn(user, function (err) {
        if (err) {
          console.error(`Error: ${err}`);
          return res.status(500).send({ message: `Error: ${err}` });
        }
        return res
          .status(200)
          .send({ message: "Authentication succeeded", user });
      });
    })(req, res, next);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Server error" });
  }
});

  // Route to initiate Google OAuth authentication with specified access permissions.
  router.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  // Callback route for handling Google OAuth authentication results.
  router.get(
    "/auth/google/callback",
    passport.authenticate("google", {
      successRedirect: `/auth/login/success`,
      failureRedirect: `${process.env.CLIENT_URL}/auth`,
    })
  );

  // Route for post-authentication processing after successful Google OAuth authentication.
  router.get("/auth/login/success", async (req, res) => {
    try {
      if (req.user) {
        const existingUser = await User.findOne({ email: req.user.emails[0].value.toUpperCase() });

        // If the user exists in the database, redirect them to the client's main page.
        // If the user doesn't exist, create a new user, save them to the database, and then redirect to the client's main page.
        if (existingUser) {
          res.redirect(`${process.env.CLIENT_URL}`);
        } else {
          const user = new User({
            email: req.user.emails[0].value.toUpperCase(),
            password: "password_placeholder",
          });
          await user.save();
          res.redirect(`${process.env.CLIENT_URL}`);
        }
        
      } else {
        res.status(403).json({ error: true, message: "Not Authorized" });
      }
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Server error" });
    }
  });

// Handles user log-out. It logs the user out of the session and sends a success message if successful.
router.get("/log-out", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    return res.status(200).send({ message: "Successfully logged out!" });
  });
});

module.exports = router;