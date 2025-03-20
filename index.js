require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connecté avec succès"))
  .catch((error) =>
    console.error("❌ Erreur de connexion MongoDB :", error.message)
  );

const app = express();
app.use(express.json());
app.use(cors());

const userRoutes = require("./routes/user");
app.use(userRoutes);

const MARVEL_API_URL = "https://lereacteur-marvel-api.herokuapp.com";
const API_KEY = process.env.MARVEL_API_KEY;

app.get("/characters", async (req, res) => {
  try {
    const { limit = 100, skip = 0, name } = req.query;
    const response = await axios.get(`${MARVEL_API_URL}/characters`, {
      params: { apiKey: API_KEY, limit, skip, name },
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/comics", async (req, res) => {
  try {
    const { limit = 100, skip = 0, title } = req.query;
    const response = await axios.get(`${MARVEL_API_URL}/comics`, {
      params: { apiKey: API_KEY, limit, skip, title },
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/comics/:characterId", async (req, res) => {
  try {
    const { characterId } = req.params;
    const response = await axios.get(
      `${MARVEL_API_URL}/comics/${characterId}`,
      {
        params: { apiKey: API_KEY },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/character/:characterId", async (req, res) => {
  try {
    const { characterId } = req.params;
    const response = await axios.get(
      `${MARVEL_API_URL}/character/${characterId}`,
      {
        params: { apiKey: API_KEY },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/comic/:comicId", async (req, res) => {
  try {
    const { comicId } = req.params;
    const response = await axios.get(`${MARVEL_API_URL}/comic/${comicId}`, {
      params: { apiKey: API_KEY },
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Serveur backend opérationnel sur le port ${PORT}`);
});
