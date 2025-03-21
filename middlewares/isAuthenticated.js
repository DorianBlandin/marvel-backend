const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  try {
    const token =
      req.headers.authorization || req.body.token || req.query.token;

    if (!token) {
      return res.status(401).json({ message: "Token manquant." });
    }

    const user = await User.findOne({ token });

    if (!user) {
      return res.status(401).json({ message: "Utilisateur non trouvé." });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ message: "Erreur d'authentification." });
  }
};

module.exports = isAuthenticated;
