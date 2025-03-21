const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  hash: { type: String, required: true },
  salt: { type: String, required: true },
  token: { type: String, required: true },
  favoriteCharacters: {
    type: [Object],
    default: [],
  },
  favoriteComics: {
    type: [Object],
    default: [],
  },
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
