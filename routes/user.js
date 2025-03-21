const express = require("express");
const router = express.Router();
const User = require("../models/User");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");
const isAuthenticated = require("../middlewares/isAuthenticated");

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
    if (hash !== user.hash) {
      return res.status(400).json({ message: "Mot de passe incorrect." });
    }

    res.json({ token: user.token, _id: user._id });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur." });
  }
});

router.post("/favorites", isAuthenticated, async (req, res) => {
  try {
    const { item, type } = req.body;
    const user = req.user;

    if (!item || !type) {
      return res.status(400).json({ message: "Item ou type manquant." });
    }

    const list =
      type === "character" ? user.favoriteCharacters : user.favoriteComics;

    const isAlreadyFavorite = list.some((fav) => fav._id === item._id);
    if (!isAlreadyFavorite) {
      list.push(item);
      await user.save();
    }

    res.json({
      favoriteCharacters: user.favoriteCharacters,
      favoriteComics: user.favoriteComics,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/favorites/remove", isAuthenticated, async (req, res) => {
  try {
    const { itemId, type } = req.body;
    const user = req.user;

    if (!itemId || !type) {
      return res.status(400).json({ message: "itemId ou type manquant." });
    }

    if (type === "character") {
      user.favoriteCharacters = user.favoriteCharacters.filter(
        (fav) => fav._id !== itemId
      );
    } else if (type === "comic") {
      user.favoriteComics = user.favoriteComics.filter(
        (fav) => fav._id !== itemId
      );
    }

    await user.save();

    res.json({
      favoriteCharacters: user.favoriteCharacters,
      favoriteComics: user.favoriteComics,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/favorites", isAuthenticated, async (req, res) => {
  try {
    const user = req.user;
    res.json({
      favoriteCharacters: user.favoriteCharacters,
      favoriteComics: user.favoriteComics,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
