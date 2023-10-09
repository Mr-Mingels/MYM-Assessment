const path = require("path");
require("dotenv").config();
const express = require("express");
const session = require("express-session");
const MongoDBStore = require("connect-mongo");
const cors = require("cors");
const {
  localStrategy,
  session: passportSession,
} = require("./controllers/authController");
const connectToMongoDb = require("./controllers/mongoController");
const authRoutes = require("./routes/authRoutes");
const nasaAPIRoutes = require("./routes/nasaAPIRoutes");
const app = express();

app.use(cors({ origin: ["http://localhost:3000", "https://pierre-mingels-mym-assessment.vercel.app"], credentials: true }));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "secret",
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 },
    resave: true,
    saveUninitialized: true,
    store: new MongoDBStore({
      mongoUrl: process.env.MONGODB_URL,
      collection: "mySessions",
    }),
  })
);

app.use(localStrategy);
app.use(passportSession);

const startServer = async () => {
  // Connect to MongoDB first
  await connectToMongoDb(); 

  app.use(authRoutes);
  app.use(nasaAPIRoutes);

  // Checks if user is logged in. If the user is logged in, it'll send the user's email to the client side; otherwise, send a 401 Unauthorized error
  app.get("/user-info", (req, res) => {
    if (req.isAuthenticated()) {
      if (req.user.provider === 'google') {
          res.status(200).json(req.user.emails[0].value);
      } else {
          res.status(200).json(req.user.email);
      }
    } else {
      res.status(401).send("Unauthorized");
    }
  });

  app.use(express.static(path.join(__dirname, '../../build')));

  // Handle any remaining requests by serving the client's index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../build', 'index.html'));
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
