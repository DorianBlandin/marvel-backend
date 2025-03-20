const express = require("express");
const router = express.Router();
const User = require("../models/User");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

router.post("/signup", async (req, res) => {
  try {
    const { email, username, password } = req.body;
    console.log("📩 Données reçues pour inscription :", req.body);

    if (!email || !username || !password) {
      return res.status(400).json({ message: "Tous les champs sont requis." });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log("❌ Cet email est déjà utilisé :", email);
      return res.status(400).json({ message: "Cet email est déjà utilisé." });
    }

    const salt = uid2(16);
    const hash = SHA256(password + salt).toString(encBase64);
    const token = uid2(32);

    const newUser = new User({ email, username, salt, hash, token });
    await newUser.save();

    console.log("✅ Utilisateur créé :", newUser);

    res.status(201).json({
      token: newUser.token,
      _id: newUser._id,
      username: newUser.username,
    });
  } catch (error) {
    console.error("❌ Erreur lors de l'inscription :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("📩 Tentative de connexion avec :", req.body);

    if (!email || !password) {
      return res.status(400).json({ message: "Tous les champs sont requis." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ Utilisateur non trouvé :", email);
      return res.status(400).json({ message: "Utilisateur non trouvé." });
    }

    console.log("🔑 Utilisateur trouvé :", user);

    const hash = SHA256(password + user.salt).toString(encBase64);
    console.log("🔍 Hash attendu :", user.hash);
    console.log("🔍 Hash reçu :", hash);

    if (hash !== user.hash) {
      console.log("❌ Mot de passe incorrect");
      return res.status(400).json({ message: "Mot de passe incorrect." });
    }

    console.log("✅ Connexion réussie pour :", user.username);

    res.json({ token: user.token, _id: user._id, username: user.username });
  } catch (error) {
    console.error("❌ Erreur lors de la connexion :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

module.exports = router;
