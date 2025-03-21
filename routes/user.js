const express = require("express");
const router = express.Router();
const User = require("../models/User");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

router.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Tous les champs sont requis." });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Cet email est déjà utilisé." });
    }

    const salt = uid2(16);
    const hash = SHA256(password + salt).toString(encBase64);
    const token = uid2(32);

    const newUser = new User({ email, salt, hash, token });
    await newUser.save();

    res.status(201).json({
      token: newUser.token,
      _id: newUser._id,
    });
  } catch (error) {
    console.error("❌ Erreur lors de l'inscription :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Tous les champs sont requis." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Utilisateur non trouvé." });
    }

    const hash = SHA256(password + user.salt).toString(encBase64);
    console.log("🔍 Hash attendu :", user.hash);
    console.log("🔍 Hash reçu :", hash);

    if (hash !== user.hash) {
      return res.status(400).json({ message: "Mot de passe incorrect." });
    }

    res.json({ token: user.token, _id: user._id });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur." });
  }
});
router.post("/favorites", async (req, res) => {
  try {
    const { token, item } = req.body;

    const user = await User.findOne({ token });
    if (!user) {
      return res.status(401).json({ message: "Utilisateur non trouvé." });
    }

    const isFavorite = user.favorites.some((fav) => fav._id === item._id);
    if (!isFavorite) {
      user.favorites.push(item);
      await user.save();
    }

    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/favorites", async (req, res) => {
  try {
    const { token } = req.query;

    const user = await User.findOne({ token });
    if (!user) {
      return res.status(401).json({ message: "Utilisateur non trouvé." });
    }

    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/favorites/remove", async (req, res) => {
  try {
    const { token, itemId } = req.body;

    const user = await User.findOne({ token });
    if (!user) {
      return res.status(401).json({ message: "Utilisateur non trouvé." });
    }

    user.favorites = user.favorites.filter((fav) => fav._id !== itemId);
    await user.save();

    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
