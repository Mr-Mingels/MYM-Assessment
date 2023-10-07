const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/image-of-the-day", async (req, res) => {
  try {
    // Fetch the Astronomy Picture of the Day (APOD) data from NASA's API
    const response = await axios.get(
      `https://api.nasa.gov/planetary/apod?api_key=${process.env.NASA_API_KEY}`
    );

    // Check if the external API responded with a status code of 200
    if (response.status === 200) {
      // If successful, send the retrieved APOD data as a JSON response
      res.status(200).json(response.data);
    } else {
      // If the API returned an unexpected status code, send an error response
      res.status(response.status).send({ message: "Unexpected status code" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Server error" });
  }
});

module.exports = router;
