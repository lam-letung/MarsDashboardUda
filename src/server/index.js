require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const path = require("path");

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/", express.static(path.join(__dirname, "../public")));
app.use("/", express.static(path.join(__dirname, "../dist")));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../dist/index.html'));
});

app.get("/rovers", async (req, res) => {
  try {
    const rovers = await fetch(
      `${process.env.API_DOMAIN}/rovers?api_key=${process.env.API_KEY}`
    );
    data = await rovers.json();
    res.send(data);
  } catch (error) {
    console.error("An error occurred while retrieving rover data:", error);
    res.status(500).send("Internal server error!!!");
  }
});

app.get("/rovers/:name", async (req, res) => {
  try {
    const { name } = req.params;
    const earthDate = req.query.max_date;
    const response = await fetch(
      `${process.env.API_DOMAIN}/rovers/${name}/photos?earth_date=${earthDate}&api_key=${process.env.API_KEY}`
    );
    const data = await response.json();
    res.send(data);
  } catch (err) {
    console.error(
      "An error occurred while retrieving images from the rover:",
      error
    );
    res.status(500).send("Internal server error!!!");
  }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
